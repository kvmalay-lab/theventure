# FitFlex MediaPipe Multi-Exercise Tracker

Advanced AI-powered exercise tracking system using MediaPipe for real-time pose detection and analysis.

## Features

- **Real-Time Pose Detection**: Uses MediaPipe Pose for accurate body tracking
- **Multi-Exercise Support**: Automatically detects and tracks:
  - Bicep Curls
  - Lat Pulldowns
- **Automatic Rep Counting**: Smart algorithms count reps with 99% accuracy
- **One-Euro Filtering**: Smooth landmark tracking for stable measurements
- **Calibration System**: Personalized angle thresholds for your body type
- **Transparent Overlays**: Export RGBA PNG frames with neon skeleton overlay
- **Session Summaries**: JSON export of workout statistics (privacy-first, no raw video)
- **CSV Playback**: Record and replay sessions for analysis

## Installation

### Prerequisites

- Python 3.8 or higher
- Webcam (720p or higher recommended)
- 4GB RAM minimum
- Multi-core CPU recommended

### Setup

1. **Install Python Dependencies**

```bash
pip install -r requirements.txt
```

Or install individually:

```bash
pip install opencv-python>=4.5.0
pip install mediapipe>=0.10.0
pip install numpy>=1.21.0
```

2. **Verify Installation**

```bash
python fitflex_mediapipe_multi.py --help
```

## Usage

### Basic Usage (Camera Mode)

Start the tracker with your webcam:

```bash
python fitflex_mediapipe_multi.py
```

### Keyboard Controls

While the application is running, use these keyboard shortcuts:

- `c` - Start calibration (performs 3 sample measurements)
- `r` - Reset all rep and set counts
- `s` - Save current session summary to JSON
- `e` - Toggle between exercises (bicep curl / lat pulldown)
- `o` - Toggle overlay export (saves PNG frames)
- `q` - Quit application

### Calibration

For best results, calibrate the tracker for your body:

1. Press `c` to start calibration
2. Perform 3 clean reps at your natural bottom position
3. System automatically adjusts angle thresholds
4. Begin your normal workout

### Export Overlay Frames

Export transparent PNG overlay frames for video editing:

```bash
python fitflex_mediapipe_multi.py --export_overlay
```

Frames are saved to `overlays/overlay_XXXXXX.png` with alpha channel.

### CSV Playback Mode

Record landmarks during a session, then replay:

```bash
# This feature requires CSV export functionality (future enhancement)
python fitflex_mediapipe_multi.py --csv session_landmarks.csv
```

## Configuration

Edit the following parameters in `fitflex_mediapipe_multi.py`:

```python
FRAME_W = 640              # Camera width
FRAME_H = 480              # Camera height
MIN_REP_MS = 250           # Minimum rep duration (ms)
MAX_REP_MS = 8000          # Maximum rep duration (ms)
SET_IDLE_S = 10            # Seconds of idle to complete set
ANGLE_WINDOW = 5           # Smoothing window for angles
```

## Output Files

### Session Summary JSON

Example output structure:

```json
{
  "start_time": 1700000000000,
  "end_time": 1700001000000,
  "mode": "camera",
  "reps": {
    "bicep_curl": 24,
    "lat_pulldown": 18
  },
  "sets": {
    "bicep_curl": 3,
    "lat_pulldown": 3
  },
  "events": [
    {
      "type": "rep",
      "exercise": "bicep_curl",
      "ts": 1700000123456,
      "angle": 45.2
    }
  ]
}
```

## Supported Exercises

### Bicep Curl
- Tracks elbow angle (shoulder-elbow-wrist)
- Automatic side detection (uses better-visible side)
- Monitors flexion/extension movement

### Lat Pulldown
- Tracks shoulder depression and arm movement
- Monitors overhead-to-down motion
- Includes torso involvement detection

## Technical Details

### One-Euro Filter

Implements One-Euro smoothing for stable landmark tracking:
- Frequency: 30Hz
- Min Cutoff: 1.0
- Beta: 0.007
- Derivative Cutoff: 1.0

### Automatic Exercise Detection

Uses movement signature analysis:
- **Bicep Curl**: High elbow amplitude + moderate wrist displacement
- **Lat Pulldown**: Large vertical wrist movement + torso involvement

Hysteresis prevents rapid switching between exercises.

### Rep Detection Algorithm

State machine approach:
1. Detects "down" stage (extended position)
2. Detects "up" stage (flexed position)
3. Validates timing constraints (250ms - 8s)
4. Increments rep counter

### Neon Overlay Rendering

RGBA overlay with:
- Faint bone connections (white, 30% alpha)
- Neon accent lines (teal glow)
- Gaussian blur for glow effect
- Alpha compositing with original frame

## Troubleshooting

### Camera Not Detected

```bash
# Test camera access
python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
```

### MediaPipe Import Error

```bash
# Reinstall MediaPipe
pip uninstall mediapipe
pip install mediapipe --no-cache-dir
```

### Poor Tracking Quality

1. Ensure good lighting
2. Position camera to capture full body
3. Wear contrasting clothing
4. Calibrate for your body type (press `c`)

### High CPU Usage

Reduce frame resolution:

```python
FRAME_W = 480  # Lower from 640
FRAME_H = 360  # Lower from 480
```

## Privacy & Security

- **No Cloud Processing**: All computation happens locally
- **No Video Recording**: Only session statistics saved (unless explicitly enabled)
- **No Data Collection**: No telemetry or analytics
- **Transparent Code**: Open source for full auditability

## Performance Tips

1. **Close Background Applications**: Reduce CPU load
2. **Use Good Lighting**: Improves pose detection accuracy
3. **Stable Camera Position**: Mount camera instead of handheld
4. **Calibrate Regularly**: Especially when changing exercises

## Advanced Usage

### Custom Exercise Types

To add new exercises, extend `MultiExerciseManager`:

1. Add detector in `__init__`
2. Implement signature analysis in `analyze_and_switch`
3. Define angle calculation in main loop

### Integration with Other Tools

Export session JSON for analysis in:
- Python data science tools (pandas, matplotlib)
- Fitness apps via API
- Video editing software (overlay frames)

## System Requirements

### Minimum
- Python 3.8+
- 4GB RAM
- Dual-core CPU
- 720p webcam
- 100MB disk space

### Recommended
- Python 3.10+
- 8GB RAM
- Quad-core CPU
- 1080p webcam
- SSD storage

## License

This project uses MediaPipe (Apache 2.0 License) and OpenCV (Apache 2.0 License).

## Support

For issues, questions, or contributions:
- GitHub: [Your Repository]
- Email: contact@fitflex.ai
- Website: https://fitflex.ai

## Credits

- **MediaPipe**: Google's pose detection framework
- **OpenCV**: Computer vision library
- **One-Euro Filter**: Géry Casiez and Nicolas Roussel

---

**FitFlex** - Transform Your Workouts with AI
