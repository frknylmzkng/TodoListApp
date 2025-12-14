import React, { useState, useEffect } from 'react';
import './App.css'; // Kendi özel CSS'in varsa dursun, yoksa silebilirsin

function App() {
  const [todos, setTodos] = useState([]);
  const [newItem, setNewItem] = useState("");

  const API_URL = "https://localhost:7221/api/Todo"; // Senin port numaran 7221 idi, aynen kalsın

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
    const taskToSend = { title: newItem, isCompleted: false };

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskToSend),
    })
    .then(res => res.json())
    .then(data => {
      setTodos([...todos, data]);
      setNewItem("");
    });
  };

  const toggleComplete = (id, currentStatus, title) => {
    const newStatus = !currentStatus;
    const updatedTask = { id: id, title: title, isCompleted: newStatus };

    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
    .then(res => {
      if(res.ok) {
        const updatedList = todos.map(item => 
          item.id === id ? { ...item, isCompleted: newStatus } : item
        );
        setTodos(updatedList);
      }
    });
  };

  const deleteItem = (id) => {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })
    .then(res => {
      if(res.ok) {
        const updatedList = todos.filter(item => item.id !== id);
        setTodos(updatedList);
      }
    });
  };

  // --- HTML TASARIM KISMI (Burayı tamamen değiştirdik) ---
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          {/* KART (ÇERÇEVE) BAŞLANGICI */}
          <div className="card shadow-lg border-0">
            
            {/* Kart Başlığı */}
            <div className="card-header bg-primary text-white text-center py-3">
              <h2 className="mb-0">🚀 Yapılacaklar Listesi</h2>
            </div>

            {/* Kart Gövdesi */}
            <div className="card-body">
              
              {/* Giriş Alanı ve Buton */}
              <div className="input-group mb-4">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Bugün ne yapacaksın?" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()} // Enter'a basınca da eklesin
                />
                <button className="btn btn-success" type="button" onClick={addItem}>
                  Ekle +
                </button>
              </div>

              {/* Liste */}
              <ul className="list-group list-group-flush">
                {todos.map((gorev) => (
                  <li 
                    key={gorev.id} 
                    className={`list-group-item d-flex justify-content-between align-items-center ${gorev.isCompleted ? 'bg-light' : ''}`}
                  >
                    {/* Görev Yazısı */}
                    <span 
                      onClick={() => toggleComplete(gorev.id, gorev.isCompleted, gorev.title)}
                      style={{ 
                        textDecoration: gorev.isCompleted ? "line-through" : "none", 
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: gorev.isCompleted ? "#aaa" : "#333",
                        flex: 1
                      }}
                    >
                      {gorev.isCompleted ? "✅ " : "⬜ "} 
                      {gorev.title}
                    </span>

                    {/* Sil Butonu */}
                    <button 
                      onClick={() => deleteItem(gorev.id)}
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Sil"
                    >
                      X
                    </button>
                  </li>
                ))}
                
                {todos.length === 0 && (
                  <div className="text-center text-muted mt-3">
                    Henüz bir görev yok. Hadi bir tane ekle! 🎉
                  </div>
                )}
              </ul>

            </div>
          </div>
          {/* KART BİTİŞİ */}

        </div>
      </div>
    </div>
  );
}

export default App;