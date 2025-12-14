import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newItem, setNewItem] = useState("");
  
  // YENİ STATE: Varsayılan olarak 1 (Düşük) seçili gelsin
  const [newPriority, setNewPriority] = useState(1);

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

    // Backend'e artık Priority bilgisini de gönderiyoruz
    const taskToSend = { 
      title: newItem, 
      isCompleted: false,
      priority: parseInt(newPriority) // Sayı olduğundan emin olalım
    };

    fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskToSend),
    })
    .then(res => res.json())
    .then(data => {
      setTodos([...todos, data]);
      setNewItem("");
      setNewPriority(1); // Ekledikten sonra tekrar "Düşük"e sıfırla
    });
  };

  const toggleComplete = (id, currentStatus, title, priority) => {
    const newStatus = !currentStatus;
    // Güncellerken priority kaybolmasın diye onu da geri gönderiyoruz
    const updatedTask = { id: id, title: title, isCompleted: newStatus, priority: priority };

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

  // Öncelik puanına göre Rozet (Badge) rengini ayarlayan yardımcı fonksiyon
  const getPriorityBadge = (p) => {
    if(p === 1) return <span className="badge bg-success ms-2">Düşük</span>;      // Yeşil
    if(p === 2) return <span className="badge bg-warning text-dark ms-2">Orta</span>; // Sarı
    if(p === 3) return <span className="badge bg-danger ms-2">Yüksek</span>;      // Kırmızı
    return <span className="badge bg-secondary ms-2">Bilinmiyor</span>;
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-3">
              <h2 className="mb-0">🚀 Gelişmiş Yapılacaklar Listesi</h2>
            </div>

            <div className="card-body">
              
              {/* GİRİŞ ALANI (Input Group) */}
              <div className="input-group mb-4">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Yeni görev..." 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />
                
                {/* ÖNCELİK SEÇİM KUTUSU */}
                <select 
                  className="form-select" 
                  style={{maxWidth: "120px"}}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="1">🟢 Düşük</option>
                  <option value="2">🟡 Orta</option>
                  <option value="3">🔴 Yüksek</option>
                </select>

                <button className="btn btn-success" type="button" onClick={addItem}>
                  Ekle +
                </button>
              </div>

              {/* LİSTE */}
              <ul className="list-group list-group-flush">
                {todos.map((gorev) => (
                  <li 
                    key={gorev.id} 
                    className={`list-group-item d-flex justify-content-between align-items-center ${gorev.isCompleted ? 'bg-light' : ''}`}
                  >
                    <div 
                      onClick={() => toggleComplete(gorev.id, gorev.isCompleted, gorev.title, gorev.priority)}
                      style={{ flex: 1, cursor: "pointer" }}
                    >
                      {/* Checkbox görünümü */}
                      <span style={{ fontSize: "1.2rem", marginRight: "10px" }}>
                        {gorev.isCompleted ? "✅" : "⬜"}
                      </span>
                      
                      {/* Görev Başlığı */}
                      <span style={{ 
                          textDecoration: gorev.isCompleted ? "line-through" : "none",
                          color: gorev.isCompleted ? "#aaa" : "#333",
                          fontWeight: "500"
                        }}>
                        {gorev.title}
                      </span>

                      {/* ÖNCELİK ROZETİ BURAYA GELİYOR */}
                      {getPriorityBadge(gorev.priority)}

                    </div>

                    <button 
                      onClick={() => deleteItem(gorev.id)}
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      style={{ width: "32px", height: "32px", lineHeight: "15px" }}
                    >
                      X
                    </button>
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