import React, { useState, useEffect } from 'react';
import Heatmap from './Heatmap';
import HabitName from './components/HabitName';
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

      const response = await axios.post(API_URL, newHabitData);

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

  const deleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${habitId}`);

      // If deletion was succesful, update the local state by filtering out the deleted habit
      setHabits(habits.filter((habit) => habit._id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const updateHabitName = async (habitId, newName) => {
    try {
      await axios.put(`${API_URL}/${habitId}`, {
        name: newName,
      });

      setHabits((prevHabits) =>
        prevHabits.map((h) => (h._id === habitId ? { ...h, name: newName } : h))
      );
    } catch (error) {
      console.error('Error updating habit name:', error);
      alert('Failed to update habit name. Please try again.');
    }
  };

  return (
    <div className="p-4 space-y-4" bg-orange>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-200">Habit Tracker</h1>
        <button
          onClick={addHabit}
          className="bg-habit-orange hover:bg-opacity-80 text-white px-4 py-2 rounded"
        >
          Add New Habit
        </button>
      </div>

      <div className="space-y-4">
        {habits.map((habit) => (
          <div key={habit._id} className="bg-dark-card p-3 rounded-lg border-habit-orange">
            <div className="flex justify-between items-center mb-2">
              <HabitName habit={habit} onNameChange={updateHabitName} />
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-400">
                  Streak: {calculateStreak(habit.completedDates)} days
                </span>
                <button
                  onClick={() => deleteHabit(habit._id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
            <div key={`heatmap-${habit._id}`}>
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
