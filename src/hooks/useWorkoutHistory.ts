import { useState, useEffect } from 'react';

export interface WorkoutSession {
  id: string;
  date: string;
  exercise: string;
  reps: number;
  sets: number;
  accuracy: number;
  duration: number;
}

export function useWorkoutHistory() {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem('tvl_history');
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  const addSession = (session: Omit<WorkoutSession, 'id'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: Date.now().toString(),
    };
    const updated = [newSession, ...history];
    setHistory(updated);
    localStorage.setItem('tvl_history', JSON.stringify(updated));
    return newSession;
  };

  const deleteSession = (id: string) => {
    const updated = history.filter(session => session.id !== id);
    setHistory(updated);
    localStorage.setItem('tvl_history', JSON.stringify(updated));
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return history.filter(s => new Date(s.date).toDateString() === today);
  };

  const getWeekSessions = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter(s => new Date(s.date) >= weekAgo);
  };

  const getMonthSessions = () => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    return history.filter(s => new Date(s.date) >= monthAgo);
  };

  const getStatistics = (sessions: WorkoutSession[] = history) => {
    if (sessions.length === 0) {
      return {
        totalWorkouts: 0,
        totalReps: 0,
        avgReps: 0,
        favoriteExercise: 'None',
        avgAccuracy: 0,
      };
    }

    const totalReps = sessions.reduce((sum, s) => sum + s.reps, 0);
    const avgReps = Math.round(totalReps / sessions.length);
    const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length);

    const exercises = sessions.reduce((acc, s) => {
      acc[s.exercise] = (acc[s.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteExercise = Object.entries(exercises).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

    return {
      totalWorkouts: sessions.length,
      totalReps,
      avgReps,
      favoriteExercise,
      avgAccuracy,
    };
  };

  const getChartData = () => {
    const weekSessions = getWeekSessions();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toDateString();
    });

    return days.map(day => {
      const daysSessions = weekSessions.filter(s => new Date(s.date).toDateString() === day);
      const reps = daysSessions.reduce((sum, s) => sum + s.reps, 0);
      return {
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        reps,
        workouts: daysSessions.length,
      };
    });
  };

  return {
    history,
    isLoading,
    addSession,
    deleteSession,
    getTodaySessions,
    getWeekSessions,
    getMonthSessions,
    getStatistics,
    getChartData,
  };
}
