import { Download as DownloadIcon, FileCode, FileText, Github } from 'lucide-react';

export default function Download() {
  const files = [
    {
      icon: FileCode,
      name: 'fitflex_mediapipe_multi.py',
      description: 'Main Python script with MediaPipe integration',
      size: '~15KB',
    },
    {
      icon: FileText,
      name: 'requirements.txt',
      description: 'All required Python dependencies',
      size: '~1KB',
    },
    {
      icon: FileText,
      name: 'README.md',
      description: 'Complete setup and usage instructions',
      size: '~3KB',
    },
  ];

  return (
    <section id="download" className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get Started Today
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Download the complete FitFlex package and start tracking your workouts with AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 hover:border-teal-500/50 transition-all duration-300"
                >
                  <file.icon className="w-10 h-10 text-teal-400 mb-4" />
                  <h4 className="text-white font-semibold mb-2">{file.name}</h4>
                  <p className="text-gray-400 text-sm mb-2">{file.description}</p>
                  <span className="text-teal-400 text-xs">{file.size}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/python/fitflex_mediapipe_multi.py"
                download
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:shadow-teal-400/50 transition-all duration-300 transform hover:scale-105"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Python Script
              </a>
              <a
                href="/python/README.md"
                download
                className="flex items-center justify-center px-8 py-4 bg-gray-700/50 backdrop-blur-sm text-white text-lg font-semibold rounded-xl border-2 border-gray-600/50 hover:bg-gray-600/50 transition-all duration-300"
              >
                <Github className="w-5 h-5 mr-2" />
                Download Documentation
              </a>
            </div>
            <div className="mt-4 text-center">
              <a
                href="/python/requirements.txt"
                download
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Download requirements.txt
              </a>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4">System Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-teal-400 font-semibold mb-2">Software</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Python 3.8 or higher</li>
                  <li>• OpenCV 4.5+</li>
                  <li>• MediaPipe 0.10+</li>
                  <li>• NumPy 1.21+</li>
                </ul>
              </div>
              <div>
                <h4 className="text-teal-400 font-semibold mb-2">Hardware</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Webcam (720p or higher)</li>
                  <li>• 4GB RAM minimum</li>
                  <li>• Multi-core CPU recommended</li>
                  <li>• 100MB free disk space</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
