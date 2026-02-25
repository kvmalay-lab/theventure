import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import AICoachChat from '../components/AICoachChat';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

interface ExerciseType {
  name: string;
  description: string;
}

const exercises: Record<string, ExerciseType> = {
  bicep_curl: {
    name: 'Bicep Curl',
    description: 'Track your bicep curl form and reps',
  },
  lat_pulldown: {
    name: 'Lat Pulldown',
    description: 'Track your lat pulldown form and reps',
  },
};

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { addSession } = useWorkoutHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedExercise, setSelectedExercise] = useState<string>('bicep_curl');
  const [isLoading, setIsLoading] = useState(true);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [coachCue, setCoachCue] = useState('Good Form');
  const [angles, setAngles] = useState({ left: 0 });
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          });
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access error:', error);
      }
    };
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, 640, 480);
        drawSkeletonOverlay(ctx);

        const angle = Math.floor(Math.random() * (160 - 30 + 1)) + 30;
        setAngles({ left: angle });

        const cues = ['Good Form', 'Elbows Up', 'Full ROM', 'Keep Control'];
        setCoachCue(cues[Math.floor(Math.random() * cues.length)]);
      }
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, []);

  const drawSkeletonOverlay = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';

    const joints = [
      { x: 320, y: 100 },
      { x: 280, y: 200 },
      { x: 250, y: 320 },
      { x: 360, y: 200 },
      { x: 390, y: 320 },
    ];

    joints.forEach(joint => {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    ctx.lineTo(joints[1].x, joints[1].y);
    ctx.lineTo(joints[2].x, joints[2].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    ctx.lineTo(joints[3].x, joints[3].y);
    ctx.lineTo(joints[4].x, joints[4].y);
    ctx.stroke();
  };

  const handleEndSession = () => {
    const duration = Date.now() - sessionStartTime;
    addSession({
      date: new Date().toISOString(),
      exercise: selectedExercise,
      reps,
      sets,
      accuracy: 95,
      duration,
    });
    navigate('/history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workout session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">{exercises[selectedExercise].name}</h1>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-2 bg-teal-500/20 border border-teal-500/50 hover:border-teal-500 rounded-lg text-teal-300 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-teal-500/20 rounded-lg overflow-hidden mb-6">
          <div className="relative w-full aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full"
            />

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-teal-500/30">
              <div className="flex items-baseline gap-2">
                <span className="text-8xl font-bold text-teal-400">{reps}</span>
                <span className="text-lg text-gray-400">REPS</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-teal-500/30">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">ANGLE</p>
                <p className="text-6xl font-bold text-blue-400">{angles.left}°</p>
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border border-blue-500/30 max-w-lg">
              <p className="text-center text-2xl font-bold text-blue-300">{coachCue}</p>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-teal-500/30">
              <p className="text-sm text-gray-400">
                Sets: <span className="text-teal-400 font-bold">{sets}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-teal-500/20 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Current Exercise</p>
            <p className="text-2xl font-bold text-teal-400">{exercises[selectedExercise].name}</p>
          </div>
          <div className="bg-gray-800/50 border border-teal-500/20 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Rep Count</p>
            <p className="text-4xl font-bold text-blue-400">{reps}</p>
          </div>
          <div className="bg-gray-800/50 border border-teal-500/20 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Set Count</p>
            <p className="text-4xl font-bold text-green-400">{sets}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-gray-800/50 border border-teal-500/20 rounded-lg p-4">
            <label className="text-sm text-gray-400 mb-3 block">Select Exercise</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-gray-900 border border-teal-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {Object.entries(exercises).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setReps(Math.max(0, reps - 1))}
              className="flex-1 px-4 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 rounded-lg text-red-400 font-semibold transition-colors"
            >
              - Rep
            </button>
            <button
              onClick={() => setReps(reps + 1)}
              className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 rounded-lg text-green-400 font-semibold transition-colors"
            >
              + Rep
            </button>
            <button
              onClick={() => setSets(Math.max(0, sets - 1))}
              className="flex-1 px-4 py-3 bg-orange-500/20 border border-orange-500/50 hover:bg-orange-500/30 rounded-lg text-orange-400 font-semibold transition-colors"
            >
              - Set
            </button>
            <button
              onClick={() => setSets(sets + 1)}
              className="flex-1 px-4 py-3 bg-orange-500/20 border border-orange-500/50 hover:bg-orange-500/30 rounded-lg text-orange-400 font-semibold transition-colors"
            >
              + Set
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEndSession}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      <AICoachChat
        coachCue={coachCue}
        exercise={exercises[selectedExercise].name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
