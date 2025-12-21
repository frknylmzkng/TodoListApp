import React, { useState } from 'react';
import { toast } from 'react-toastify';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Kayıt ol modu mu?

  const API_URL = "https://localhost:7221/api/Auth";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("Lütfen tüm alanları doldurun!");
      return;
    }

    const endpoint = isRegistering ? "/register" : "/login";

    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(async res => {
      const data = await res.json().catch(() => null); // Hata mesajı varsa al

      if (!res.ok) {
         // Sunucudan gelen hatayı göster (Örn: "Şifre yanlış")
         throw new Error(data || "Bir hata oluştu");
      }
      return data;
    })
    .then(data => {
      if (isRegistering) {
        toast.success("Kayıt başarılı! Şimdi giriş yapabilirsin. 🎉");
        setIsRegistering(false); // Kayıt modundan çık
      } else {
        // GİRİŞ BAŞARILI!
        toast.success(`Hoş geldin, ${data.username}! 👋`);
        
        // 1. Token'ı ve UserID'yi tarayıcıya kaydet
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        // 2. Ana sayfaya yönlendir
        onLogin(data.userId); 
      }
    })
    .catch(err => {
      console.error(err);
      toast.error(err.message || "İşlem başarısız!");
    });
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '400px' }}>
        <h2 className="text-center mb-4 text-primary fw-bold">
            {isRegistering ? "📝 Kayıt Ol" : "🚀 Giriş Yap"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Örn: furkan"
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Şifre</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******" 
            />
          </div>
          
          <button type="submit" className={`btn w-100 ${isRegistering ? 'btn-success' : 'btn-primary'}`}>
            {isRegistering ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>
        
        <div className="mt-3 text-center">
            <button 
                className="btn btn-link text-decoration-none" 
                onClick={() => setIsRegistering(!isRegistering)}
            >
                {isRegistering ? "Zaten hesabın var mı? Giriş Yap" : "Hesabın yok mu? Kayıt Ol"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;