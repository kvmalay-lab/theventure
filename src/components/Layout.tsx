import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/workout', label: 'Start Workout', icon: Dumbbell },
    { path: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-teal-500 rounded-lg text-white"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-gray-800/50 backdrop-blur-md border-r border-teal-500/20 transition-transform duration-300 z-40`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-12 mt-12 md:mt-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FitFlex</span>
          </Link>

          <nav className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-teal-500/20">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">FitFlex v1.0</p>
            <p className="text-xs text-teal-400">AI-Powered Fitness Tracking</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full md:w-0">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
