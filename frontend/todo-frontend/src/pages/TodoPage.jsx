import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, Check, Plus, Search, Calendar, X, Edit3, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); 
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  const searchInputRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Keyboard Shortcut: Press '/' to Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos'); 
      setTodos(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Newest first
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const tempId = Date.now();
    const tempTodo = { id: tempId, title: newTodo, status: 'Pending', createdAt: new Date() };

    setTodos([tempTodo, ...todos]);
    setNewTodo('');
    
    try {
      const res = await api.post('/todos', { title: newTodo, status: 'Pending' });
      setTodos(prev => prev.map(t => t.id === tempId ? res.data : t));
      toast.success('Task created');
    } catch (err) {
      setTodos(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to create task');
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'Completed' ? 'Pending' : 'Completed';
    setTodos(todos.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
    
    if (newStatus === 'Completed') toast.success('Completed!');

    try {
      await api.put(`/todos/${todo.id}`, { ...todo, status: newStatus });
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    setEditingId(null);
    setTodos(todos.map(t => t.id === id ? { ...t, title: editTitle } : t));

    try {
      const todo = todos.find(t => t.id === id);
      await api.put(`/todos/${id}`, { ...todo, title: editTitle });
      toast.success('Task updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const deleteTodo = async (id) => {
    if(!window.confirm("Delete this task?")) return;
    const oldTodos = [...todos];
    setTodos(todos.filter(t => t.id !== id));
    try { await api.delete(`/todos/${id}`); } 
    catch (err) { setTodos(oldTodos); toast.error('Delete failed'); }
  };

  // Advanced Filtering
  const filteredTodos = todos.filter(t => {
    const matchesFilter = filter === 'All' ? true : t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const d = Array.isArray(dateString) 
            ? new Date(dateString[0], dateString[1]-1, dateString[2]) 
            : new Date(dateString);
        
        // "Today/Yesterday" Logic
        const today = new Date();
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
        if (isToday) return 'Today';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) { return ''; }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <Check size={20} strokeWidth={3} />
                </div>
                AlignTodo
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                    <Command size={12} /> <span className="tracking-widest">CMD+K</span>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="text-slate-500 hover:text-red-600 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Search & Filter Bar */}
        <div className="sticky top-20 z-10 bg-[#F3F4F6] pb-4 pt-2">
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search tasks... (Press '/')" 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button onClick={() => searchInputRef.current?.focus()} className="bg-slate-900 text-white px-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center">
                    <Plus size={24} />
                </button>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                            filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-200'
                        }`}>
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* Task List */}
        <div className="space-y-2 pb-20">
            <AnimatePresence mode='popLayout'>
                {/* Create Input (Visual Fake) */}
                <motion.form 
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreate} 
                    className="group bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all"
                >
                    <div className="h-10 w-10 flex items-center justify-center text-slate-300">
                        <Plus size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Add a new task..."
                        className="flex-1 bg-transparent border-none outline-none h-12 text-slate-700 font-medium placeholder:text-slate-400"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                    />
                </motion.form>

                {filteredTodos.map(todo => (
                    <motion.div 
                        layout
                        key={todo.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                        <div className="flex items-center p-3 gap-3">
                            {/* Status Checkbox */}
                            <button 
                                onClick={() => toggleStatus(todo)}
                                className={`h-5 w-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                                    todo.status === 'Completed' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-500'
                                }`}
                            >
                                {todo.status === 'Completed' && <Check size={12} className="text-white" />}
                            </button>

                            {/* Content (Editable) */}
                            <div className="flex-1 min-w-0">
                                {editingId === todo.id ? (
                                    <input 
                                        autoFocus
                                        className="w-full bg-slate-50 px-2 py-1 rounded border border-indigo-200 outline-none text-slate-800 font-medium"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => saveEdit(todo.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 group/text cursor-text" onClick={() => startEditing(todo)}>
                                        <span className={`truncate font-medium transition-all ${
                                            todo.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}>
                                            {todo.title}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Metadata & Actions */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-wider">
                                    {formatDate(todo.createdAt)}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(todo)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {filteredTodos.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <div className="bg-slate-200 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium">No tasks found</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}