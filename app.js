const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tododb';
mongoose.connect(mongoURI).then(() => console.log('MongoDB connected'));

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', TodoSchema);

// GET all todos
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

// POST create todo
app.post('/api/todos', async (req, res) => {
  const todo = new Todo({ title: req.body.title });
  await todo.save();
  res.status(201).json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Health check endpoint (for Prometheus)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
