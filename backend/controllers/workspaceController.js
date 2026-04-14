import Todo from '../models/Todo.js';
import Note from '../models/Note.js';

// --- TODOS ---
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { task, description, priority, repairCost } = req.body;
    const todo = await Todo.create({
      user: req.user._id,
      task,
      description,
      priority,
      repairCost: req.user.role === 'Warden' ? (Number(repairCost) || 0) : 0
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTodoStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NOTES ---
export const getNote = async (req, res) => {
  try {
    let note = await Note.findOne({ user: req.user._id });
    if (!note) {
      note = await Note.create({ user: req.user._id, content: '' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { content } = req.body;
    let note = await Note.findOneAndUpdate(
      { user: req.user._id },
      { content },
      { new: true, upsert: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
