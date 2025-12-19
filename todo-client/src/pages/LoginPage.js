import React, { useState } from 'react';
import { toast } from 'react-toastify';

const LoginPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLoginMode ? "login" : "register";
    // API adresi yerel çalıştığı için localhost. Canlıya alınca burası değişecek.
    const API_URL = `https://localhost:7221/api/Auth/${endpoint}`;

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
.then(async (res) => {
      const data = await res.text();
      if (!res.ok) throw new Error(data || "Hata oluştu");

      if (isLoginMode) {
        toast.success("Giriş başarılı! Hoş geldiniz 🚀"); // Alert yerine Toast
        onLogin(data);
      } else {
        toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz. 🎉"); // Alert yerine Toast
        setIsLoginMode(true);
        setPassword("");
      }
    })
    .catch(err => toast.error(err.message)); // Hata mesajını kırmızı göster
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h3 className="text-center text-primary mb-4">{isLoginMode ? "Giriş Yap" : "Kayıt Ol"}</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Kullanıcı Adı</label>
            <input type="text" className="form-control" required value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Şifre</label>
            <input type="password" className="form-control" required value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary w-100">{isLoginMode ? "Giriş Yap" : "Kayıt Ol"}</button>
        </form>
        <div className="text-center mt-3">
          <button className="btn btn-link" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "Hesabın yok mu? Kayıt Ol" : "Zaten üye misin? Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;