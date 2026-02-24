import { Camera, Brain, TrendingUp, Award } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: 'Setup Your Camera',
      description: 'Position your camera to capture your full body during exercise. Works with any standard webcam.',
      color: 'blue',
    },
    {
      icon: Brain,
      title: 'AI Detection Starts',
      description: 'Our MediaPipe AI instantly detects your body pose and begins tracking your movements in real-time.',
      color: 'teal',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Reps',
      description: 'Perform your exercises naturally. FitFlex automatically counts reps and analyzes your form.',
      color: 'blue',
    },
    {
      icon: Award,
      title: 'Review & Improve',
      description: 'Access detailed session summaries and insights to continuously improve your workout performance.',
      color: 'teal',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in minutes with our simple 4-step process
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${
                      step.color === 'blue' ? 'from-blue-500 to-blue-600' : 'from-teal-500 to-teal-600'
                    } rounded-full flex items-center justify-center mb-6 shadow-lg ${
                      step.color === 'blue' ? 'shadow-blue-400/50' : 'shadow-teal-400/50'
                    }`}>
                      <step.icon className="w-10 h-10 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center border-2 border-teal-400">
                        <span className="text-teal-400 font-bold">{index + 1}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
