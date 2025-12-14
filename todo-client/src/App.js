import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  
  // Yeni Ekleme State'leri
  const [newItem, setNewItem] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");

  // DÜZENLEME (EDIT) MODU STATE'LERİ
  const [editingId, setEditingId] = useState(null); // Hangi satır düzenleniyor?
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editDate, setEditDate] = useState("");

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
    // Tamamlama durumunu değiştirirken diğer verileri koru
    const updatedTask = { ...item, isCompleted: !item.isCompleted };
    updateRequest(updatedTask);
  };

  // --- DÜZENLEME FONKSİYONLARI ---

  // 1. Düzenleme Modunu Aç
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPriority(item.priority);
    // Tarih varsa formatla (yyyy-MM-dd), yoksa boş bırak
    setEditDate(item.dueDate ? item.dueDate.split('T')[0] : ""); 
  };

  // 2. İptal Et
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // 3. Kaydet
  const saveEdit = (id, currentIsCompleted) => {
    const updatedTask = {
      id: id,
      title: editTitle,
      isCompleted: currentIsCompleted, // Tamamlanma durumu değişmesin
      priority: parseInt(editPriority),
      dueDate: editDate ? editDate : null
    };
    updateRequest(updatedTask);
    setEditingId(null); // Modu kapat
  };

  // Ortak Güncelleme İsteği
  const updateRequest = (taskObj) => {
    fetch(`${API_URL}/${taskObj.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskObj)
    })
    .then(res => { if(res.ok) fetchAPI(); });
  };

  // --- YARDIMCI GÖRÜNÜM ---
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
              <h2 className="mb-0">🚀 Profesyonel Takip</h2>
            </div>
            <div className="card-body">
              
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

              {/* LİSTE */}
              <ul className="list-group list-group-flush">
                {todos.map((gorev) => (
                  <li key={gorev.id} className={`list-group-item ${gorev.isCompleted ? 'bg-light' : ''}`}>
                    
                    {/* --- GÖRÜNÜM MANTIĞI: DÜZENLEME MODUNDA MIYIZ? --- */}
                    {editingId === gorev.id ? (
                      // 1. EVET: DÜZENLEME FORMUNU GÖSTER
                      <div className="d-flex gap-2 align-items-center">
                        <input type="text" className="form-control" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                        <select className="form-select" style={{width:"130px"}} value={editPriority} onChange={(e)=>setEditPriority(e.target.value)}>
                          <option value="1">Düşük</option>
                          <option value="2">Orta</option>
                          <option value="3">Yüksek</option>
                        </select>
                        <input type="date" className="form-control" style={{width:"150px"}} value={editDate} onChange={(e)=>setEditDate(e.target.value)} />
                        
                        <button className="btn btn-sm btn-success" onClick={() => saveEdit(gorev.id, gorev.isCompleted)}>💾</button>
                        <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>🚫</button>
                      </div>
                    ) : (
                      // 2. HAYIR: NORMAL GÖRÜNÜMÜ GÖSTER
                      <div className="d-flex justify-content-between align-items-center">
                        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleComplete(gorev)}>
                          <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>{gorev.isCompleted ? "✅" : "⬜"}</span>
                          <span style={{ textDecoration: gorev.isCompleted ? "line-through" : "none", fontWeight: "500" }}>{gorev.title}</span>
                          {getPriorityBadge(gorev.priority)}
                          {formatDateInfo(gorev.dueDate, gorev.isCompleted)}
                        </div>
                        
                        <div>
                          {/* DÜZENLE BUTONU (Kalem) */}
                          <button className="btn btn-outline-primary btn-sm me-2 rounded-circle" style={{ width: "32px", height: "32px" }} onClick={() => startEditing(gorev)}>✏️</button>
                          
                          {/* SİL BUTONU (X) */}
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