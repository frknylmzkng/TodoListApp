import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// FULLCALENDAR
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap-icons/font/bootstrap-icons.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const TodoPage = ({ userId, darkMode, setDarkMode, onLogout }) => {
  // ANA VERİLER
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]); // <--- YENİ: Kategori Listesi
  const [isLoading, setIsLoading] = useState(true);
  
  // FORM STATE'LERİ
  const [newItem, setNewItem] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");
  const [newCategory, setNewCategory] = useState(""); // Varsayılan değer API'den gelince set edilecek

  // DÜZENLEME STATE'LERİ
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // GÖRÜNÜM MODLARI
  const [showDashboard, setShowDashboard] = useState(false); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);

  // POMODORO STATE
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work");
  const timerRef = useRef(null);

  const API_URL = "https://localhost:7221/api/Todo";
  const CAT_API_URL = "https://localhost:7221/api/Categories"; // <--- YENİ API URL

  useEffect(() => {
    if (userId) {
        fetchCategories(); // Önce kategorileri çek
        fetchAPI();        // Sonra görevleri çek
    }
  }, [userId]);

  // --- KATEGORİ YÖNETİMİ (YENİ) ---
  const fetchCategories = () => {
    fetch(`${CAT_API_URL}?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
            setCategories(data);
            if(data.length > 0 && newCategory === "") {
                setNewCategory(data[0].name); // İlk kategoriyi seçili yap
            }
        });
  };

  const handleCategorySettings = async () => {
    // Kullanıcıya ne yapmak istediğini sor
    const { value: action } = await Swal.fire({
        title: 'Kategori Yönetimi',
        input: 'radio',
        inputOptions: {
            'add': '➕ Yeni Kategori Ekle',
            'delete': '🗑️ Kategori Sil'
        },
        inputValidator: (value) => {
            if (!value) return 'Bir seçenek seçmelisiniz!';
        },
        showCancelButton: true,
        confirmButtonText: 'Devam Et',
        cancelButtonText: 'İptal',
        background: darkMode ? '#333' : '#fff',
        color: darkMode ? '#fff' : '#000'
    });

    if (action === 'add') {
        // --- EKLEME MODU ---
        const { value: formValues } = await Swal.fire({
            title: 'Yeni Kategori',
            html:
              '<input id="swal-input1" class="swal2-input" placeholder="Kategori Adı">' +
              '<input id="swal-input2" type="color" class="swal2-input" style="height:50px; width:100px;" value="#0d6efd">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Kaydet',
            background: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
            preConfirm: () => {
              return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value
              ]
            }
        });

        if (formValues && formValues[0]) {
            const newCat = { name: formValues[0], color: formValues[1], userId: parseInt(userId) };
            fetch(CAT_API_URL, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            }).then(res => {
                if(res.ok) {
                    toast.success("Kategori eklendi!");
                    fetchCategories();
                }
            });
        }
    } 
    else if (action === 'delete') {
        // --- SİLME MODU ---
        // Kategorileri seçenek olarak hazırla
        const options = {};
        categories.forEach(c => options[c.id] = c.name);

        const { value: catId } = await Swal.fire({
            title: 'Hangi kategori silinsin?',
            input: 'select',
            inputOptions: options,
            inputPlaceholder: 'Kategori seçin',
            showCancelButton: true,
            confirmButtonText: 'Sil',
            confirmButtonColor: '#d33',
            background: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
            showClass: { popup: 'animate__animated animate__fadeInDown' }
        });

        if (catId) {
            fetch(`${CAT_API_URL}/${catId}`, { method: "DELETE" })
                .then(res => {
                    if(res.ok) {
                        toast.info("Kategori silindi.");
                        fetchCategories();
                    }
                });
        }
    }
  };

  // --- POMODORO SAYACI ---
  useEffect(() => {
    if (isActive && timer > 0) {
      timerRef.current = setInterval(() => { setTimer((prev) => prev - 1); }, 1000);
    } else if (timer === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      if(mode === "work") { toast.success("Mola Zamanı! ☕"); setMode("break"); setTimer(5 * 60); } 
      else { toast.info("İş Başı! 🚀"); setMode("work"); setTimer(25 * 60); }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timer, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setMode("work"); setTimer(25 * 60); };
  const formatTime = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };

  // --- API VE VERİ İŞLEMLERİ ---
  const fetchAPI = () => {
    setIsLoading(true);
    fetch(`${API_URL}?userId=${userId}`)
      .then(res => res.json())
      .then(data => { setTodos(data); setIsLoading(false); })
      .catch(err => { console.error(err); setIsLoading(false); toast.error("Veri hatası!"); });
  };

  // Takvim ve Grafik Verileri
  const calendarEvents = todos.map(todo => {
    // Kategorinin rengini bul
    const catObj = categories.find(c => c.name === todo.category);
    const eventColor = catObj ? catObj.color : (todo.isCompleted ? '#198754' : '#0d6efd');
    
    return {
        id: todo.id.toString(),
        title: todo.title,
        date: todo.dueDate ? todo.dueDate.split('T')[0] : new Date(),
        backgroundColor: eventColor,
        borderColor: 'transparent',
        allDay: true
    };
  });

  // --- ALT GÖREVLER ---
  const handleAddSubTask = async (todoId) => {
    const { value: text } = await Swal.fire({ title: 'Yeni Alt Adım', input: 'text', showCancelButton: true, confirmButtonText: 'Ekle', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' });
    if (text) {
      fetch(`${API_URL}/subtask`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: text, isCompleted: false, todoItemId: todoId }) })
      .then(res => { if(res.ok) { toast.success("Alt adım eklendi"); fetchAPI(); } });
    }
  };
  const handleToggleSubTask = (subId) => { fetch(`${API_URL}/subtask/${subId}`, { method: "PUT" }).then(res => { if(res.ok) fetchAPI(); }); };
  const handleDeleteSubTask = (subId) => { fetch(`${API_URL}/subtask/${subId}`, { method: "DELETE" }).then(res => { if(res.ok) { toast.info("Silindi"); fetchAPI(); } }); };

  // --- SÜRÜKLE BIRAK & CRUD ---
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
    const sortedIds = items.map(t => t.id);
    fetch(`${API_URL}/reorder?userId=${userId}`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sortedIds) });
  };

  const addItem = () => {
    if (!newItem) { toast.warn("Görev adı boş olamaz!"); return; }
    // Eğer kategori seçilmediyse listenin ilkini al
    const catToSend = newCategory || (categories.length > 0 ? categories[0].name : "Genel");
    
    const taskToSend = { title: newItem, isCompleted: false, priority: parseInt(newPriority), dueDate: newDueDate || null, category: catToSend, userId: parseInt(userId), orderIndex: todos.length };
    fetch(API_URL, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskToSend) })
    .then(res => res.json()).then(() => { toast.success("Eklendi!"); setNewItem(""); setNewPriority(1); setNewDueDate(""); fetchAPI(); });
  };

  const deleteItem = (id) => { Swal.fire({ title: 'Silinsin mi?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Evet', confirmButtonColor: '#d33', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' }).then((r) => { if (r.isConfirmed) fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(res => { if(res.ok) { toast.info("Silindi"); fetchAPI(); } }); }); };
  const toggleComplete = (item) => { updateRequest({ ...item, isCompleted: !item.isCompleted }); };
  const updateRequest = (taskObj) => { fetch(`${API_URL}/${taskObj.id}`, { method: "PUT", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taskObj) }).then(res => { if(res.ok) fetchAPI(); }); };
  
  const startEditing = (item) => { setEditingId(item.id); setEditTitle(item.title); setEditPriority(item.priority); setEditDate(item.dueDate ? item.dueDate.split('T')[0] : ""); setEditCategory(item.category || (categories[0]?.name || "Genel")); };
  const saveEdit = (id, cur) => { updateRequest({ id, title: editTitle, isCompleted: cur, priority: parseInt(editPriority), dueDate: editDate || null, category: editCategory }); setEditingId(null); };

  // --- RENDERING HELPERS ---
  const filteredTodos = todos.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === "active") return matchesSearch && !item.isCompleted;
    if (filterType === "completed") return matchesSearch && item.isCompleted;
    if (filterType === "high") return matchesSearch && item.priority === 3;
    return matchesSearch;
  });

  const getPriorityBadge = (p) => { if(p===1) return <span className="badge bg-success ms-2">Düşük</span>; if(p===2) return <span className="badge bg-warning text-dark ms-2">Orta</span>; return <span className="badge bg-danger ms-2">Yüksek</span>; };
  
  // Rengi Kategorilerden bul
  const getCategoryBadge = (catName) => {
    const cat = categories.find(c => c.name === catName);
    const color = cat ? cat.color : "#6c757d"; // Bulamazsa gri yap
    return <span className="badge ms-2 text-white" style={{ backgroundColor: color }}>{catName}</span>;
  };

  const formatDateInfo = (d, c) => { if(!d) return null; const isPast = new Date(d) < new Date().setHours(0,0,0,0); return <span className={`ms-2 ${darkMode?'text-light opacity-75':'text-muted'}`} style={{fontSize:"0.85rem"}}>📅 {new Date(d).toLocaleDateString('tr-TR')}{!c && isPast && <span className="badge bg-danger ms-1">GECİKTİ</span>}</span> };
  
  // Dashboard Data
  const completedCount = todos.filter(t => t.isCompleted).length;
  const pieData = { labels: ['Biten', 'Bekleyen'], datasets: [{ data: [completedCount, todos.length - completedCount], backgroundColor: ['#198754', '#ffc107'], borderColor: darkMode ? '#333' : '#fff' }] };
  const barData = { labels: ['Düşük', 'Orta', 'Yüksek'], datasets: [{ label: 'Adet', data: [1, 2, 3].map(p => todos.filter(t=>t.priority===p).length), backgroundColor: ['#198754', '#0dcaf0', '#dc3545'] }] };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
         <h2 className={`fw-bold ${darkMode ? 'text-info' : 'text-primary'}`}>🚀 Görev Yöneticisi</h2>
         <div className="d-flex gap-2">
            <Link to="/profile" className="btn btn-outline-info">👤 Profil</Link>
            <div className="btn-group">
                <button className={`btn ${showDashboard?'btn-primary':'btn-outline-primary'}`} onClick={()=>{setShowDashboard(!showDashboard);setShowCalendar(false);setShowPomodoro(false);}}>📊 Analiz</button>
                <button className={`btn ${showCalendar?'btn-primary':'btn-outline-primary'}`} onClick={()=>{setShowCalendar(!showCalendar);setShowDashboard(false);setShowPomodoro(false);}}>📅 Takvim</button>
                <button className={`btn ${showPomodoro?'btn-danger':'btn-outline-danger'}`} onClick={()=>{setShowPomodoro(!showPomodoro);setShowDashboard(false);setShowCalendar(false);}}>🍅 Odaklan</button>
            </div>
            <button className={`btn ${darkMode?'btn-warning':'btn-secondary'}`} onClick={()=>setDarkMode(!darkMode)}>{darkMode?"☀️":"🌙"}</button>
            <button className="btn btn-danger" onClick={onLogout}>Çıkış</button>
         </div>
      </div>

      {showDashboard && <div className="row mb-4 animate__animated animate__fadeIn"><div className="col-md-6"><div className="card shadow-sm h-100"><div className="card-body d-flex justify-content-center" style={{maxHeight:"300px"}}><Pie data={pieData}/></div></div></div><div className="col-md-6"><div className="card shadow-sm h-100"><div className="card-body d-flex justify-content-center" style={{maxHeight:"300px"}}><Bar data={barData} options={{plugins:{legend:{display:false}}}}/></div></div></div></div>}
      
      {showCalendar && <div className="card shadow-lg mb-4 animate__animated animate__fadeIn"><div className="card-body"><FullCalendar plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin,bootstrap5Plugin]} initialView="dayGridMonth" themeSystem="bootstrap5" locale="tr" headerToolbar={{left:'prev,next today',center:'title',right:'dayGridMonth,timeGridWeek'}} events={calendarEvents} height="auto"/></div></div>}

      {showPomodoro && <div className="card shadow-lg mb-4 text-center p-5 animate__animated animate__fadeIn" style={{backgroundColor:mode==='work'?(darkMode?'#5c1e1e':'#fff0f0'):(darkMode?'#1e5c30':'#f0fff4')}}><h1 style={{fontSize:"6rem", color:mode==='work'?'#dc3545':'#198754'}}>{formatTime(timer)}</h1><h3>{mode==='work'?"🔨 ÇALIŞMA":"☕ MOLA"}</h3><div className="d-flex justify-content-center gap-3"><button className="btn btn-lg btn-primary" onClick={toggleTimer}>{isActive?"Duraklat":"Başlat"}</button><button className="btn btn-lg btn-secondary" onClick={resetTimer}>Sıfırla</button></div></div>}

      {!showCalendar && !showDashboard && !showPomodoro && (
      <div className="card shadow-lg">
        <div className={`card-header py-3 ${darkMode?'bg-secondary text-white':'bg-primary text-white'}`}><h5 className="mb-0 text-center">Listem</h5></div>
        <div className="card-body">
          <div className="row mb-4 p-3 rounded mx-1" style={{border:"1px solid var(--border-color)", backgroundColor:"rgba(0,0,0,0.03)"}}>
             <div className="col-md-6"><input className="form-control" placeholder="🔍 Ara..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/></div>
             <div className="col-md-6 d-flex justify-content-end gap-2"><button className="btn btn-sm btn-primary" onClick={()=>setFilterType('all')}>Tümü</button><button className="btn btn-sm btn-outline-primary" onClick={()=>setFilterType('active')}>Yapılacak</button><button className="btn btn-sm btn-outline-primary" onClick={()=>setFilterType('completed')}>Biten</button><button className="btn btn-sm btn-outline-danger" onClick={()=>setFilterType('high')}>Acil</button></div>
          </div>
          
          {/* YENİ GÖREV EKLEME ALANI - DİNAMİK KATEGORİ İLE */}
          <div className="row g-2 mb-4">
            <div className="col-md-4"><input className="form-control" placeholder="Yeni görev..." value={newItem} onChange={(e)=>setNewItem(e.target.value)}/></div>
            
            {/* KATEGORİ SEÇİMİ VE AYAR BUTONU */}
            <div className="col-md-3 d-flex gap-1">
                <select className="form-select" value={newCategory} onChange={(e)=>setNewCategory(e.target.value)}>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <button className="btn btn-outline-secondary" onClick={handleCategorySettings} title="Kategori Yönetimi">⚙️</button>
            </div>

            <div className="col-md-2"><input type="date" className="form-control" value={newDueDate} onChange={(e)=>setNewDueDate(e.target.value)}/></div>
            <div className="col-md-2"><select className="form-select" value={newPriority} onChange={(e)=>setNewPriority(e.target.value)}><option value="1">Düşük</option><option value="2">Orta</option><option value="3">Yüksek</option></select></div>
            <div className="col-md-1"><button className="btn btn-success w-100" onClick={addItem}>+</button></div>
          </div>

          {isLoading ? (
            <div className="mt-3">{[...Array(6)].map((_, i) => (<div key={i} className="mb-2"><Skeleton height={60} borderRadius={8} baseColor={darkMode?"#2c3034":"#e0e0e0"} highlightColor={darkMode?"#444":"#f5f5f5"}/></div>))}</div>
          ) : (
            <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="todoList">
              {(provided) => (
                <ul className="list-group list-group-flush" {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredTodos.map((t, index) => (
                    <Draggable key={t.id} draggableId={t.id.toString()} index={index} isDragDisabled={filterType !== 'all' || searchTerm !== ""}>
                      {(provided, snapshot) => (
                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`list-group-item ${snapshot.isDragging?'bg-info bg-opacity-25 shadow':''}`} style={{...provided.draggableProps.style}}>
                          {editingId===t.id ? (
                            <div className="d-flex gap-2 flex-wrap">
                              <input className="form-control" style={{flex:1}} value={editTitle} onChange={(e)=>setEditTitle(e.target.value)}/>
                              {/* DÜZENLEME MODUNDA DİNAMİK KATEGORİ */}
                              <select className="form-select" style={{width:"120px"}} value={editCategory} onChange={(e)=>setEditCategory(e.target.value)}>
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                              </select>
                              <button className="btn btn-success btn-sm" onClick={()=>saveEdit(t.id, t.isCompleted)}>💾</button>
                              <button className="btn btn-secondary btn-sm" onClick={()=>setEditingId(null)}>🚫</button>
                            </div>
                          ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div style={{flex:1, cursor:"pointer", display:"flex", alignItems:"center"}}>
                                     <span className="text-muted me-2" style={{cursor:"grab"}}>⋮⋮</span>
                                     <div onClick={()=>toggleComplete(t)} style={{flex:1}}>
                                        <span style={{marginRight:"10px"}}>{t.isCompleted?"✅":"⬜"}</span>
                                        <span style={{textDecoration:t.isCompleted?"line-through":"none", color:t.isCompleted?(darkMode?'#777':'#aaa'):'inherit', fontWeight: "500"}}>{t.title}</span>
                                        
                                        {/* RENKLİ KATEGORİ ROZETİ */}
                                        {getCategoryBadge(t.category)}

                                        {getPriorityBadge(t.priority)} {formatDateInfo(t.dueDate, t.isCompleted)}
                                     </div>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <button className="btn btn-sm btn-outline-secondary me-2 rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }} onClick={() => handleAddSubTask(t.id)} title="Alt Adım Ekle"><span style={{ fontSize: "22px", lineHeight: 0, paddingBottom: "2px" }}>+</span></button>
                                    <button className="btn btn-outline-primary btn-sm me-2 rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:"32px", height:"32px"}} onClick={()=>startEditing(t)}><span style={{ fontSize: "16px", lineHeight: 0 }}>✏️</span></button>
                                    <button className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center" style={{width:"32px", height:"32px"}} onClick={()=>deleteItem(t.id)}><span style={{ fontSize: "16px", lineHeight: 0 }}>❌</span></button>
                                  </div>
                                </div>
                                {t.subItems && t.subItems.length > 0 && (<div className="mt-2 ps-4 border-start border-3 border-light">{t.subItems.map(sub => (<div key={sub.id} className="d-flex justify-content-between align-items-center mb-1" style={{fontSize: "0.9rem"}}><div onClick={() => handleToggleSubTask(sub.id)} style={{cursor: "pointer", color: sub.isCompleted ? "#aaa" : "inherit"}}>{sub.isCompleted ? "☑️" : "⬜"} {sub.isCompleted ? <del>{sub.title}</del> : sub.title}</div><button className="btn btn-link text-danger p-0 ms-2" style={{textDecoration:"none"}} onClick={() => handleDeleteSubTask(sub.id)}>×</button></div>))}</div>)}
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default TodoPage;