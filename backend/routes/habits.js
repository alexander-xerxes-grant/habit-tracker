// Express is our web framework that provides routing functionality
const express = require('express');
// Router() lets us create a modular set of routes that we can plug into our main app
const router = express.Router();
// Habit is our database model that we'll use to interact with the MongoDB database
const Habit = require('../models/Habit');


// Get all habits
// This route will return all habits from the database
// It's async because database operations take time and we don't want to block
// other operations
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.find();
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
