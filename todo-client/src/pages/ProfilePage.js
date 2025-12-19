import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // <--- İŞTE BU SATIRI YENİ EKLİYORUZ

const ProfilePage = ({ userId, darkMode }) => {
  // Şifre Değiştirme State'leri
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // "message" state'ini SİLDİK (Artık Toast kullanıyoruz)

  const handleChangePassword = () => {
    fetch("https://localhost:7221/api/Auth/change-password", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: parseInt(userId), 
        oldPassword: oldPassword, 
        newPassword: newPassword 
      })
    })
    .then(async (res) => {
      const data = await res.text();
      
      if(res.ok) {
        toast.success(data); // YEŞİL BİLDİRİM ✅
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(data); // KIRMIZI BİLDİRİM ❌
      }
    })
    .catch(err => toast.error("Bir hata oluştu."));
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg mx-auto" style={{ maxWidth: "600px" }}>
        <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
          <h4 className="mb-0 text-center">👤 Profil Ayarları</h4>
        </div>
        <div className="card-body p-5">
          
          <div className="text-center mb-4">
            <span style={{ fontSize: "4rem" }}>🧑‍💻</span>
            <h5 className="mt-2">Kullanıcı ID: <span className="badge bg-dark">{userId}</span></h5>
          </div>
          
          <hr />

          <h5 className="mb-3">🔐 Şifre Değiştir</h5>
          
          {/* ESKİ MESSAGE KUTUSU BURADAYDI, ARTIK YOK */}

          <div className="mb-3">
            <label className="form-label">Eski Şifre</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Mevcut şifreniz..." 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Yeni Şifre</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Yeni şifreniz..." 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
            />
          </div>

          <button className="btn btn-success w-100 mb-3" onClick={handleChangePassword}>
            💾 Şifreyi Güncelle
          </button>

          <Link to="/" className="btn btn-outline-secondary w-100">
            ⬅️ Görevlere Dön
          </Link>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;