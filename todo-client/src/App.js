import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  
  // Ekleme State'leri
  const [newItem, setNewItem] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");

  // Düzenleme State'leri
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editDate, setEditDate] = useState("");

  // YENİ: ARAMA VE FİLTRE STATE'LERİ
  const [searchTerm, setSearchTerm] = useState(""); // Arama kutusuna yazılan
  const [filterType, setFilterType] = useState("all"); // all, active, completed, high

  const API_URL = "https://localhost:7221/api/Todo";

  useEffect(() => {
    fetchAPI();
  }, []);

  const fetchAPI = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error(err));
  };

  // --- CRUD İŞLEMLERİ (Ekle, Sil, Güncelle) ---
  const addItem = () => {
    if (!newItem) return;
    const taskToSend = { 
      title: newItem, 
      isCompleted: false,
      priority: parseInt(newPriority),
      dueDate: newDueDate ? newDueDate : null
    };

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskToSend),
    })
    .then(res => res.json())
    .then(() => {
      setNewItem("");
      setNewPriority(1);
      setNewDueDate("");
      fetchAPI();
    });
  };

  const deleteItem = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(res => { if(res.ok) fetchAPI(); });
  };

  const toggleComplete = (item) => {
    const updatedTask = { ...item, isCompleted: !item.isCompleted };
    updateRequest(updatedTask);
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPriority(item.priority);
    setEditDate(item.dueDate ? item.dueDate.split('T')[0] : ""); 
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = (id, currentIsCompleted) => {
    const updatedTask = {
      id: id,
      title: editTitle,
      isCompleted: currentIsCompleted,
      priority: parseInt(editPriority),
      dueDate: editDate ? editDate : null
    };
    updateRequest(updatedTask);
    setEditingId(null);
  };

  const updateRequest = (taskObj) => {
    fetch(`${API_URL}/${taskObj.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskObj)
    })
    .then(res => { if(res.ok) fetchAPI(); });
  };

  // --- MANTIK: FİLTRELEME MOTORU ---
  // Bu kısım çok önemli. Ekrana 'todos'u değil, bu 'filteredTodos'u basacağız.
  const filteredTodos = todos.filter((item) => {
    // 1. Arama Kriteri (Büyük/küçük harf duyarsız)
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Kategori Kriteri
    let matchesFilter = true;
    if (filterType === "active") matchesFilter = !item.isCompleted;       // Sadece yapılmayanlar
    if (filterType === "completed") matchesFilter = item.isCompleted;     // Sadece yapılanlar
    if (filterType === "high") matchesFilter = item.priority === 3;       // Sadece Yüksek Öncelik

    return matchesSearch && matchesFilter;
  });


  // --- GÖRÜNÜM YARDIMCILARI ---
  const getPriorityBadge = (p) => {
    if(p === 1) return <span className="badge bg-success ms-2">Düşük</span>;
    if(p === 2) return <span className="badge bg-warning text-dark ms-2">Orta</span>;
    if(p === 3) return <span className="badge bg-danger ms-2">Yüksek</span>;
    return <span className="badge bg-secondary ms-2">Bilinmiyor</span>;
  };

  const formatDateInfo = (dateString, isCompleted) => {
    if (!dateString) return null;
    const due = new Date(dateString);
    const now = new Date();
    now.setHours(0,0,0,0); due.setHours(0,0,0,0);
    const isPast = due < now;
    const formattedDate = new Date(dateString).toLocaleDateString('tr-TR');

    return (
      <span className="ms-2 text-muted" style={{ fontSize: "0.85rem" }}>
        📅 {formattedDate}
        {!isCompleted && isPast && <span className="badge bg-danger ms-1">GECİKTİ!</span>}
      </span>
    );
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-9">
          <div className="card shadow-lg border-0">
            
            <div className="card-header bg-primary text-white text-center py-3">
              <h2 className="mb-0">🚀 Görev Kontrol Merkezi</h2>
            </div>

            <div className="card-body">

              {/* --- YENİ BÖLÜM: ARAMA VE FİLTRE --- */}
              <div className="row mb-4 p-3 bg-light rounded mx-1">
                <div className="col-md-6 mb-2 mb-md-0">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="🔍 Görev ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-6 d-flex justify-content-md-end gap-2">
                  <button className={`btn btn-sm ${filterType==='all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('all')}>Tümü</button>
                  <button className={`btn btn-sm ${filterType==='active' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('active')}>Yapılacaklar</button>
                  <button className={`btn btn-sm ${filterType==='completed' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>setFilterType('completed')}>Bitenler</button>
                  <button className={`btn btn-sm ${filterType==='high' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={()=>setFilterType('high')}>🔥 Acil</button>
                </div>
              </div>
              
              {/* EKLEME ALANI */}
              <div className="row g-2 mb-4">
                <div className="col-md-5">
                  <input type="text" className="form-control" placeholder="Yeni görev..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <input type="date" className="form-control" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                </div>
                <div className="col-md-3">
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

              {/* LİSTE (Artık filteredTodos kullanıyoruz) */}
              <ul className="list-group list-group-flush">
                {filteredTodos.length === 0 && (
                  <div className="text-center text-muted my-3">
                    Aradığınız kriterde görev bulunamadı. 🤷‍♂️
                  </div>
                )}

                {filteredTodos.map((gorev) => (
                  <li key={gorev.id} className={`list-group-item ${gorev.isCompleted ? 'bg-light' : ''}`}>
                    
                    {editingId === gorev.id ? (
                      // DÜZENLEME MODU
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <input type="text" className="form-control" style={{flex:1}} value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                        <select className="form-select" style={{width:"110px"}} value={editPriority} onChange={(e)=>setEditPriority(e.target.value)}>
                          <option value="1">Düşük</option>
                          <option value="2">Orta</option>
                          <option value="3">Yüksek</option>
                        </select>
                        <input type="date" className="form-control" style={{width:"140px"}} value={editDate} onChange={(e)=>setEditDate(e.target.value)} />
                        <button className="btn btn-sm btn-success" onClick={() => saveEdit(gorev.id, gorev.isCompleted)}>💾</button>
                        <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>🚫</button>
                      </div>
                    ) : (
                      // NORMAL GÖRÜNÜM
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleComplete(gorev)}>
                          <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>{gorev.isCompleted ? "✅" : "⬜"}</span>
                          <span style={{ textDecoration: gorev.isCompleted ? "line-through" : "none", fontWeight: "500" }}>{gorev.title}</span>
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