import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Activity, Target, Flame } from 'lucide-react';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useEffect, useState } from 'react';

interface ChartData {
  day: string;
  reps: number;
  workouts: number;
}

export default function Dashboard() {
  const { getStatistics, getChartData, getWeekSessions, isLoading } = useWorkoutHistory();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    avgReps: 0,
    favoriteExercise: 'None',
    avgAccuracy: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setStats(getStatistics());
      setChartData(getChartData());
    }
  }, [isLoading, getStatistics, getChartData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your fitness progress and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Activity}
          label="Total Workouts"
          value={stats.totalWorkouts}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Total Reps"
          value={stats.totalReps}
          color="teal"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Reps"
          value={stats.avgReps}
          color="green"
        />
        <StatCard
          icon={Flame}
          label="Avg Accuracy"
          value={`${stats.avgAccuracy}%`}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-md border border-teal-500/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Reps This Week</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(45, 212, 191, 0.2)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgb(255, 255, 255)' }}
              />
              <Bar dataKey="reps" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                  <stop offset="100%" stopColor="rgb(45, 212, 191)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md border border-teal-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Summary</h3>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Favorite Exercise</p>
              <p className="text-2xl font-bold text-teal-400">{stats.favoriteExercise}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">This Week</p>
              <p className="text-2xl font-bold text-blue-400">
                {getWeekSessions().length} workouts
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Consistency</p>
              <div className="flex gap-1 mt-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-gray-700 rounded-sm hover:bg-teal-500/50 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md border border-teal-500/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Weekly Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgb(255, 255, 255)' }}
            />
            <Line
              type="monotone"
              dataKey="reps"
              stroke="rgb(45, 212, 191)"
              strokeWidth={2}
              dot={{ fill: 'rgb(59, 130, 246)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'teal' | 'green' | 'orange';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    teal: 'from-teal-500/20 to-teal-500/5 border-teal-500/20',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/20',
  };

  const textColorMap = {
    blue: 'text-blue-400',
    teal: 'text-teal-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-900/50 ${textColorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
