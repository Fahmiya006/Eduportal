// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function gradeToValue(grade) {
  const map = { S: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, 'C+': 5, C: 4, U: 0 };
  return map[String(grade).toUpperCase()] ?? 0;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showMore, setShowMore] = useState(false);
  const [navbarSolid, setNavbarSolid] = useState(false);

  const [students, setStudents] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [studentInput, setStudentInput] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    assess1: '',
    assess2: '',
    endSem: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  // ✅ FIXED CONNECTION
  useEffect(() => {
    fetch('http://localhost:5000/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error(err));
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
    } else alert('Incorrect PIN');
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      assess1: formData.assess1.toUpperCase(),
      assess2: formData.assess2.toUpperCase(),
      endSem: formData.endSem.toUpperCase()
    };

    if (isEditing) {
      fetch(`http://localhost:5000/students/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        setStudents(students.map(s =>
          s.id === formData.id ? { ...s, ...payload } : s
        ));
        setIsEditing(false);
      });
    } else {
      fetch('http://localhost:5000/students', {
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
    fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' })
      .then(() => setStudents(students.filter(s => s.id !== id)));
  };

  const chartData = (student) => ({
    labels: ['Assess 1', 'Assess 2', 'End Sem'],
    datasets: [{
      data: [
        gradeToValue(student.assess1),
        gradeToValue(student.assess2),
        gradeToValue(student.endSem)
      ],
      borderColor: '#50c878',
      backgroundColor: 'rgba(80,200,120,0.15)',
      fill: true
    }]
  });

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className={`navbar ${navbarSolid ? 'solid' : 'transparent'}`}>
        <div className="nav-logo" onClick={() => setCurrentPage('home')}>
          EDU<span>PORTAL</span>
        </div>
        <ul className="nav-links">
          {['home','admin','student','contact'].map(page => (
            <li key={page}>
              <button
                className={currentPage===page ? 'active':''}
                onClick={()=>setCurrentPage(page)}>
                {page.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      </nav>

     <main className="main-content">

  {/* HOME */}
  {currentPage === 'home' && (
    <div className="hero fadeIn">
      {!showMore ? (
        <>
          <h1>Welcome to Your <span>Future</span></h1>
          <p>Academic excellence starts here.</p>
          <button className="cta-btn" onClick={() => setShowMore(true)}>
            Learn More
          </button>
        </>
      ) : (
        <div className="extra-content">
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

          <div className="learn-more-paragraph">
            <p>
              At EduPortal we believe education is the bridge between
              potential and achievement. Teachers can record assessments
              while students track performance visually.
            </p>
          </div>

          <button className="back-btn" onClick={() => setShowMore(false)}>
            Go Back
          </button>
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
            value={adminPinInput}
            onChange={(e) => setAdminPinInput(e.target.value)}
          />
          <button className="login-btn" onClick={handleAdminLogin}>
            Enter Dashboard
          </button>
        </div>
      ) : (
        <div className="crud-section">
          <h2>Student <span>Registry</span></h2>

          <form onSubmit={handleAdminSubmit} className="crud-form">
            <input placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} required />

            <input placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} required />

            <input placeholder="Assess 1"
              value={formData.assess1}
              onChange={e => setFormData({ ...formData, assess1: e.target.value })} required />

            <input placeholder="Assess 2"
              value={formData.assess2}
              onChange={e => setFormData({ ...formData, assess2: e.target.value })} required />

            <input placeholder="End Sem"
              value={formData.endSem}
              onChange={e => setFormData({ ...formData, endSem: e.target.value })} required />

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
                  <th>Assess1</th>
                  <th>Assess2</th>
                  <th>EndSem</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.assess1}</td>
                    <td>{s.assess2}</td>
                    <td>{s.endSem}</td>
                    <td>
                      <button className="edit-link"
                        onClick={() => {
                          setFormData(s);
                          setIsEditing(true);
                        }}>
                        Edit
                      </button>
                      <button className="delete-link"
                        onClick={() => handleDelete(s.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="back-btn" onClick={() => setIsAdminLoggedIn(false)}>
            Logout Admin
          </button>
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
          <form onSubmit={(e) => {
            e.preventDefault();
            const found = students.find(s =>
              s.name.toLowerCase() === studentInput.toLowerCase()
            );
            if (found) setCurrentStudent(found);
            else alert("Record not found!");
          }}>
            <input
              placeholder="Enter Registered Name"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              required
            />
            <button className="login-btn">Check Grades</button>
          </form>
        </div>
      ) : (
        <div className="student-dashboard">
          <h2>Report Card — <span>{currentStudent.name}</span></h2>

          <div className="report-grid">
            <div className="report-card">
              <h3>Grades</h3>
              <p>Assess 1: {currentStudent.assess1}</p>
              <p>Assess 2: {currentStudent.assess2}</p>
              <p>End Sem: {currentStudent.endSem}</p>
            </div>

            <div className="chart-card">
              <Line data={chartData(currentStudent)} />
            </div>
          </div>

          <button className="back-btn"
            onClick={() => setCurrentStudent(null)}>
            Sign Out
          </button>
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
        Created by Fahmiya | © 2026 EduPortal
      </footer>

    </div>
  );
}

export default App;