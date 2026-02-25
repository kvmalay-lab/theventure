import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Message {
  id: string;
  type: 'coach' | 'system';
  text: string;
  timestamp: number;
}

interface AICoachChatProps {
  coachCue: string;
  exercise: string;
  isOpen: boolean;
  onClose: () => void;
}

const coachMessages: Record<string, string> = {
  'Elbows Up': 'Keep your elbows tight to your body. This prevents shoulder strain.',
  'Elbows Too Flared': 'I notice your elbows are flaring. Keep them tucked to protect your shoulders.',
  'Full ROM': 'Great form! You\'re achieving full range of motion.',
  'Too Fast': 'Slow down and control the movement. Quality beats speed!',
  'Too Slow': 'Keep a steady pace. Maintain momentum throughout the rep.',
  'Core Tight': 'Good engagement! Keep your core tight throughout.',
  'Shoulders Back': 'Pull your shoulders back. Engage your back muscles properly.',
  'Knees In': 'Keep your knees aligned with your toes.',
  'Back Straight': 'Maintain an upright posture. Avoid leaning forward.',
  'Great Rep': 'Excellent form! That was a perfect repetition.',
};

export default function AICoachChat({ coachCue, exercise, isOpen, onClose }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      text: `Started ${exercise} training session. I'll provide real-time form feedback.`,
      timestamp: Date.now(),
    },
  ]);

  useEffect(() => {
    if (coachCue && coachCue !== 'Good Form') {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'coach',
        text: coachMessages[coachCue] || `${coachCue}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, [coachCue]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-800/95 backdrop-blur-md border border-teal-500/30 rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-teal-500/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <h3 className="font-semibold text-white">Fitness Coach</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'coach' ? 'justify-start' : 'justify-center'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.type === 'coach'
                  ? 'bg-teal-500/20 border border-teal-500/30 text-teal-100'
                  : 'bg-gray-700/50 text-gray-300 text-sm'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-teal-500/30 bg-gray-900/50">
        <p className="text-xs text-gray-400">
          Current Exercise: <span className="text-teal-400 font-semibold">{exercise}</span>
        </p>
      </div>
    </div>
  );
}
