import { useHabits } from '../contexts/HabitContext';
import { habitService } from '../services/habitService';

export const useHabitOperations = () => {
  const { dispatch } = useHabits();

  const addHabit = async (habit) => {
    try {
      const newHabit = await habitService.createHabit(habit);
      dispatch({ type: 'ADD_HABIT', payload: newHabit });
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const updateHabit = async (id, habit) => {
    try {
      const updatedHabit = await habitService.updateHabit(id, habit);
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await habitService.deleteHabit(id);
      dispatch({ type: 'DELETE_HABIT', payload: id });
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return { addHabit, updateHabit, deleteHabit };
};
