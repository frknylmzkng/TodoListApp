import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [userId, setUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // SAYFA YÜKLENİNCE: Hafızada kullanıcı var mı kontrol et
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");

    if (storedUserId && storedToken) {
        setUserId(storedUserId); // Varsa oturumu aç
    }
  }, []);

  const handleLogin = (id) => {
    setUserId(id);
  };

  const handleLogout = () => {
    // Çıkış yapınca hafızayı temizle
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setUserId(null);
  };

  return (
    <div className={darkMode ? 'bg-dark text-white' : 'bg-light text-dark'} style={{minHeight: '100vh'}}>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />
      
      <Routes>
        <Route 
          path="/" 
          element={!userId ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/todo" />} 
        />
        
        <Route 
          path="/todo" 
          element={userId ? <TodoPage userId={userId} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/profile" 
          element={userId ? <ProfilePage /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}

export default App;