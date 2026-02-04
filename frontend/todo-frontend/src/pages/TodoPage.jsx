import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, CheckCircle, Circle, Plus, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('All'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/todos'); 
      setTodos(res.data);
      setError(null);
    } catch (err) {
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post('/todos', { title: newTodo, status: 'Pending' });
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) { setError('Failed to create task.'); } 
    finally { setActionLoading(false); }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'Completed' ? 'Pending' : 'Completed';
    const oldTodos = [...todos];
    setTodos(todos.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/todos/${todo.id}`, { ...todo, status: newStatus });
    } catch (err) { setTodos(oldTodos); }
  };

  const deleteTodo = async (id) => {
    if(!window.confirm("Delete this task?")) return;
    const oldTodos = [...todos];
    setTodos(todos.filter(t => t.id !== id));
    try { await api.delete(`/todos/${id}`); } 
    catch (err) { setTodos(oldTodos); }
  };

  const filteredTodos = todos.filter(t => filter === 'All' ? true : t.status === filter);
  const pendingCount = todos.filter(t => t.status === 'Pending').length;
  
  const formatDate = (date) => {
    try {
       const d = Array.isArray(date) ? new Date(date[0], date[1]-1, date[2]) : new Date(date);
       return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <CheckCircle className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaskFlow</h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} 
            className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 mt-4">
        {/* Input Area */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a new task..."
              className="flex-1 p-3 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              disabled={actionLoading}
            />
            <button type="submit" disabled={!newTodo.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20">
              {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </form>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['All', 'Pending', 'Completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                {f}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-slate-500">
            You have <span className="text-indigo-600 font-bold">{pendingCount}</span> tasks pending
          </span>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500 h-8 w-8" /></div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map(todo => (
              <div key={todo.id} 
                className={`group bg-white p-4 rounded-xl border transition-all hover:shadow-md flex items-center justify-between
                ${todo.status === 'Completed' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200'}`}>
                
                <div className="flex items-center gap-4 overflow-hidden">
                  <button onClick={() => toggleStatus(todo)} className="shrink-0 transition-transform active:scale-90">
                    {todo.status === 'Completed' 
                      ? <CheckCircle className="text-emerald-500 h-6 w-6 fill-emerald-50" /> 
                      : <Circle className="text-slate-300 h-6 w-6 hover:text-indigo-500" />}
                  </button>
                  
                  <div className="min-w-0">
                    <p className={`font-medium truncate transition-all ${todo.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        todo.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {todo.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={10} /> {formatDate(todo.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => deleteTodo(todo.id)}
                  className="text-slate-300 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
            {filteredTodos.length === 0 && (
               <div className="text-center py-16 text-slate-400">
                 <p>No tasks found.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}