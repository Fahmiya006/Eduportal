// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API = "https://eduportal-1-7dk7.onrender.com";

function gradeToValue(grade) {
  const map = { 'S': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C+': 5, 'C': 4, 'U': 0 };
  if (!grade) return 0;
  return map[String(grade).toUpperCase()] ?? 0;
}

function percentChange(oldVal, newVal) {
  if (oldVal === 0) return newVal === 0 ? 0 : 100;
  return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
}

function App() {

  const [currentPage, setCurrentPage] = useState('home');
  const [showMore, setShowMore] = useState(false);
  const [navbarSolid, setNavbarSolid] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [studentInput, setStudentInput] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);

  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    assess1: '',
    assess2: '',
    endSem: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // 🔥 GET STUDENTS
  useEffect(() => {
    fetch(`${API}/students`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Backend error:", err));
  }, []);

  useEffect(() => {
    const onScroll = () => setNavbarSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAdminLogin = () => {
    if (adminPinInput === '4036') {
      setIsAdminLoggedIn(true);
      setAdminPinInput('');
    } else {
      alert("Access Denied: Incorrect PIN");
      setAdminPinInput('');
    }
  };

  const handleAdminCRUD = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      assess1: formData.assess1.toUpperCase(),
      assess2: formData.assess2.toUpperCase(),
      endSem: formData.endSem.toUpperCase()
    };

    if (isEditing) {
      fetch(`${API}/students/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        setStudents(students.map(s =>
          String(s._id) === String(formData.id) ? { ...s, ...payload } : s
        ));
        setIsEditing(false);
      });
    } else {
      fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(newStudent => setStudents([...students, newStudent]));
    }

    setFormData({ id: null, name: '', email: '', assess1: '', assess2: '', endSem: '' });
  };

  const handleDelete = (id) => {
    fetch(`${API}/students/${id}`, { method: 'DELETE' })
      .then(() => setStudents(students.filter(s => String(s._id) !== String(id))));
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setCurrentStudent(null);
    setStudentInput('');
  };

  const chartDataFor = (student) => ({
    labels: ['Assess 1', 'Assess 2', 'End Sem'],
    datasets: [{
      label: 'Performance',
      data: [
        gradeToValue(student.assess1),
        gradeToValue(student.assess2),
        gradeToValue(student.endSem)
      ],
      fill: true,
      backgroundColor: 'rgba(80,200,120,0.12)',
      borderColor: '#50c878',
      tension: 0.35
    }]
  });

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 10 } }
  };

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className={`navbar ${navbarSolid ? 'solid' : 'transparent'}`}>
        <div className="nav-logo" onClick={() => setCurrentPage('home')}>
          EDU<span>PORTAL</span>
        </div>
        <ul className="nav-links">
          {['home','admin','student','contact'].map(id => (
            <li key={id}>
              <button
                className={currentPage===id ? 'active':''}
                onClick={()=>setCurrentPage(id)}>
                {id.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">

        {/* HOME */}
        {currentPage==='home' && (
          <div className="hero fadeIn">
            {!showMore ? (
              <>
                <h1>Welcome to Your <span>Future</span></h1>
                <p>Academic excellence starts here.</p>
                <button className="cta-btn" onClick={()=>setShowMore(true)}>
                  Learn More
                </button>
              </>
            ) : (
              <>
                <h2>Platform Insights</h2>
                <button className="back-btn" onClick={()=>setShowMore(false)}>
                  Go Back
                </button>
              </>
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage==='admin' && (
          <div className="admin-container fadeIn">
            {!isAdminLoggedIn ? (
              <div className="login-card">
                <h2>Admin Access</h2>
                <input
                  type="password"
                  placeholder="Enter 4-Digit PIN"
                  value={adminPinInput}
                  onChange={e=>setAdminPinInput(e.target.value)}
                />
                <button className="login-btn" onClick={handleAdminLogin}>
                  Enter Dashboard
                </button>
              </div>
            ) : (
              <div className="crud-section">
                <h2>Student Registry</h2>

                <form onSubmit={handleAdminCRUD} className="crud-form">
                  <input placeholder="Name"
                    value={formData.name}
                    onChange={e=>setFormData({...formData,name:e.target.value})} required />
                  <input placeholder="Email"
                    value={formData.email}
                    onChange={e=>setFormData({...formData,email:e.target.value})} required />
                  <input placeholder="Assess 1"
                    value={formData.assess1}
                    onChange={e=>setFormData({...formData,assess1:e.target.value})} required />
                  <input placeholder="Assess 2"
                    value={formData.assess2}
                    onChange={e=>setFormData({...formData,assess2:e.target.value})} required />
                  <input placeholder="End Sem"
                    value={formData.endSem}
                    onChange={e=>setFormData({...formData,endSem:e.target.value})} required />
                  <button type="submit" className="cta-btn">
                    {isEditing ? "Update Student" : "Add Student"}
                  </button>
                </form>

                <div className="table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>A1</th>
                        <th>A2</th>
                        <th>End</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s=>(
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.assess1}</td>
                          <td>{s.assess2}</td>
                          <td>{s.endSem}</td>
                          <td>
                            <button className="edit-link"
                              onClick={()=>{setFormData({...s,id:s._id});setIsEditing(true);}}>
                              Edit
                            </button>
                            <button className="delete-link"
                              onClick={()=>handleDelete(s._id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="back-btn" onClick={logout}>
                  Logout Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* STUDENT */}
        {currentPage==='student' && (
          <div className="student-container fadeIn">
            {!currentStudent ? (
              <div className="login-card">
                <h2>Student Portal</h2>
                <form onSubmit={(e)=>{
                  e.preventDefault();
                  const found=students.find(s=>
                    s.name.toLowerCase()===studentInput.toLowerCase());
                  if(found) setCurrentStudent(found);
                  else alert("Record not found!");
                }}>
                  <input
                    placeholder="Enter Registered Name"
                    value={studentInput}
                    onChange={e=>setStudentInput(e.target.value)} required />
                  <button className="login-btn">Check Grades</button>
                </form>
              </div>
            ) : (
              <div className="student-dashboard">
                <h2>{currentStudent.name}</h2>
                <Line data={chartDataFor(currentStudent)} options={chartOptions}/>
                <button className="back-btn"
                  onClick={()=>setCurrentStudent(null)}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONTACT */}
        {currentPage==='contact' && (
          <div className="contact-section fadeIn">
            <h2>Get in Touch</h2>
            <p>Email: support@eduportal.com</p>
          </div>
        )}

      </main>

      <footer className="footer">
        Created by Fahmiya | © 2026 EduPortal
      </footer>

    </div>
  );
}

export default App;
