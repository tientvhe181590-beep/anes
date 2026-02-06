import { useState } from 'react';
import { CalorieProgressWidget } from './components/CalorieProgressWidget';
import { WorkoutCard } from './components/WorkoutCard';
import { WeeklyCalendarWidget } from './components/WeeklyCalendarWidget';

// Temporary mock data until API integration in integration phase
const MOCK_DATA = {
  streak: 5,
  calories: {
    consumed: 1200,
    target: 2000,
  },
  workout: {
    id: '1',
    title: 'Lower Body Power',
    durationMinutes: 45,
    intensity: 'High',
  },
};

export default function DashboardScreen() {
  const [selectedIndex, setSelectedIndex] = useState(3); // Default to Thursday (Mock Today)

  const handleStartWorkout = (id: string) => {
    console.log('Starting workout:', id);
    // Navigation logic here
  };

  // Mock Logic: Future days have 0 consumed
  const isFuture = selectedIndex > 3; // Assuming 3 is "Today"
  const currentCalories = isFuture
    ? { consumed: 0, target: MOCK_DATA.calories.target }
    : MOCK_DATA.calories;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 text-[var(--text-primary)]">
      {/* Header / Greeting */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="font-[Sora] text-3xl font-bold">
          Hello, <span className="text-[var(--accent)]">Minh</span>
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">Ready to crush your goals?</p>
      </header>

      <main className="flex flex-col gap-6 px-6">
        {/* Calendar */}
        <WeeklyCalendarWidget selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

        {/* Calories */}
        <CalorieProgressWidget
          consumed={currentCalories.consumed}
          target={currentCalories.target}
        />

        {/* Workout */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Today's Workout</h2>
          <WorkoutCard {...MOCK_DATA.workout} onStart={handleStartWorkout} />
        </section>
      </main>
    </div>
  );
}
