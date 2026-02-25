import { useState, useEffect } from 'react';
import { Calendar, Trash2, TrendingUp } from 'lucide-react';
import { useWorkoutHistory, WorkoutSession } from '../hooks/useWorkoutHistory';

type TimeFilter = 'today' | 'week' | 'month';

export default function History() {
  const { history, deleteSession, getTodaySessions, getWeekSessions, getMonthSessions, getStatistics } = useWorkoutHistory();
  const [filter, setFilter] = useState<TimeFilter>('week');
  const [filteredSessions, setFilteredSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    avgReps: 0,
    favoriteExercise: 'None',
    avgAccuracy: 0,
  });

  useEffect(() => {
    let sessions: WorkoutSession[] = [];
    switch (filter) {
      case 'today':
        sessions = getTodaySessions();
        break;
      case 'week':
        sessions = getWeekSessions();
        break;
      case 'month':
        sessions = getMonthSessions();
        break;
    }
    setFilteredSessions(sessions);
    setStats(getStatistics(sessions));
  }, [filter, history, getTodaySessions, getWeekSessions, getMonthSessions, getStatistics]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatExerciseName = (exercise: string) => {
    return exercise
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Workout History</h1>
        <p className="text-gray-400">Track and analyze your workout sessions</p>
      </div>

      <div className="flex gap-3 mb-8">
        {(['today', 'week', 'month'] as const).map(timeFilter => (
          <button
            key={timeFilter}
            onClick={() => setFilter(timeFilter)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              filter === timeFilter
                ? 'bg-teal-500/30 border border-teal-500/50 text-teal-300'
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-teal-500/30'
            }`}
          >
            {timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatBox label="Total Workouts" value={stats.totalWorkouts} icon="📊" />
        <StatBox label="Total Reps" value={stats.totalReps} icon="💪" />
        <StatBox label="Avg Reps/Workout" value={stats.avgReps} icon="📈" />
        <StatBox label="Accuracy" value={`${stats.avgAccuracy}%`} icon="🎯" />
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No workouts found for this period</p>
          <p className="text-gray-500 text-sm mt-2">Start a workout session to see your history here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map(session => (
            <div
              key={session.id}
              className="bg-gray-800/50 border border-teal-500/20 hover:border-teal-500/50 rounded-lg p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{formatExerciseName(session.exercise)}</h3>
                    <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-sm text-teal-300">
                      {session.reps} reps
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{formatDate(session.date)}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Sets Completed</p>
                    <p className="text-2xl font-bold text-blue-400">{session.sets}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round(session.duration / 60000)}m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Accuracy</p>
                    <p className="text-2xl font-bold text-orange-400">{session.accuracy}%</p>
                  </div>

                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="bg-gray-800/50 border border-teal-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
