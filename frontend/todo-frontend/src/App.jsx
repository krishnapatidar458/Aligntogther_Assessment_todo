import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import TodoPage from './pages/TodoPage';
import { Toaster } from 'react-hot-toast'; // Import Toaster

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/todos" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Configure the notification design */}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#333', color: '#fff' },
          success: { iconTheme: { primary: '#4ade80', secondary: 'black' } },
        }} />
        
        <Routes>
          <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/todos" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;