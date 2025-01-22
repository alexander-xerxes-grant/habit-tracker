import React, { useState, useEffect } from 'react';
import Heatmap from './Heatmap';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/habits';

function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }

  const dayNumbers = completedDates.map((dateStr) => {
    const dateObj = new Date(dateStr);
    return Math.floor(dateObj.getTime() / (1000 * 60 * 60 * 24));
  });

  dayNumbers.sort((a, b) => a - b);

  const now = new Date();
  const todayDayNumber = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));

  let streak = 0;
  let currentDay = todayDayNumber;

  for (let i = dayNumbers.length - 1; i >= 0; i--) {
    if (dayNumbers[i] === currentDay) {
      streak++;
      currentDay--;
  } else if (dayNumbers[i] < currentDay) {
    break;
  }
}

return streak;
}

const HabitContainer = () => {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log('API Response:', response.data);
        setHabits(response.data);
      } catch (error) {
        console.error('Error fetching habits:', error);
      }
    };

    fetchHabits();
  }, []);

  const addHabit = async () => {
    try {
      const newHabitData = {
        name: `Habit ${habits.length + 1}`,
      };

      const response =  await axios.post(API_URL, newHabitData);

      setHabits([...habits, response.data]);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabitDay = async (habitId, dateToToggle) => {
    try {
      const response = await axios.put(`${API_URL}/${habitId}/toggle`, {
        date: dateToToggle,
      });
      // This returns the updated habit from the backend
      const updatedHabit = response.data;
  
      // Merge into local state
      const updatedHabits = habits.map((h) =>
        h._id === updatedHabit._id ? updatedHabit : h
      );
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error toggling day:', error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        <button
          onClick={addHabit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Habit
        </button>
      </div>

      <div className="space-y-8">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              value={habit.name}
              onChange={(e) => {
                const updatedHabits = habits.map((h) =>
                  h.id === habit.id ? { ...h, name: e.target.value } : h
                );
                setHabits(updatedHabits);
              }}
              className="text-xl font-semibold mb-4 p-2 border rounded"
            />
            <div className="mt-2">
              <span className="text-sm font-semibold text-gray-600">
                Streak: {calculateStreak(habit.completedDates)} days
              </span>
            </div>
            <div key={`heatmap-${habit.id}`}>
            <Heatmap
  habitId={habit._id}
  completedDates={habit.completedDates}
  onCompleteDay={(date) => toggleHabitDay(habit._id, date)}
/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitContainer;
