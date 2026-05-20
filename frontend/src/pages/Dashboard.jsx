import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const s = {
  page: { minHeight: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' },
  nav: { background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: "'Space Mono', monospace", fontSize: 16, color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  badge: { background: '#4f46e5', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  logoutBtn: { background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 },
  main: { maxWidth: 800, margin: '0 auto', padding: '40px 24px' },
  heading: { fontSize: 22, fontFamily: "'Space Mono', monospace", marginBottom: 24 },
  form: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 32 },
  formTitle: { fontSize: 15, fontWeight: 600, color: '#ccc', marginBottom: 16, marginTop: 0 },
  input: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 12, outline: 'none' },
  textarea: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 12, resize: 'vertical', outline: 'none' },
  btn: { background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  taskCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, marginBottom: 12 },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  taskDesc: { color: '#777', fontSize: 13, marginBottom: 12 },
  taskMeta: { display: 'flex', gap: 8, alignItems: 'center' },
  actions: { display: 'flex', gap: 8 },
  editBtn: { background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12 },
  deleteBtn: { background: '#2a1010', color: '#f87171', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12 },
  statusBadge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' },
  select: { background: '#111', border: '1px solid #333', borderRadius: 6, color: '#fff', padding: '4px 8px', fontSize: 12 },
  toast: { position: 'fixed', bottom: 24, right: 24, background: '#1a3a2a', border: '1px solid #2a5a3a', color: '#4ade80', borderRadius: 8, padding: '12px 20px', fontSize: 14 },
  empty: { color: '#444', textAlign: 'center', padding: 40 },
};

const statusColors = {
  pending: { background: '#1a2a3a', color: '#60a5fa' },
  in_progress: { background: '#2a2a1a', color: '#facc15' },
  done: { background: '#0f2a1a', color: '#4ade80' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

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
      showToast('Task created!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/tasks/${id}`, updates);
      loadTasks();
      setEditTask(null);
      showToast('Task updated!');
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
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.brand}>task_manager</span>
        <div style={s.navRight}>
          <span style={{ color: '#aaa', fontSize: 14 }}>{user.name}</span>
          <span style={s.badge}>{user.role}</span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <main style={s.main}>
        <h1 style={s.heading}>My Tasks</h1>

        {/* Create form */}
        <div style={s.form}>
          <p style={s.formTitle}>+ New Task</p>
          <form onSubmit={handleCreate}>
            <input style={s.input} placeholder="Task title *" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea style={s.textarea} placeholder="Description (optional)" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button style={s.btn} type="submit">Add Task</button>
          </form>
        </div>

        {/* Task list */}
        {loading ? (
          <p style={s.empty}>Loading...</p>
        ) : tasks.length === 0 ? (
          <p style={s.empty}>No tasks yet. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={s.taskCard}>
              {editTask === task.id ? (
                <EditForm task={task} onSave={(u) => handleUpdate(task.id, u)} onCancel={() => setEditTask(null)} />
              ) : (
                <>
                  <div style={s.taskHeader}>
                    <div>
                      <div style={s.taskTitle}>{task.title}</div>
                      {task.description && <div style={s.taskDesc}>{task.description}</div>}
                    </div>
                    <div style={s.actions}>
                      <button style={s.editBtn} onClick={() => setEditTask(task.id)}>Edit</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                  </div>
                  <div style={s.taskMeta}>
                    <span style={{ ...s.statusBadge, ...statusColors[task.status] }}>{task.status.replace('_', ' ')}</span>
                    <select style={s.select} value={task.status}
                      onChange={(e) => handleUpdate(task.id, { status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {task.owner_name && <span style={{ color: '#444', fontSize: 12 }}>by {task.owner_name}</span>}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </main>

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}

function EditForm({ task, onSave, onCancel }) {
  const [form, setForm] = useState({ title: task.title, description: task.description || '' });
  const inputStyle = { width: '100%', background: '#111', border: '1px solid #444', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box', marginBottom: 10, outline: 'none' };
  return (
    <div>
      <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(form)} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Save</button>
        <button onClick={onCancel} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  );
}
