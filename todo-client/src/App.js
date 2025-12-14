import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Grafik Kütüphaneleri
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function App() {
  const [todos, setTodos] = useState([]);
  
  // DARK MODE STATE
  // Başlangıçta localStorage'a bak, yoksa 'false' (aydınlık) olsun
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });

  // State'ler
  const [newItem, setNewItem] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editDate, setEditDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDashboard, setShowDashboard] = useState(false); 

  const API_URL = "https://localhost:7221/api/Todo";

  // --- DARK MODE MANTIĞI (SİHİR BURADA) ---
  useEffect(() => {
    // 1. HTML etiketine 'data-theme' özelliğini ekle/kaldır
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    // 2. Tercihi tarayıcı hafızasına kaydet
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchAPI();
  }, []);

  const fetchAPI = () => {
    fetch(API_URL).then(res => res.json()).then(data => setTodos(data)).catch(err => console.error(err));
  };

  // İstatistikler
  const completedCount = todos.filter(t => t.isCompleted).length;
  const pendingCount = todos.length - completedCount;
  const lowP = todos.filter(t => t.priority === 1).length;
  const mediumP = todos.filter(t => t.priority === 2).length;
  const highP = todos.filter(t => t.priority === 3).length;

  const pieData = {
    labels: ['Tamamlanan', 'Bekleyen'],
    datasets: [{
        data: [completedCount, pendingCount],
        backgroundColor: ['#198754', '#ffc107'],
        borderColor: darkMode ? '#1e1e1e' : '#fff', // Çizgiler temaya uysun
        borderWidth: 2,
    }],
  };

  const barData = {
    labels: ['Düşük', 'Orta', 'Yüksek'],
    datasets: [{
        label: 'Görev Sayısı',
        data: [lowP, mediumP, highP],
        backgroundColor: ['#198754', '#0dcaf0', '#dc3545'],
    }],
  };
  
  // Grafik Yazı Renk Ayarı (Karanlık modda yazılar beyaz olsun)
  const chartOptions = {
    responsive: true,
    plugins: {
        legend: { labels: { color: darkMode ? '#e0e0e0' : '#666' } } // Efsane yazı rengi
    },
    scales: {
        x: { ticks: { color: darkMode ? '#e0e0e0' : '#666' } }, // X ekseni rengi
        y: { ticks: { color: darkMode ? '#e0e0e0' : '#666' } }  // Y ekseni rengi
    }
  };

  // CRUD
  const addItem = () => {
    if (!newItem) return;
    const taskToSend = { title: newItem, isCompleted: false, priority: parseInt(newPriority), dueDate: newDueDate ? newDueDate : null };
    fetch(API_URL, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskToSend) })
    .then(res => res.json()).then(() => { setNewItem(""); setNewPriority(1); setNewDueDate(""); fetchAPI(); });
  };
  const deleteItem = (id) => { fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(res => { if(res.ok) fetchAPI(); }); };
  const toggleComplete = (item) => { updateRequest({ ...item, isCompleted: !item.isCompleted }); };
  const updateRequest = (taskObj) => { fetch(`${API_URL}/${taskObj.id}`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskObj) }).then(res => { if(res.ok) fetchAPI(); }); };
  
  // Edit logic
  const startEditing = (item) => { setEditingId(item.id); setEditTitle(item.title); setEditPriority(item.priority); setEditDate(item.dueDate ? item.dueDate.split('T')[0] : ""); };
  const saveEdit = (id, cur) => { updateRequest({ id, title: editTitle, isCompleted: cur, priority: parseInt(editPriority), dueDate: editDate ? editDate : null }); setEditingId(null); };

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

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
             <h2 className={`fw-bold ${darkMode ? 'text-info' : 'text-primary'}`}>🚀 Görev Yöneticisi</h2>
             
             <div className="d-flex gap-2">
                {/* İSTATİSTİK BUTONU */}
                <button className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} onClick={() => setShowDashboard(!showDashboard)}>
                  {showDashboard ? "Gizle" : "📊 Analiz"}
                </button>

                {/* --- DARK MODE BUTONU --- */}
                <button 
                  className={`btn ${darkMode ? 'btn-warning' : 'btn-secondary'}`} 
                  onClick={() => setDarkMode(!darkMode)}
                  style={{ minWidth: "50px" }}
                >
                  {darkMode ? "☀️" : "🌙"}
                </button>
             </div>
          </div>

          {/* DASHBOARD */}
          {showDashboard && (
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm h-100">
                  <div className="card-header fw-bold text-center">Durum Analizi</div>
                  <div className="card-body d-flex justify-content-center" style={{maxHeight: "300px"}}>
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </div>
              </div>
              <div className="col-md-6 mt-3 mt-md-0">
                 <div className="card shadow-sm h-100">
                  <div className="card-header fw-bold text-center">Öncelik Dağılımı</div>
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

              {/* FİLTRE & ARAMA ALANI (Rengi CSS değişkeninden alacak) */}
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
              
              {/* EKLEME */}
              <div className="row g-2 mb-4">
                <div className="col-md-5"><input type="text" className="form-control" placeholder="Yeni görev..." value={newItem} onChange={(e) => setNewItem(e.target.value)} /></div>
                <div className="col-md-3"><input type="date" className="form-control" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} /></div>
                <div className="col-md-3"><select className="form-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}><option value="1">🟢 Düşük</option><option value="2">🟡 Orta</option><option value="3">🔴 Yüksek</option></select></div>
                <div className="col-md-1"><button className="btn btn-success w-100" onClick={addItem}>+</button></div>
              </div>

              {/* LİSTE */}
              <ul className="list-group list-group-flush">
                {filteredTodos.map((gorev) => (
                  <li key={gorev.id} className="list-group-item">
                    {editingId === gorev.id ? (
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <input type="text" className="form-control" style={{flex:1}} value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                        <select className="form-select" style={{width:"110px"}} value={editPriority} onChange={(e)=>setEditPriority(e.target.value)}><option value="1">Düşük</option><option value="2">Orta</option><option value="3">Yüksek</option></select>
                        <input type="date" className="form-control" style={{width:"140px"}} value={editDate} onChange={(e)=>setEditDate(e.target.value)} />
                        <button className="btn btn-sm btn-success" onClick={() => saveEdit(gorev.id, gorev.isCompleted)}>💾</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>🚫</button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleComplete(gorev)}>
                          <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>{gorev.isCompleted ? "✅" : "⬜"}</span>
                          <span style={{ 
                            textDecoration: gorev.isCompleted ? "line-through" : "none", 
                            fontWeight: "500",
                            color: gorev.isCompleted ? (darkMode ? '#777' : '#aaa') : 'inherit'
                          }}>{gorev.title}</span>
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