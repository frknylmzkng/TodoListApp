import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Stil dosyası şart!

// Sayfaları İçe Aktar
import LoginPage from './pages/LoginPage';
import TodoPage from './pages/TodoPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  // GLOBAL STATE'LER (Tüm sayfalarda geçerli olanlar)
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA 1: ANA SAYFA (/) */}
        <Route 
          path="/" 
          element={
            userId ? (
              // Giriş yapıldıysa GÖREV SAYFASINI göster
              <TodoPage 
                userId={userId} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={handleLogout} 
              />
            ) : (
              // Giriş yapılmadıysa LOGİN SAYFASINI göster
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />

        {/* ROTA 2: PROFİL (/profile) */}
        <Route 
          path="/profile" 
          element={
            userId ? (
              <ProfilePage userId={userId} darkMode={darkMode} />
            ) : (
              // Giriş yapmadan profili görmeye çalışırsa Ana Sayfaya at
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme={darkMode ? "dark" : "light"} />
    </BrowserRouter>
  );
}

export default App;