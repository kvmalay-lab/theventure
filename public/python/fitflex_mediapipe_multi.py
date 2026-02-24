"""
FitFlex MediaPipe multi-exercise tracker (bicep curl + lat pulldown)

Camera mode and CSV playback
One-Euro smoothing per landmark
Ensemble heuristics + calibration
Transparent overlay export (RGBA PNG frames)
Session summary JSON export (no raw video)
"""
import cv2
import mediapipe as mp
import numpy as np
import time
import json
import argparse
from collections import deque, defaultdict
from pathlib import Path
import os
import math

# Configurable parameters
FRAME_W = 640
FRAME_H = 480

# One-Euro filter params
ONE_EURO_FREQ = 30.0
ONE_EURO_MIN_CUTOFF = 1.0
ONE_EURO_BETA = 0.007
ONE_EURO_D_CUTOFF = 1.0

# Angle smoothing window (frames)
ANGLE_WINDOW = 5

# Rep timing constraints
MIN_REP_MS = 250
MAX_REP_MS = 8000
SET_IDLE_S = 10

# Calibration
CALIB_SAMPLES = 3

# Overlay export
OVERLAY_DIR = Path("overlays")
OVERLAY_DIR.mkdir(exist_ok=True)

# Privacy: do not save raw video by default
SAVE_RAW_VIDEO = False

# Utilities
mp_pose = mp.solutions.pose

def now_ms():
    return int(time.time() * 1000)

def angle_deg(a, b, c):
    """Calculate angle at point b given points a, b, c in (x, y) coords."""
    ba = np.array(a) - np.array(b)
    bc = np.array(c) - np.array(b)
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    angle = np.arccos(np.clip(cosine, -1.0, 1.0))
    return np.degrees(angle)

# One-Euro filter implementation
class OneEuro:
    def __init__(self, freq=ONE_EURO_FREQ, min_cutoff=ONE_EURO_MIN_CUTOFF, beta=ONE_EURO_BETA, d_cutoff=ONE_EURO_D_CUTOFF):
        self.freq = float(freq)
        self.min_cutoff = float(min_cutoff)
        self.beta = float(beta)
        self.d_cutoff = float(d_cutoff)
        self.x_prev = None
        self.dx_prev = 0.0
        self.t_prev = None

    def alpha(self, cutoff, dt):
        tau = 1.0 / (2 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def filter(self, x, t_ms):
        t = t_ms / 1000.0
        if self.t_prev is None:
            self.t_prev = t
            self.x_prev = x
            self.dx_prev = 0.0
            return x
        dt = max(1e-6, t - self.t_prev)
        dx = (x - self.x_prev) / dt
        a_d = self.alpha(self.d_cutoff, dt)
        dx_hat = a_d * dx + (1 - a_d) * self.dx_prev
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self.alpha(cutoff, dt)
        x_hat = a * x + (1 - a) * self.x_prev
        # update
        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t
        return x_hat

# Pose smoothing manager
class PoseSmoother:
    def __init__(self, num_landmarks=33):
        self.num = num_landmarks
        # per-landmark per-axis filters
        self.filters = {}
        for i in range(self.num):
            self.filters[(i,'x')] = OneEuro()
            self.filters[(i,'y')] = OneEuro()
            self.filters[(i,'z')] = OneEuro()

    def smooth(self, landmarks, t_ms):
        # landmarks: list of (x_px, y_px, z, visibility)
        out = []
        for i, lm in enumerate(landmarks):
            x, y, z, v = lm
            sx = self.filters[(i,'x')].filter(x, t_ms)
            sy = self.filters[(i,'y')].filter(y, t_ms)
            sz = self.filters[(i,'z')].filter(z, t_ms)
            out.append((sx, sy, sz, v))
        return out

# Rep detectors for exercises
class ExerciseDetector:
    def __init__(self, name, bottom_th, top_th, min_amp=25):
        self.name = name
        self.bottom_th = bottom_th
        self.top_th = top_th
        self.min_amp = min_amp
        self.rep_count = 0
        self.set_count = 0
        self.stage = None
        self.last_rep_ts = 0
        self.angle_hist = deque(maxlen=ANGLE_WINDOW)
        self.set_timer_start = None
        self.calib_mode = False
        self.calib_samples = []

    def start_calibration(self):
        self.calib_mode = True
        self.calib_samples = []
        print(f"[{self.name}] Calibration started. Perform {CALIB_SAMPLES} clean bottoms.")

    def finish_calibration(self):
        if not self.calib_samples:
            print(f"[{self.name}] Calibration: no samples.")
            self.calib_mode = False
            return
        mean_bottom = float(np.mean(self.calib_samples))
        amp = max(self.min_amp, 160.0 - mean_bottom - 5.0)
        self.bottom_th = mean_bottom + 2.0
        self.top_th = min(170.0, mean_bottom + amp)
        self.calib_mode = False
        print(f"[{self.name}] Calibrated: bottom={self.bottom_th:.1f}, top={self.top_th:.1f}, amp={amp:.1f}")

    def reset(self):
        self.rep_count = 0
        self.set_count = 0
        self.stage = None
        self.last_rep_ts = 0
        self.angle_hist.clear()
        self.set_timer_start = None
        self.calib_mode = False
        self.calib_samples = []

    def update(self, angle_deg):
        tnow = now_ms()
        self.angle_hist.append(angle_deg)
        avg_angle = float(np.mean(self.angle_hist))

        if self.calib_mode:
            # sample bottoms when angle small and spaced
            if avg_angle < 100 and (not self.calib_samples or (len(self.calib_samples) < CALIB_SAMPLES and (tnow - self.last_rep_ts) > 400)):
                self.calib_samples.append(avg_angle)
                self.last_rep_ts = tnow
                print(f"[{self.name}] calib sample {len(self.calib_samples)}: {avg_angle:.1f}")
            if len(self.calib_samples) >= CALIB_SAMPLES:
                self.finish_calibration()
            return False, False

        rep_inc = False
        set_inc = False

        # state machine
        if avg_angle > self.top_th:
            if self.stage != 'down':
                self.stage = 'down'
        if avg_angle < self.bottom_th and self.stage == 'down':
            self.stage = 'up'
            # register rep if timing ok
            if self.last_rep_ts == 0 or (tnow - self.last_rep_ts >= MIN_REP_MS and tnow - self.last_rep_ts <= MAX_REP_MS):
                self.rep_count += 1
                rep_inc = True
                self.last_rep_ts = tnow
                self.set_timer_start = time.time()
        # set completion
        if self.set_timer_start and (time.time() - self.set_timer_start) > SET_IDLE_S and self.rep_count > 0:
            self.set_count += 1
            set_inc = True
            self.rep_count = 0
            self.set_timer_start = None

        return rep_inc, set_inc

# Multi-exercise manager (auto-switch)
class MultiExerciseManager:
    def __init__(self):
        # detectors: bicep curl and lat pulldown
        self.detectors = {
            'bicep_curl': ExerciseDetector('bicep_curl', bottom_th=40, top_th=160, min_amp=30),
            'lat_pulldown': ExerciseDetector('lat_pulldown', bottom_th=70, top_th=160, min_amp=30)
        }
        self.current = 'bicep_curl'  # default
        self.last_switch = 0
        self.history = deque(maxlen=30)

    def reset_all(self):
        for d in self.detectors.values():
            d.reset()

    def start_calibration(self, name=None):
        if name:
            self.detectors[name].start_calibration()
        else:
            for d in self.detectors.values():
                d.start_calibration()

    def finish_calibration(self, name=None):
        if name:
            self.detectors[name].finish_calibration()
        else:
            for d in self.detectors.values():
                d.finish_calibration()

    def analyze_and_switch(self, landmarks, vis):
        """
        Compute simple movement signatures and pick between bicep_curl and lat_pulldown.
        Signatures:
        - bicep_curl: large elbow flexion/extension with wrist vertical movement near shoulder level
        - lat_pulldown: large shoulder depression (wrist moves down from overhead) and torso involvement
        """
        # helper to get pixel coords
        def p(idx):
            x,y,z,v = landmarks[idx]
            return (x,y)
        # indices
        L = mp_pose.PoseLandmark
        # compute elbow angles both sides
        left_elbow_angle = angle_deg(p(L.LEFT_SHOULDER.value), p(L.LEFT_ELBOW.value), p(L.LEFT_WRIST.value)) if vis[L.LEFT_SHOULDER.value] > 0.3 else 0.0
        right_elbow_angle = angle_deg(p(L.RIGHT_SHOULDER.value), p(L.RIGHT_ELBOW.value), p(L.RIGHT_WRIST.value)) if vis[L.RIGHT_SHOULDER.value] > 0.3 else 0.0
        elbow_amp = max(0.0, 180.0 - min(left_elbow_angle, right_elbow_angle))  # larger when flexed

        # wrist vertical displacement relative to shoulder
        wrist_disp = 0.0
        if vis[L.LEFT_WRIST.value] > 0.3 and vis[L.LEFT_SHOULDER.value] > 0.3:
            wrist_disp += abs(landmarks[L.LEFT_WRIST.value][1] - landmarks[L.LEFT_SHOULDER.value][1])
        if vis[L.RIGHT_WRIST.value] > 0.3 and vis[L.RIGHT_SHOULDER.value] > 0.3:
            wrist_disp += abs(landmarks[L.RIGHT_WRIST.value][1] - landmarks[L.RIGHT_SHOULDER.value][1])

        # shoulder vertical range (for pulldown: wrist starts high then moves down)
        shoulder_y = 0.0
        cnt = 0
        if vis[L.LEFT_SHOULDER.value] > 0.3:
            shoulder_y += landmarks[L.LEFT_SHOULDER.value][1]; cnt += 1
        if vis[L.RIGHT_SHOULDER.value] > 0.3:
            shoulder_y += landmarks[L.RIGHT_SHOULDER.value][1]; cnt += 1
        shoulder_y = shoulder_y / cnt if cnt else 0.0

        # hip involvement (lat pulldown often has torso lean)
        hip_y = 0.0; cnt2 = 0
        if vis[L.LEFT_HIP.value] > 0.3:
            hip_y += landmarks[L.LEFT_HIP.value][1]; cnt2 += 1
        if vis[L.RIGHT_HIP.value] > 0.3:
            hip_y += landmarks[L.RIGHT_HIP.value][1]; cnt2 += 1
        hip_y = hip_y / cnt2 if cnt2 else 0.0

        # signature scoring
        # bicep score: elbow amplitude high and wrist_disp moderate
        bicep_score = elbow_amp * 1.2 + wrist_disp * 0.5
        # lat pulldown score: wrist moves from high to low relative to shoulder and torso involvement
        lat_score = wrist_disp * 1.5 + max(0.0, (hip_y - shoulder_y)) * 0.8

        scores = {'bicep_curl': bicep_score, 'lat_pulldown': lat_score}
        chosen = max(scores.items(), key=lambda x: x[1])[0]

        # hysteresis: only switch if chosen score significantly higher and 1s since last switch
        tnow = time.time()
        if chosen != self.current and (tnow - self.last_switch) > 1.0:
            if scores[chosen] > scores[self.current] * 1.2 + 1.0:
                print(f"[AutoSwitch] {self.current} -> {chosen} (scores: {scores})")
                self.current = chosen
                self.last_switch = tnow

        return self.current

    def update_current(self, angle):
        det = self.detectors[self.current]
        return det.update(angle)

# Drawing overlay (transparent)
def draw_overlay_rgba(frame, landmarks, vis, connections):
    """
    Draw neon exoskeleton on transparent overlay and composite with frame.
    Returns composited BGR image (no alpha) for display and optionally saves RGBA overlay.
    """
    h, w = frame.shape[:2]
    # create RGBA overlay
    overlay = np.zeros((h, w, 4), dtype=np.uint8)
    glow_color = (46, 230, 166, 255)  # RGBA
    bone_color = (255, 255, 255, 30)

    # draw faint bones
    for (a,b) in connections:
        if vis[a] < 0.3 or vis[b] < 0.3:
            continue
        p1 = (int(landmarks[a][0]), int(landmarks[a][1]))
        p2 = (int(landmarks[b][0]), int(landmarks[b][1]))
        cv2.line(overlay, p1, p2, bone_color, 6, lineType=cv2.LINE_AA)

    # neon bones
    for (a,b) in connections:
        if vis[a] < 0.3 or vis[b] < 0.3:
            continue
        p1 = (int(landmarks[a][0]), int(landmarks[a][1]))
        p2 = (int(landmarks[b][0]), int(landmarks[b][1]))
        cv2.line(overlay, p1, p2, glow_color, 2, lineType=cv2.LINE_AA)

    # blur glow (approx)
    rgb = overlay[..., :3]
    alpha = overlay[..., 3]
    blurred = cv2.GaussianBlur(rgb, (21,21), 0)
    overlay[..., :3] = cv2.addWeighted(rgb, 0.4, blurred, 0.6, 0)

    # joints
    for i, (x,y,z,v) in enumerate(landmarks):
        if vis[i] < 0.3:
            continue
        cx, cy = int(x), int(y)
        cv2.circle(overlay, (cx, cy), 8, (11,18,32,255), -1, lineType=cv2.LINE_AA)
        cv2.circle(overlay, (cx, cy), 8, glow_color, 2, lineType=cv2.LINE_AA)

    # composite overlay onto frame (alpha blending)
    alpha_f = overlay[..., 3:4].astype(float) / 255.0
    out_rgb = (overlay[..., :3].astype(float) * alpha_f + frame.astype(float) * (1 - alpha_f)).astype(np.uint8)
    return out_rgb, overlay  # overlay RGBA available for saving

# CSV helpers
def export_landmarks_to_csv(landmarks, vis, out_path):
    """
    Append a frame's landmarks to CSV:
    timestamp,x0,y0,v0,x1,y1,v1,...,x32,y32,v32
    Coordinates are pixel coords.
    """
    ts = now_ms()
    row = [str(ts)]
    for i in range(len(landmarks)):
        x,y,z,v = landmarks[i]
        row += [f"{x:.3f}", f"{y:.3f}", f"{v:.3f}"]
    header = ["timestamp"] + [f"{c}{i}" for i in range(33) for c in ("x","y","v")]
    write_header = not Path(out_path).exists()
    with open(out_path, "a") as f:
        if write_header:
            f.write(",".join(header) + "\n")
        f.write(",".join(row) + "\n")

def read_landmarks_csv(path):
    import csv
    with open(path, newline='') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)
        for row in reader:
            ts = int(row[0])
            landmarks = []
            vis = []
            for i in range(33):
                xi = float(row[1 + i*3])
                yi = float(row[1 + i*3 + 1])
                vi = float(row[1 + i*3 + 2])
                landmarks.append((xi, yi, 0.0, vi))
                vis.append(vi)
            yield ts, landmarks, vis

# Main application
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=str, help="Path to landmarks CSV for playback (optional)")
    parser.add_argument("--export_overlay", action="store_true", help="Save RGBA overlay PNG frames to overlays/")
    args = parser.parse_args()

    mode = 'camera' if not args.csv else 'csv'
    cap = None
    csv_gen = None
    if mode == 'camera':
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_W)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_H)
    else:
        csv_gen = read_landmarks_csv(args.csv)

    smoother = PoseSmoother(num_landmarks=33)
    manager = MultiExerciseManager()
    session = {
        "start_time": now_ms(),
        "events": [],
        "reps": defaultdict(int),
        "sets": defaultdict(int),
        "mode": mode
    }

    prev_landmarks = None
    frame_idx = 0
    overlay_export = args.export_overlay

    with mp_pose.Pose(min_detection_confidence=0.6, min_tracking_confidence=0.6) as pose:
        connections = list(mp_pose.POSE_CONNECTIONS)
        print("[FitFlex] Multi-exercise tracker started. Mode:", mode)
        print("Controls: c=calibrate r=reset s=save e=exercise toggle o=overlay q=quit")
        while True:
            if mode == 'camera':
                ret, frame = cap.read()
                if not ret:
                    print("Camera read failed.")
                    break
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_rgb.flags.writeable = False
                results = pose.process(frame_rgb)
                frame_rgb.flags.writeable = True
                frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
                h, w = frame_bgr.shape[:2]
                if results.pose_landmarks:
                    lm = results.pose_landmarks.landmark
                    landmarks = []
                    vis = []
                    tms = now_ms()
                    for i, l in enumerate(lm):
                        x = l.x * w
                        y = l.y * h
                        z = l.z
                        v = l.visibility if hasattr(l, 'visibility') else 1.0
                        landmarks.append((x,y,z,v))
                        vis.append(v)
                    # smooth
                    landmarks = smoother.smooth(landmarks, now_ms())
                else:
                    landmarks = [(0.0,0.0,0.0,0.0)] * 33
                    vis = [0.0] * 33
            else:
                try:
                    ts, landmarks, vis = next(csv_gen)
                except StopIteration:
                    print("[CSV] Playback finished.")
                    break
                # landmarks already pixel coords
                landmarks = smoother.smooth(landmarks, now_ms())
                frame_bgr = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                h, w = FRAME_H, FRAME_W

            # auto-switch exercise
            current = manager.analyze_and_switch(landmarks, vis)

            # compute primary angle for current exercise
            L = mp_pose.PoseLandmark
            def p(idx): return (landmarks[idx][0], landmarks[idx][1])
            angle = 0.0
            if current == 'bicep_curl':
                # choose side with better visibility
                left_vis = vis[L.LEFT_SHOULDER.value] + vis[L.LEFT_ELBOW.value] + vis[L.LEFT_WRIST.value]
                right_vis = vis[L.RIGHT_SHOULDER.value] + vis[L.RIGHT_ELBOW.value] + vis[L.RIGHT_WRIST.value]
                side = 'RIGHT' if right_vis > left_vis else 'LEFT'
                s = getattr(L, f"{side}_SHOULDER").value
                e = getattr(L, f"{side}_ELBOW").value
                widx = getattr(L, f"{side}_WRIST").value
                if vis[s] > 0.2 and vis[e] > 0.2 and vis[widx] > 0.2:
                    angle = angle_deg(p(s), p(e), p(widx))
            elif current == 'lat_pulldown':
                # lat pulldown: track shoulder-elbow-wrist angle and wrist vertical displacement from overhead
                left_vis = vis[L.LEFT_SHOULDER.value] + vis[L.LEFT_ELBOW.value] + vis[L.LEFT_WRIST.value]
                right_vis = vis[L.RIGHT_SHOULDER.value] + vis[L.RIGHT_ELBOW.value] + vis[L.RIGHT_WRIST.value]
                side = 'RIGHT' if right_vis > left_vis else 'LEFT'
                s = getattr(L, f"{side}_SHOULDER").value
                e = getattr(L, f"{side}_ELBOW").value
                widx = getattr(L, f"{side}_WRIST").value
                if vis[s] > 0.2 and vis[e] > 0.2 and vis[widx] > 0.2:
                    angle = angle_deg(p(s), p(e), p(widx))
                # for pulldown, also consider wrist y relative to shoulder y
                # we'll incorporate this in ensemble heuristics inside manager.update_current if needed

            # update detector for current exercise
            rep_inc, set_inc = manager.update_current(angle)
            if rep_inc:
                session['reps'][current] += 1
                session['events'].append({'type':'rep','exercise':current,'ts':now_ms(),'angle':angle})
            if set_inc:
                session['sets'][current] += 1
                session['events'].append({'type':'set','exercise':current,'ts':now_ms(),'sets':manager.detectors[current].set_count})

            # draw overlay and composite
            out_img, overlay_rgba = draw_overlay_rgba(frame_bgr, landmarks, vis, connections)

            # HUD
            cv2.rectangle(out_img, (0,0), (360,96), (10,10,12), -1)
            cv2.putText(out_img, f"Exercise: {current}", (12,22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (220,240,230), 1, cv2.LINE_AA)
            cv2.putText(out_img, f"Reps ({current}): {session['reps'][current]}", (12,48), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (46,230,166), 2, cv2.LINE_AA)
            cv2.putText(out_img, f"Sets ({current}): {session['sets'][current]}", (12,76), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (220,240,230), 1, cv2.LINE_AA)
            cv2.putText(out_img, "Keys: c=calib r=reset s=save e=exercise o=overlay q=quit", (12, out_img.shape[0]-12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160,160,160), 1, cv2.LINE_AA)

            cv2.imshow("FitFlex Multi-Exercise Tracker (Overlay)", out_img)

            # optionally save overlay RGBA as PNG for web embedding
            if overlay_export:
                # overlay_rgba is uint8 RGBA; save as PNG with alpha
                overlay_path = OVERLAY_DIR / f"overlay_{frame_idx:06d}.png"
                # convert RGBA to BGRA for OpenCV saving
                bgra = cv2.cvtColor(overlay_rgba, cv2.COLOR_RGBA2BGRA)
                cv2.imwrite(str(overlay_path), bgra)
                frame_idx += 1

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                manager.reset_all()
                for k in session['reps']: session['reps'][k] = 0
                for k in session['sets']: session['sets'][k] = 0
                session['events'].append({'type':'reset','ts':now_ms()})
                print("[Action] Reset all counts.")
            elif key == ord('c'):
                print("[Action] Starting calibration for both exercises.")
                manager.start_calibration()
            elif key == ord('s'):
                session['end_time'] = now_ms()
                outp = Path(f"session_summary_{int(time.time())}.json")
                outp.write_text(json.dumps(session, indent=2))
                print(f"[Saved] Session summary -> {outp}")
            elif key == ord('e'):
                # toggle explicit exercise selection: auto -> bicep_curl -> lat_pulldown -> auto
                if manager.current == 'bicep_curl' and manager.current != 'lat_pulldown':
                    manager.current = 'lat_pulldown'
                elif manager.current == 'lat_pulldown':
                    manager.current = 'bicep_curl'
                print(f"[Action] Exercise forced to: {manager.current}")
            elif key == ord('o'):
                overlay_export = not overlay_export
                print(f"[Action] Overlay export {'enabled' if overlay_export else 'disabled'}.")

    # cleanup
    if cap:
        cap.release()
    cv2.destroyAllWindows()
    # final save
    session['end_time'] = now_ms()
    outp = Path(f"session_summary_final_{int(time.time())}.json")
    outp.write_text(json.dumps(session, indent=2))
    print(f"[Saved] Final session summary -> {outp}")

if __name__ == "__main__":
    main()
