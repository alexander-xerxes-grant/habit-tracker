const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const habitService = {
  async getHabits() {
    const response = await fetch(`${BASE_URL}/habits`);
    return response.json();
  },

  async createHabit(habit) {
    const response = await fetch(`${BASE_URL}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habit),
    });
    return response.json();
  },

  async updateHabit(id, habit) {
    const response = await fetch(`${BASE_URL}/habits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habit),
    });
    return response.json();
  },

  async deleteHabit(id) {
    await fetch(`${BASE_URL}/habits/${id}`, {
      method: 'DELETE',
    });
  }
}; 