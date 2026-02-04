import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, CheckCircle, Circle, Plus, AlertCircle, Loader2, ClipboardList } from 'lucide-react';
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

  // Requirement: Loading States (Initial Load)
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/todos'); 
      setTodos(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Requirement: Error Handling
      setError('Failed to load tasks. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    // Requirement: Form Validation (Prevent empty submission)
    if (!newTodo.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/todos', { 
        title: newTodo, 
        status: 'Pending' 
      });
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to create task.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'Completed' ? 'Pending' : 'Completed';
    
    // Optimistic Update for "Snappy" UX
    const oldTodos = [...todos];
    const updatedTodos = todos.map(t => 
      t.id === todo.id ? { ...t, status: newStatus } : t
    );
    setTodos(updatedTodos);

    try {
      await api.put(`/todos/${todo.id}`, { ...todo, status: newStatus });
    } catch (err) {
      setTodos(oldTodos);
      setError('Failed to update status');
    }
  };

  const deleteTodo = async (id) => {
    if(!window.confirm("Are you sure you want to delete this task?")) return;
    
    const oldTodos = [...todos];
    setTodos(todos.filter(t => t.id !== id));

    try {
      await api.delete(`/todos/${id}`);
    } catch (err) {
      setTodos(oldTodos);
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  // Requirement: Todo Counter
  const pendingCount = todos.filter(t => t.status === 'Pending').length;
  const completedCount = todos.filter(t => t.status === 'Completed').length;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = Array.isArray(dateString) 
            ? new Date(dateString[0], dateString[1]-1, dateString[2]) 
            : new Date(dateString);
        return date.toLocaleDateString();
    } catch (e) { return ''; }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Requirement: Responsive Design (Sticky Header) */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> My Tasks
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition px-3 py-1 rounded hover:bg-red-50"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {/* Requirement: Error Handling (Visual Banner) */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white p-2 rounded-xl shadow-sm mb-6 border border-gray-100 transition focus-within:ring-2 focus-within:ring-blue-100">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 p-3 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              disabled={actionLoading}
            />
            <button 
              type="submit" 
              disabled={actionLoading || !newTodo.trim()}
              className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[3rem]"
            >
              {/* Requirement: Loading States (Spinner on Button) */}
              {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={24} />}
            </button>
          </form>
        </div>

        {/* Filters & Counters (Responsive: Stack on mobile) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['All', 'Pending', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  filter === f 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Requirement: Todo Counter */}
          <div className="text-sm text-gray-500 font-medium flex gap-4">
             <span className="flex items-center gap-1">Pending: <span className="text-orange-600 font-bold">{pendingCount}</span></span>
             <span className="w-px h-4 bg-gray-300"></span>
             <span className="flex items-center gap-1">Completed: <span className="text-green-600 font-bold">{completedCount}</span></span>
          </div>
        </div>

        {/* Requirement: Loading States (Full List) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p>Loading your tasks...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Requirement: Empty States */}
            {filteredTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                <ClipboardList size={48} className="mb-2 opacity-20" />
                <p className="font-medium">{filter === 'All' ? 'You have no tasks yet!' : `No ${filter} tasks found.`}</p>
                {filter === 'All' && <p className="text-sm mt-1">Add one using the input above.</p>}
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`group bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center transition hover:shadow-md ${
                    todo.status === 'Completed' ? 'opacity-75 bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <button 
                      onClick={() => toggleStatus(todo)}
                      className={`transition p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ${
                        todo.status === 'Completed' ? 'text-green-500' : 'text-gray-300 hover:text-orange-400'
                      }`}
                    >
                      {todo.status === 'Completed' ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-base font-medium truncate transition ${
                        todo.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {todo.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        {formatDate(todo.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Task"
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