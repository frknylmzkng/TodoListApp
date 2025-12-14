import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Grafik Kütüphaneleri
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- 1. GİRİŞ/KAYIT EKRANI COMPONENTİ ---
const AuthScreen = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); // Giriş mi Kayıt mı?
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLoginMode ? "login" : "register";
    const API_URL = `https://localhost:7221/api/Auth/${endpoint}`;

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(async (res) => {
      const data = await res.text(); // Backend'den gelen cevabı oku
      
      if (!res.ok) {
        throw new Error(data || "Bir hata oluştu");
      }

      if (isLoginMode) {
        // GİRİŞ BAŞARILI: Backend bize UserID döndü
        // ID'yi 'data' içinden alıp ana uygulamaya gönderiyoruz
        onLogin(data); 
      } else {
        // KAYIT BAŞARILI
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLoginMode(true); // Giriş ekranına dön
        setPassword("");
      }
    })
    .catch(err => setError(err.message));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h3 className="text-center text-primary mb-4">{isLoginMode ? "Giriş Yap" : "Kayıt Ol"}</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Kullanıcı Adı</label>
            <input 
              type="text" className="form-control" required 
              value={username} onChange={(e)=>setUsername(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Şifre</label>
            <input 
              type="password" className="form-control" required 
              value={password} onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            {isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
          </button>
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

// --- 2. ANA UYGULAMA (GÖREV YÖNETİCİSİ) ---
function App() {
  // KULLANICI OTURUMU STATE'İ
  const [userId, setUserId] = useState(() => localStorage.getItem("userId")); 

  const [todos, setTodos] = useState([]);
  
  // Diğer State'ler...
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [newItem, setNewItem] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("Genel");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDashboard, setShowDashboard] = useState(false); 

  const API_URL = "https://localhost:7221/api/Todo";

  // Giriş Yapılınca Çalışır
  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem("userId", id); // Tarayıcıya kaydet (Yenileyince gitmesin)
  };

  // Çıkış Yapılınca Çalışır
  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    setTodos([]); // Listeyi temizle
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

useEffect(() => {
    // Sadece userId varsa verileri çek
    if (userId) {
      fetchAPI();
    }
  }, [userId]); // userId değiştiğinde (giriş yapıldığında) bu kod tekrar çalışsın

const fetchAPI = () => {
    // 1. Eğer giriş yapmış bir kullanıcı yoksa (userId boşsa), sunucuyu rahatsız etme.
    if (!userId) return; 
    
    // 2. BACKTICK (AltGr + ; tuşu) KULLANMAYA DİKKAT!
    // Normal tırnak (') veya çift tırnak (") DEĞİL, şu yatık tırnak (` `) olmalı.
    // Böylece ${userId} içine gerçek sayı yerleşir.
    fetch(`${API_URL}?userId=${userId}`) 
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error(err));
  };

  // ... (Geri kalan CRUD fonksiyonları aynen devam ediyor) ...
  const completedCount = todos.filter(t => t.isCompleted).length;
  const pendingCount = todos.length - completedCount;
  const lowP = todos.filter(t => t.priority === 1).length;
  const mediumP = todos.filter(t => t.priority === 2).length;
  const highP = todos.filter(t => t.priority === 3).length;

  const pieData = {
    labels: ['Tamamlanan', 'Bekleyen'],
    datasets: [{ data: [completedCount, pendingCount], backgroundColor: ['#198754', '#ffc107'], borderColor: darkMode ? '#1e1e1e' : '#fff', borderWidth: 2 }],
  };

  const barData = {
    labels: ['Düşük', 'Orta', 'Yüksek'],
    datasets: [{ label: 'Görev Sayısı', data: [lowP, mediumP, highP], backgroundColor: ['#198754', '#0dcaf0', '#dc3545'] }],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: darkMode ? '#e0e0e0' : '#666' } } },
    scales: { x: { ticks: { color: darkMode ? '#e0e0e0' : '#666' } }, y: { ticks: { color: darkMode ? '#e0e0e0' : '#666' } } }
  };

const addItem = () => {
    if (!newItem) return;

    const taskToSend = { 
      title: newItem, 
      isCompleted: false, 
      priority: parseInt(newPriority), 
      dueDate: newDueDate ? newDueDate : null, 
      category: newCategory,
      
      userId: parseInt(userId) // YENİ: Bu görevi şu anki kullanıcıya zimmetle!
    };

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskToSend),
    })
    .then(res => res.json())
    .then(() => {
      // Temizlik işlemleri...
      setNewItem(""); 
      setNewPriority(1); 
      setNewDueDate("");
      setNewCategory("Genel");
      fetchAPI(); // Listeyi yenile
    });
  };

  const deleteItem = (id) => { fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(res => { if(res.ok) fetchAPI(); }); };
  const toggleComplete = (item) => { updateRequest({ ...item, isCompleted: !item.isCompleted }); };
  const updateRequest = (taskObj) => { fetch(`${API_URL}/${taskObj.id}`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskObj) }).then(res => { if(res.ok) fetchAPI(); }); };
  
  const startEditing = (item) => { setEditingId(item.id); setEditTitle(item.title); setEditPriority(item.priority); setEditDate(item.dueDate ? item.dueDate.split('T')[0] : ""); setEditCategory(item.category || "Genel"); };
  const saveEdit = (id, cur) => { updateRequest({ id, title: editTitle, isCompleted: cur, priority: parseInt(editPriority), dueDate: editDate ? editDate : null, category: editCategory }); setEditingId(null); };

  const filteredTodos = todos.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterType === "active") matchesFilter = !item.isCompleted;
    if (filterType === "completed") matchesFilter = item.isCompleted;
    if (filterType === "high") matchesFilter = item.priority === 3;
    return matchesSearch && matchesFilter;
  });

  const getPriorityBadge = (p) => {
    if(p === 1) return <span className="badge bg-success ms-2">Düşük</span>;
    if(p === 2) return <span className="badge bg-warning text-dark ms-2">Orta</span>;
    if(p === 3) return <span className="badge bg-danger ms-2">Yüksek</span>;
    return <span className="badge bg-secondary ms-2">?</span>;
  };
  
  const formatDateInfo = (dateString, isCompleted) => {
    if (!dateString) return null;
    const due = new Date(dateString); const now = new Date(); now.setHours(0,0,0,0); due.setHours(0,0,0,0);
    const isPast = due < now;
    return <span className={`ms-2 ${darkMode ? 'text-light opacity-75' : 'text-muted'}`} style={{ fontSize: "0.85rem" }}>📅 {new Date(dateString).toLocaleDateString('tr-TR')}{!isCompleted && isPast && <span className="badge bg-danger ms-1">GECİKTİ!</span>}</span>;
  };

  // --- 3. EKRAN KONTROLÜ ---
  // Eğer UserID yoksa AUTH ekranını göster, varsa UYGULAMAYI göster
  if (!userId) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
             <h2 className={`fw-bold ${darkMode ? 'text-info' : 'text-primary'}`}>🚀 Görev Yöneticisi</h2>
             <div className="d-flex gap-2">
                <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={() => setShowDashboard(!showDashboard)}>
                  {showDashboard ? "Gizle" : "📊 Analiz"}
                </button>
                <button className={`btn ${darkMode ? 'btn-warning' : 'btn-secondary'}`} onClick={() => setDarkMode(!darkMode)} style={{ minWidth: "50px" }}>
                  {darkMode ? "☀️" : "🌙"}
                </button>
                
                {/* ÇIKIŞ BUTONU */}
                <button className="btn btn-danger ms-2" onClick={handleLogout}>Çıkış Yap</button>
             </div>
          </div>

          {/* DASHBOARD */}
          {showDashboard && (
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header fw-bold text-center">Durum</div>
                  <div className="card-body d-flex justify-content-center" style={{maxHeight: "300px"}}>
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mt-3 mt-md-0">
                 <div className="card shadow-sm h-100">
                  <div className="card-header fw-bold text-center">Öncelik</div>
                  <div className="card-body d-flex justify-content-center" style={{maxHeight: "300px"}}>
                    <Bar data={barData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card shadow-lg">
            <div className={`card-header py-3 ${darkMode ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
              <h5 className="mb-0 text-center">Listem</h5>
            </div>
            <div className="card-body">

              {/* FİLTRE & ARAMA */}
              <div className="row mb-4 p-3 rounded mx-1" style={{ border: "1px solid var(--border-color)", backgroundColor: "rgba(0,0,0,0.03)" }}>
                <div className="col-md-6 mb-2 mb-md-0">
                  <input type="text" className="form-control" placeholder="🔍 Görev ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="col-md-6 d-flex justify-content-md-end gap-2 flex-wrap">
                  <button className={`btn btn-sm ${filterType==='all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('all')}>Tümü</button>
                  <button className={`btn btn-sm ${filterType==='active' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('active')}>Yapılacaklar</button>
                  <button className={`btn btn-sm ${filterType==='completed' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('completed')}>Bitenler</button>
                  <button className={`btn btn-sm ${filterType==='high' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={()=>setFilterType('high')}>🔥 Acil</button>
                </div>
              </div>
              
              {/* EKLEME ALANI */}
              <div className="row g-2 mb-4">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="Yeni görev..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                </div>
                <div className="col-md-2">
                   <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                      <option value="Genel">🏠 Genel</option>
                      <option value="İş">💼 İş</option>
                      <option value="Okul">🎓 Okul</option>
                      <option value="Alışveriş">🛒 Alışveriş</option>
                      <option value="Spor">💪 Spor</option>
                    </select>
                </div>
                <div className="col-md-3">
                  <input type="date" className="form-control" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <select className="form-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                    <option value="1">🟢 Düşük</option>
                    <option value="2">🟡 Orta</option>
                    <option value="3">🔴 Yüksek</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button className="btn btn-success w-100" onClick={addItem}>+</button>
                </div>
              </div>

              {/* LİSTE */}
              <ul className="list-group list-group-flush">
                {filteredTodos.map((gorev) => (
                  <li key={gorev.id} className="list-group-item">
                    {editingId === gorev.id ? (
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <input type="text" className="form-control" style={{flex:1}} value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                        <select className="form-select" style={{width:"100px"}} value={editCategory} onChange={(e)=>setEditCategory(e.target.value)}><option value="Genel">Genel</option><option value="İş">İş</option><option value="Okul">Okul</option><option value="Alışveriş">Alışveriş</option><option value="Spor">Spor</option></select>
                        <select className="form-select" style={{width:"90px"}} value={editPriority} onChange={(e)=>setEditPriority(e.target.value)}><option value="1">Düşük</option><option value="2">Orta</option><option value="3">Yüksek</option></select>
                        <input type="date" className="form-control" style={{width:"130px"}} value={editDate} onChange={(e)=>setEditDate(e.target.value)} />
                        <button className="btn btn-sm btn-success" onClick={() => saveEdit(gorev.id, gorev.isCompleted)}>💾</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>🚫</button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleComplete(gorev)}>
                          <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>{gorev.isCompleted ? "✅" : "⬜"}</span>
                          <span style={{ textDecoration: gorev.isCompleted ? "line-through" : "none", fontWeight: "500", color: gorev.isCompleted ? (darkMode ? '#777' : '#aaa') : 'inherit' }}>{gorev.title}</span>
                          <span className="badge bg-info text-dark ms-2">{gorev.category || "Genel"}</span>
                          {getPriorityBadge(gorev.priority)}
                          {formatDateInfo(gorev.dueDate, gorev.isCompleted)}
                        </div>
                        <div>
                          <button className="btn btn-outline-primary btn-sm me-2 rounded-circle" style={{ width: "32px", height: "32px" }} onClick={() => startEditing(gorev)}>✏️</button>
                          <button className="btn btn-outline-danger btn-sm rounded-circle" style={{ width: "32px", height: "32px" }} onClick={() => deleteItem(gorev.id)}>X</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;