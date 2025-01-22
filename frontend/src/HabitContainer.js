import React, { useState, useEffect } from 'react';
import Heatmap from './Heatmap';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/habits';

const HabitContainer = () => {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log('API Response:', response.data);
        setHabits(response.data)
      } catch (error) {
        console.error('Error fetching habits:', error)
      }
      
    };

    fetchHabits();
  }, []);

  const addHabit = () => {
    const newHabit = {
      id: Date.now(),
      name: `Habit ${habits.length + 1}`,
    };
    setHabits([...habits, newHabit]);
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
            <div key={`heatmap-${habit.id}`}>
              <Heatmap />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitContainer;
