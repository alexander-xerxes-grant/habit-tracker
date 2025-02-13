import React, { createContext, useContext, useReducer } from 'react';

const HabitContext = createContext();

const habitReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_HABIT':
      return [...state, action.payload];
    case 'UPDATE_HABIT':
      return state.map((habit) =>
        habit.id === action.payload.id ? action.payload : habit
      );
    case 'DELETE_HABIT':
      return state.filter((habit) => habit.id !== action.payload);
    default:
      return state;
  }
};

export const HabitProvider = ({ children }) => {
  const [habits, dispatch] = useReducer(habitReducer, []);

  return (
    <HabitContext.Provider value={{ habits, dispatch }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
