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
  // Page & UI state
  const [currentPage, setCurrentPage] = useState('home');
  const [showMore, setShowMore] = useState(false);

  // Navbar transition state
  const [navbarSolid, setNavbarSolid] = useState(false);

  // Login states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [studentInput, setStudentInput] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);

  // Data state
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

  // Fetch students
  useEffect(() => {
    fetch('http://135.235.193.177:5001/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Backend not reachable:", err));
  }, []);

  // Scroll listener for navbar transition
  useEffect(() => {
    const onScroll = () => {
      const threshold = 40; // px scrolled before navbar becomes solid
      setNavbarSolid(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Admin login
  const handleAdminLogin = () => {
    if (adminPinInput === '4036') {
      setIsAdminLoggedIn(true);
      setAdminPinInput('');
    } else {
      alert("Access Denied: Incorrect PIN");
      setAdminPinInput('');
    }
  };

  // Admin CRUD handler (create/update)
  const handleAdminCRUD = (e) => {
    e.preventDefault();

    // Validation
    const nameRegex = /^[a-zA-Z ]{3,30}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedGrades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'U'];

    if (!nameRegex.test(formData.name)) {
      alert("Invalid Name: Use 3-30 letters only.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert("Invalid Email format.");
      return;
    }
    const g1 = String(formData.assess1).toUpperCase();
    const g2 = String(formData.assess2).toUpperCase();
    const g3 = String(formData.endSem).toUpperCase();

    if (!allowedGrades.includes(g1) || !allowedGrades.includes(g2) || !allowedGrades.includes(g3)) {
      alert("Invalid Grade! Use: S, A+, A, B+, B, C+, C, or U");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      assess1: g1,
      assess2: g2,
      endSem: g3
    };

    if (isEditing) {
      fetch(`http://135.235.193.177:5001/students/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          setStudents(students.map(s => (String(s.id) === String(formData.id) ? { ...s, ...payload } : s)));
          setIsEditing(false);
          setFormData({ id: null, name: '', email: '', assess1: '', assess2: '', endSem: '' });
          alert("Student updated successfully!");
        })
        .catch(err => alert("Error updating student: " + err));
    } else {
      fetch('http://135.235.193.177:5001/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(newStudent => {
          setStudents([...students, newStudent]);
          setFormData({ id: null, name: '', email: '', assess1: '', assess2: '', endSem: '' });
        })
        .catch(err => alert("Error adding student: " + err));
    }
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm("Delete this student?")) return;
    fetch(`http://135.235.193.177:5001/students/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          setStudents(students.filter(s => String(s.id) !== String(id)));
        } else {
          alert("Server failed to delete record.");
        }
      })
      .catch(err => alert("Error deleting: " + err));
  };

  // Student login
  const handleStudentLogin = (e) => {
    e.preventDefault();
    const found = students.find(s => s.name.toLowerCase() === studentInput.toLowerCase());
    if (found) {
      setCurrentStudent(found);
    } else {
      alert("Record not found! Ensure the Admin has added your exact name.");
    }
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setCurrentStudent(null);
    setStudentInput('');
  };

  // Chart data for current student (line)
  const chartDataFor = (student) => {
    const values = [
      gradeToValue(student.assess1),
      gradeToValue(student.assess2),
      gradeToValue(student.endSem)
    ];
    return {
      labels: ['Assess 1', 'Assess 2', 'End Sem'],
      datasets: [
        {
          label: 'Performance',
          data: values,
          fill: true,
          backgroundColor: 'rgba(80,200,120,0.12)',
          borderColor: '#50c878',
          tension: 0.35,
          pointBackgroundColor: '#50c878',
          pointBorderColor: '#0a0a0a',
          pointRadius: 5
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Trend indicator
  const renderTrend = (student) => {
    const start = gradeToValue(student.assess1);
    const end = gradeToValue(student.endSem);
    const pct = percentChange(start, end);
    const up = pct > 0;
    const arrow = up ? '▲' : (pct < 0 ? '▼' : '▬');
    const absPct = Math.abs(Math.round(pct * 10) / 10);
    const color = up ? '#50c878' : (pct < 0 ? '#ff6b6b' : '#a0a0a0');
    return (
      <div className="chart-trend" style={{ color }}>
        <span className="trend-arrow">{arrow}</span>
        <span className="trend-text">{absPct}%</span>
        <span className="trend-sub"> since Assess 1</span>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className={`navbar ${navbarSolid ? 'solid' : 'transparent'}`}>
        <div className="nav-logo" onClick={() => { setCurrentPage('home'); setShowMore(false); }}>
          EDU<span>PORTAL</span>
        </div>
        <ul className="nav-links">
          {['home', 'admin', 'student', 'contact'].map((id) => (
            <li key={id}>
              <button
                className={currentPage === id ? 'active' : ''}
                onClick={() => { setCurrentPage(id); setShowMore(false); }}
              >
                {id.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN */}
      <main className="main-content">
        {/* HOME */}
        {currentPage === 'home' && (
          <div className="hero" id="hero-section">
            {!showMore ? (
              <div className="fadeIn">
                <h1>Welcome to Your <span>Future</span></h1>
                <p>Academic excellence starts here.</p>
                <button className="cta-btn" onClick={() => setShowMore(true)}>Learn More</button>
              </div>
            ) : (
              <div className="extra-content fadeIn">
                <h2>Platform <span>Insights</span></h2>
                <div className="info-grid">
                  <div className="info-item">
                    <h3>Secure</h3>
                    <p>PIN protected Admin portal.</p>
                  </div>
                  <div className="info-item">
                    <h3>Real-time</h3>
                    <p>Instant grade updates.</p>
                  </div>
                </div>

                {/* New paragraph for Learn More */}
                <div className="learn-more-paragraph">
                  <p>
                    At EduPortal we believe education is the bridge between potential and achievement.
                    Our platform is designed to make assessment transparent, feedback actionable, and
                    progress visible. Teachers can record multiple assessments and end-semester results,
                    while students receive a clear report card and visual progress indicators to guide
                    their learning journey. We combine secure, simple tools with an elegant interface so
                    every learner can focus on growth.
                  </p>
                </div>

                <button className="back-btn" onClick={() => setShowMore(false)}>Go Back</button>
              </div>
            )}
          </div>
        )}

        {/* ADMIN */}
        {currentPage === 'admin' && (
          <div className="admin-container fadeIn">
            {!isAdminLoggedIn ? (
              <div className="login-card">
                <h2>Admin <span>Access</span></h2>
                <input
                  type="password"
                  placeholder="Enter 4-Digit PIN"
                  className="login-input"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                />
                <button className="login-btn" onClick={handleAdminLogin}>Enter Dashboard</button>
              </div>
            ) : (
              <div className="crud-section">
                <h2>Student <span>Registry</span></h2>
                <form onSubmit={handleAdminCRUD} className="crud-form">
                  <input placeholder="Name" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  <input placeholder="Email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                  <input placeholder="Assess 1 (S, A+, A ...)" value={formData.assess1}
                    onChange={e => setFormData({ ...formData, assess1: e.target.value })} required />
                  <input placeholder="Assess 2 (S, A+, A ...)" value={formData.assess2}
                    onChange={e => setFormData({ ...formData, assess2: e.target.value })} required />
                  <input placeholder="End Sem (S, A+, A ...)" value={formData.endSem}
                    onChange={e => setFormData({ ...formData, endSem: e.target.value })} required />
                  <button type="submit" className="cta-btn">{isEditing ? "Update Student" : "Add Student"}</button>
                </form>

                <div className="table-container">
                  <table className="student-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Assess1</th><th>Assess2</th><th>EndSem</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{s.email}</td>
                          <td className="emerald-text">{String(s.assess1).toUpperCase()}</td>
                          <td className="emerald-text">{String(s.assess2).toUpperCase()}</td>
                          <td className="emerald-text">{String(s.endSem).toUpperCase()}</td>
                          <td>
                            <button className="edit-link" onClick={() => {
                              setFormData({
                                id: s.id,
                                name: s.name,
                                email: s.email,
                                assess1: s.assess1,
                                assess2: s.assess2,
                                endSem: s.endSem
                              });
                              setIsEditing(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}>Edit</button>

                            <button className="delete-link" onClick={() => handleDelete(s.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button className="back-btn" onClick={logout} style={{ marginTop: '20px' }}>Logout Admin</button>
              </div>
            )}
          </div>
        )}

        {/* STUDENT */}
        {currentPage === 'student' && (
          <div className="student-container fadeIn">
            {!currentStudent ? (
              <div className="login-card">
                <h2>Student <span>Portal</span></h2>
                <form onSubmit={handleStudentLogin}>
                  <input placeholder="Enter Registered Name" value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)} required />
                  <button type="submit" className="login-btn">Check Grades</button>
                </form>
              </div>
            ) : (
              <div className="student-dashboard">
                <h2>Report Card — <span>{currentStudent.name}</span></h2>

                <div className="report-grid">
                  <div className="report-card">
                    <h3>Grades</h3>
                    <div className="grade-row"><span>Assess 1</span><strong>{String(currentStudent.assess1).toUpperCase()}</strong></div>
                    <div className="grade-row"><span>Assess 2</span><strong>{String(currentStudent.assess2).toUpperCase()}</strong></div>
                    <div className="grade-row"><span>End Sem</span><strong>{String(currentStudent.endSem).toUpperCase()}</strong></div>
                  </div>

                  <div className="chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ margin: 0 }}>Progress</h3>
                      {renderTrend(currentStudent)}
                    </div>
                    <Line data={chartDataFor(currentStudent)} options={chartOptions} />
                  </div>
                </div>

                <button className="back-btn" onClick={() => setCurrentStudent(null)}>Sign Out</button>
              </div>
            )}
          </div>
        )}

        {/* CONTACT */}
        {currentPage === 'contact' && (
          <div className="contact-section fadeIn">
            <h2>Get in <span>Touch</span></h2>
            <p>Email: support@eduportal.com</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Created by Fahmiya | © 2026 EduPortal</p>
      </footer>
    </div>
  );
}

export default App;
