import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const API = "https://eduportal-1-7dk7.onrender.com/students";

function gradeToValue(g) {
  const map = { S: 10, "A+": 9, A: 8, "B+": 7, B: 6, "C+": 5, C: 4, U: 0 };
  return map[g?.toUpperCase()] ?? 0;
}

function App() {

  const [currentPage, setCurrentPage] = useState("home");
  const [showMore, setShowMore] = useState(false);

  const [students, setStudents] = useState([]);

  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [studentInput, setStudentInput] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assess1: "",
    assess2: "",
    endSem: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => console.log("Backend not reachable"));
  }, []);

  const handleAdminLogin = () => {
    if (adminPinInput === "4036") {
      setIsAdminLoggedIn(true);
    } else {
      alert("Incorrect PIN");
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      assess1: formData.assess1,
      assess2: formData.assess2,
      endSem: formData.endSem
    };

    if (isEditing) {
      fetch(`${API}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(() => window.location.reload());
    } else {
      fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(() => window.location.reload());
    }
  };

  const handleDelete = (id) => {
    fetch(`${API}/${id}`, { method: "DELETE" })
      .then(() => window.location.reload());
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();

    const found = students.find(
      s => s.name.toLowerCase() === studentInput.toLowerCase()
    );

    if (found) setCurrentStudent(found);
    else alert("Student not found");
  };

  const chartData = (student) => ({
    labels: ["Assess 1", "Assess 2", "End Sem"],
    datasets: [
      {
        label: "Performance",
        data: [
          gradeToValue(student.assess1),
          gradeToValue(student.assess2),
          gradeToValue(student.endSem)
        ],
        borderColor: "#50c878",
        backgroundColor: "rgba(80,200,120,0.2)",
        fill: true
      }
    ]
  });

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 10
      }
    }
  };

  const renderTrend = (student) => {
    const start = gradeToValue(student.assess1);
    const end = gradeToValue(student.endSem);

    const percent = ((end - start) / (start || 1)) * 100;
    const rounded = Math.abs(percent).toFixed(1);

    let arrow = "▬";
    let color = "#aaa";

    if (percent > 0) {
      arrow = "▲";
      color = "#50c878";
    }

    if (percent < 0) {
      arrow = "▼";
      color = "#ff6b6b";
    }

    return (
      <div style={{ color, marginBottom: "10px", fontWeight: "600" }}>
        {arrow} {rounded}% since Assess 1
      </div>
    );
  };

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">EDU<span>PORTAL</span></div>

        <ul className="nav-links">
          <li><button onClick={() => setCurrentPage("home")}>HOME</button></li>
          <li><button onClick={() => setCurrentPage("admin")}>ADMIN</button></li>
          <li><button onClick={() => setCurrentPage("student")}>STUDENT</button></li>
          <li><button onClick={() => setCurrentPage("contact")}>CONTACT</button></li>
        </ul>
      </nav>

      <main className="main-content">

      {/* HOME */}
{currentPage === "home" && (
  <div className="hero fadeIn">

    {!showMore && (
      <div>
        <h1>
          Welcome to <span>EduPortal</span>
        </h1>

        <p>
          Academic excellence starts here. Track grades, visualize progress,
          and manage students effortlessly.
        </p>

        <button
          className="cta-btn"
          onClick={() => setShowMore(true)}
        >
          Learn More
        </button>
      </div>
    )}

    {showMore && (
      <div className="extra-content fadeIn">

        <h2>Platform <span>Insights</span></h2>

        <div className="info-grid">
          <div className="info-item">
            <h3>🔐 Secure Access</h3>
            <p>Admin dashboard protected with secure PIN authentication.</p>
          </div>

          <div className="info-item">
            <h3>⚡ Real-Time Updates</h3>
            <p>All grades are stored in cloud database and updated instantly.</p>
          </div>

          <div className="info-item">
            <h3>📊 Performance Tracking</h3>
            <p>Students can view visual progress charts for academic growth.</p>
          </div>

          <div className="info-item">
            <h3>☁ Cloud Powered</h3>
            <p>Powered by MongoDB Atlas, Render & Vercel deployment.</p>
          </div>
        </div>

        <div className="learn-more-paragraph">
          <p>
            EduPortal bridges the gap between educators and students by
            offering a transparent, efficient, and visually engaging
            academic management system. Teachers manage records easily,
            and students gain insight into their academic performance trends.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => setShowMore(false)}
        >
          Go Back
        </button>

      </div>
    )}

  </div>
)}

        {/* ADMIN */}
        {currentPage === "admin" && (
          <div className="admin-container">

            {!isAdminLoggedIn && (
              <div className="login-card">

                <h2>Admin Access</h2>

                <input
                  type="password"
                  placeholder="Enter PIN"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                />

                <button onClick={handleAdminLogin}>
                  Enter
                </button>

              </div>
            )}

            {isAdminLoggedIn && (
              <div>

                <h2>Student Registry</h2>

                <form onSubmit={handleAddStudent} className="crud-form">

                  <input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })}
                  />

                  <input
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })}
                  />

                  <input
                    placeholder="Assess1"
                    value={formData.assess1}
                    onChange={(e) =>
                      setFormData({ ...formData, assess1: e.target.value })}
                  />

                  <input
                    placeholder="Assess2"
                    value={formData.assess2}
                    onChange={(e) =>
                      setFormData({ ...formData, assess2: e.target.value })}
                  />

                  <input
                    placeholder="EndSem"
                    value={formData.endSem}
                    onChange={(e) =>
                      setFormData({ ...formData, endSem: e.target.value })}
                  />

                  <button type="submit">
                    {isEditing ? "Update Student" : "Add Student"}
                  </button>

                </form>

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
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.assess1}</td>
                        <td>{s.assess2}</td>
                        <td>{s.endSem}</td>

                        <td>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setEditId(s.id);
                              setFormData(s);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

        {/* STUDENT */}
        {currentPage === "student" && (
          <div className="student-container">

            {!currentStudent && (
              <form onSubmit={handleStudentLogin} className="login-card">

                <h2>Student Portal</h2>

                <input
                  placeholder="Enter Name"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                />

                <button type="submit">
                  Check Grades
                </button>

              </form>
            )}

            {currentStudent && (
              <div className="student-dashboard">

                <h2>
                  Report Card — <span>{currentStudent.name}</span>
                </h2>

                <div className="report-card">
                  <p>Assess 1 : {currentStudent.assess1}</p>
                  <p>Assess 2 : {currentStudent.assess2}</p>
                  <p>End Sem : {currentStudent.endSem}</p>
                </div>

                <div className="chart-card">

                  {renderTrend(currentStudent)}

                  <Line
                    data={chartData(currentStudent)}
                    options={chartOptions}
                  />

                </div>

                <button
                  className="back-btn"
                  onClick={() => setCurrentStudent(null)}
                >
                  Sign Out
                </button>

              </div>
            )}

          </div>
        )}

        {/* CONTACT */}
        {currentPage === "contact" && (
          <div className="contact-section">
            <h2>Get in Touch</h2>
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
