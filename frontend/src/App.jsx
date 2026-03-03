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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  // FETCH STUDENTS
  useEffect(() => {
    fetch(`${BASE_URL}/students`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Backend not reachable:", err));
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setNavbarSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
      fetch(`${BASE_URL}/students/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          setStudents(students.map(s =>
            String(s._id) === String(formData.id)
              ? { ...s, ...payload }
              : s
          ));
          setIsEditing(false);
          setFormData({ id: null, name: '', email: '', assess1: '', assess2: '', endSem: '' });
          alert("Student updated successfully!");
        });
    } else {
      fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(newStudent => {
          setStudents([...students, newStudent]);
          setFormData({ id: null, name: '', email: '', assess1: '', assess2: '', endSem: '' });
        });
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this student?")) return;

    fetch(`${BASE_URL}/students/${id}`, { method: 'DELETE' })
      .then(() =>
        setStudents(students.filter(s =>
          String(s._id) !== String(id)
        ))
      );
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    const found = students.find(s =>
      s.name.toLowerCase() === studentInput.toLowerCase()
    );
    if (found) setCurrentStudent(found);
    else alert("Record not found!");
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
      tension: 0.35,
      pointRadius: 5
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
          <div className="hero">
            {!showMore ? (
              <div className="fadeIn">
                <h1>Welcome to Your <span>Future</span></h1>
                <p>Academic excellence starts here.</p>
                <button className="cta-btn" onClick={() => setShowMore(true)}>Learn More</button>
              </div>
            ) : (
              <div className="extra-content fadeIn">
                <h2>Platform <span>Insights</span></h2>
                <button className="back-btn" onClick={() => setShowMore(false)}>Go Back</button>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="footer">
        <p>Created by Fahmiya | ©️ 2026 EduPortal</p>
      </footer>

    </div>
  );
}

export default App;
