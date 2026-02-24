import { Activity, TrendingUp, Target } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-8 space-x-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/30 animate-float">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-teal-500/30 animate-float delay-300">
            <TrendingUp className="w-8 h-8 text-teal-400" />
          </div>
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/30 animate-float delay-700">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          AI-Powered
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Exercise Tracking
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Transform your workouts with real-time AI pose detection. Track bicep curls, lat pulldowns, and more with precision using advanced MediaPipe technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#download"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-teal-400/50 transition-all duration-300 transform hover:scale-105"
          >
            Download Now
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Learn More
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-teal-400 mb-2">99%</div>
            <div className="text-gray-300">Accuracy Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">Real-Time</div>
            <div className="text-gray-300">Feedback</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-teal-400 mb-2">Multi</div>
            <div className="text-gray-300">Exercise Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
