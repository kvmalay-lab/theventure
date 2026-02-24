import { Dumbbell, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">FitFlex</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Advanced AI-powered exercise tracking using MediaPipe technology. Transform your workouts with real-time pose detection and automatic rep counting.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Github className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a
                href="mailto:contact@fitflex.ai"
                className="w-10 h-10 bg-gray-800 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#exercises" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Exercises
                </a>
              </li>
              <li>
                <a href="#download" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Download
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2024 FitFlex. All rights reserved. Built with MediaPipe and AI.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">
                License
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
