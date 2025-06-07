import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // For editing
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch tasks from backend
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/tasks`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch tasks.');
        setLoading(false);
      });
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const createdTask = await res.json();
      setTasks(prev => [...prev, createdTask]);
      setTitle('');
      setDescription('');
      setMessage('Task added successfully!');
    } catch (err) {
      setError('Failed to add task.');
    }
    setLoading(false);
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(task => task._id !== id));
      setMessage('Task deleted!');
    } catch {
      setError('Delete failed.');
    }
  };

  // Update task status
  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus;
    if (currentStatus === 'pending') nextStatus = 'in-progress';
    else if (currentStatus === 'in-progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const updatedTask = await res.json();
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task));
      setMessage('Status updated!');
    } catch {
      setError('Status update failed.');
    }
  };

  // Start editing task
  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  // Submit edited task
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const updatedTask = await res.json();
      setTasks(prev =>
        prev.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );

      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
      setMessage('Task updated successfully!');
    } catch {
      setError('Update failed.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Task Manager</h2>

      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <br />
        <button type="submit">Add Task</button>
      </form>

      {editingTask && (
        <form onSubmit={handleEditSubmit} style={{ marginTop: '20px' }}>
          <h4>Editing Task: {editingTask.title}</h4>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <br />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <br />
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditingTask(null)} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </form>
      )}

      <hr />

      <h3>Tasks:</h3>
      {tasks.length === 0 && <p>No tasks found.</p>}

      {tasks.map(task => (
        <div key={task._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <small>Status: {task.status}</small>
          <br />
          <button onClick={() => handleStatusChange(task._id, task.status)}>
            Mark as {task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending'}
          </button>
          <button
            onClick={() => handleDelete(task._id)}
            style={{ marginLeft: '10px', color: 'red' }}
          >
            Delete
          </button>
          <button
            onClick={() => startEditing(task)}
            style={{ marginLeft: '10px' }}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
