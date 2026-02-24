import { Eye, Zap, BarChart3, Shield, Cpu, Repeat } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Eye,
      title: 'Real-Time Pose Detection',
      description: 'Advanced MediaPipe technology tracks your movements with millisecond precision for accurate form analysis.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get immediate visual feedback on your exercise form with our neon exoskeleton overlay system.',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Automatic Rep Counting',
      description: 'Smart algorithms automatically count your reps and sets with 99% accuracy across multiple exercises.',
      gradient: 'from-blue-500 to-teal-500',
    },
    {
      icon: Cpu,
      title: 'AI-Powered Analysis',
      description: 'Machine learning models analyze your workout patterns and provide personalized insights.',
      gradient: 'from-teal-500 to-blue-500',
    },
    {
      icon: Repeat,
      title: 'Multi-Exercise Support',
      description: 'Seamlessly switch between bicep curls, lat pulldowns, and more with automatic exercise detection.',
      gradient: 'from-blue-600 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All processing happens locally on your device. Your workout data never leaves your computer.',
      gradient: 'from-teal-600 to-teal-500',
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to take your fitness tracking to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-teal-400/50 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
