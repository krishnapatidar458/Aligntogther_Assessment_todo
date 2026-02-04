import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, CheckCircle, Circle, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pending, Completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      // We fetch ALL todos and filter client-side to easily calculate counters
      // Alternatively, pass ?status= to the API if the list is huge
      const res = await api.get('/todos'); 
      setTodos(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/todos', { 
        title: newTodo, 
        description: '', // Optional field
        status: 'Pending' 
      });
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to create todo');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'Completed' ? 'Pending' : 'Completed';
    // Optimistic Update
    const oldTodos = [...todos];
    setTodos(todos.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/todos/${todo.id}`, { ...todo, status: newStatus });
    } catch (err) {
      // Revert on failure
      setTodos(oldTodos);
      setError('Failed to update status');
    }
  };

  const deleteTodo = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Derived State
  const filteredTodos = todos.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const pendingCount = todos.filter(t => t.status === 'Pending').length;
  const completedCount = todos.filter(t => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Tasks</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
          >
            <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 mt-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              disabled={actionLoading}
            />
            <button 
              type="submit" 
              disabled={actionLoading || !newTodo.trim()}
              className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center"
            >
              {actionLoading ? '...' : <Plus size={24} />}
            </button>
          </form>
        </div>

        {/* Filters & Counters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex gap-2 bg-white p-1 rounded shadow-sm">
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                  filter === f 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 font-medium">
             Pending: <span className="text-orange-600">{pendingCount}</span> | 
             Completed: <span className="text-green-600">{completedCount}</span>
          </div>
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading your tasks...</div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
                {filter === 'All' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`bg-white p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center transition hover:shadow-md ${
                    todo.status === 'Completed' ? 'border-green-500 opacity-75' : 'border-orange-400'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button 
                      onClick={() => toggleStatus(todo)}
                      className={`transition ${todo.status === 'Completed' ? 'text-green-500' : 'text-gray-300 hover:text-orange-400'}`}
                    >
                      {todo.status === 'Completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-lg truncate ${todo.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {todo.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-600 p-2 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}