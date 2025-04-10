const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: '*'  // Allow requests from any origin (for development only)
}));

// Parse JSON request body
app.use(bodyParser.json());

// In-memory database for tasks
let tareas = [];

// GET all tasks
app.get('/tareas', (req, res) => {
  res.json(tareas);
});

// GET a specific task
app.get('/tareas/:id', (req, res) => {
  const tarea = tareas.find(t => t.id === req.params.id);
  
  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  
  res.json(tarea);
});

// POST a new task
app.post('/tareas', (req, res) => {
  const nuevaTarea = {
    id: req.body.id || Date.now().toString(),
    text: req.body.text,
    completed: req.body.completed || false
  };
  
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

// PUT (update) a task
app.put('/tareas/:id', (req, res) => {
  const index = tareas.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  
  // Update the task with new data
  tareas[index] = {
    ...tareas[index],
    ...req.body
  };
  
  res.json(tareas[index]);
});

// DELETE a task
app.delete('/tareas/:id', (req, res) => {
  const initialLength = tareas.length;
  tareas = tareas.filter(t => t.id !== req.params.id);
  
  if (tareas.length === initialLength) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  
  res.json({ message: "Tarea eliminada" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('GET /tareas - Get all tasks');
  console.log('GET /tareas/:id - Get a specific task');
  console.log('POST /tareas - Create a new task');
  console.log('PUT /tareas/:id - Update a task');
  console.log('DELETE /tareas/:id - Delete a task');
});