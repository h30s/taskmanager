const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err });
  }
};

// @desc    Create a task
// @route   POST /tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const newTask = new Task({ title, description, status });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: 'Error creating task', error: err });
  }
};

// @desc    Update a task
// @route   PUT /tasks/:id
const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: 'Error updating task', error: err });
  }
};

// @desc    Delete a task
// @route   DELETE /tasks/:id
const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
