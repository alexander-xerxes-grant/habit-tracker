import React, { useState } from 'react';

const HabitName = ({ habit, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNameChange(habit._id, editedName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-habit-dark-card p-6 rounded-lg shadow-lg border border-habit-orange">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold mb-4 text-gray-200">
              Edit Habit Name
            </h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border border-habit-orange bg-habit-dark p-2 rounded mb-4 w-full text-gray-200"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-habit-orange text-white rounded hover:bg-opacity-80"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-semibold text-gray-200">{habit.name}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-gray-500 hover:text-gray-700"
      >
        ✎
      </button>
    </div>
  );
};

export default HabitName;
