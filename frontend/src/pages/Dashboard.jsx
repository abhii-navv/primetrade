import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles.css';

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      setForm({ title: '', description: '' });
      loadTasks();
      showToast('Task created');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/tasks/${id}`, updates);
      loadTasks();
      setEditTask(null);
      showToast('Task updated');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
      showToast('Task deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="dashboard">
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-brand-dot" />
          TaskFlow
        </div>
        <div className="nav-right">
          <span className="nav-user">{user.name}</span>
          <span className="nav-badge">{user.role}</span>
          <button className="btn btn-sm btn-ghost" onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-header">
          <h1 className="dash-title">My Tasks</h1>
          {!loading && <span className="dash-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>}
        </div>

        {/* Create form */}
        <div className="create-form">
          <p className="create-form-title">New Task</p>
          <form onSubmit={handleCreate}>
            <div className="field" style={{ marginBottom: 10 }}>
              <input className="input" placeholder="Task title *" required
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <textarea className="textarea" placeholder="Description (optional)" rows={2}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn btn-save btn-sm" type="submit">+ Add Task</button>
          </form>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="empty"><div className="empty-icon">⏳</div>Loading your tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            No tasks yet — add one above!
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                {editTask === task.id ? (
                  <EditForm task={task} onSave={(u) => handleUpdate(task.id, u)} onCancel={() => setEditTask(null)} />
                ) : (
                  <>
                    <div className="task-top">
                      <div>
                        <div className="task-title">{task.title}</div>
                        {task.description && <div className="task-desc">{task.description}</div>}
                      </div>
                      <div className="task-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditTask(task.id)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                      </div>
                    </div>
                    <div className="task-meta">
                      <span className={`badge badge-${task.status}`}>{STATUS_LABEL[task.status]}</span>
                      <select className="status-select" value={task.status}
                        onChange={(e) => handleUpdate(task.id, { status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      {task.owner_name && <span className="task-owner">by {task.owner_name}</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div className="toast">
          <div className="toast-dot" />
          {toast}
        </div>
      )}
    </div>
  );
}

function EditForm({ task, onSave, onCancel }) {
  const [form, setForm] = useState({ title: task.title, description: task.description || '' });
  return (
    <div className="edit-form">
      <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="textarea" rows={2} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="edit-actions">
        <button className="btn btn-sm btn-save" onClick={() => onSave(form)}>Save</button>
        <button className="btn btn-sm btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
