import { Dumbbell, ArrowDownToLine, Play } from 'lucide-react';

export default function Exercises() {
  const exercises = [
    {
      icon: Dumbbell,
      name: 'Bicep Curl',
      description: 'Track elbow flexion and extension with automatic rep counting. Monitors form and provides real-time feedback.',
      features: ['Automatic side detection', 'Angle tracking', 'Form analysis', 'Rep counting'],
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: ArrowDownToLine,
      name: 'Lat Pulldown',
      description: 'Monitor shoulder depression and arm movement. Tracks overhead to down motion with precision.',
      features: ['Shoulder tracking', 'Range of motion', 'Torso involvement', 'Set tracking'],
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <section id="exercises" className="py-24 bg-gray-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Supported Exercises
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced AI tracking for multiple exercise types with automatic detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${exercise.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg ${
                index === 0 ? 'shadow-blue-400/50' : 'shadow-teal-400/50'
              }`}>
                <exercise.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {exercise.name}
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed">
                {exercise.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {exercise.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-gray-300"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${exercise.gradient}`}></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-teal-900/30 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Play className="w-6 h-6 mr-2 text-teal-400" />
                Automatic Exercise Detection
              </h3>
              <p className="text-gray-300">
                FitFlex automatically detects which exercise you're performing and switches tracking modes seamlessly.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg text-white font-semibold">
                Smart AI Switching
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
