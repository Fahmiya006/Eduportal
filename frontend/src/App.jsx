import React, { useState, useEffect } from "react";
import "./App.css";
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
} from "chart.js";
import { Line } from "react-chartjs-2";

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

const API = "https://eduportal-1-7dk7.onrender.com";
const API ="http://52.140.125.187:5000";

function gradeToValue(grade) {
const map = { S: 10, "A+": 9, A: 8, "B+": 7, B: 6, "C+": 5, C: 4, U: 0 };
return map[String(grade).toUpperCase()] ?? 0;
}

function App() {

const [currentPage, setCurrentPage] = useState("home");
const [showMore, setShowMore] = useState(false);
const [navbarSolid, setNavbarSolid] = useState(false);

const [students, setStudents] = useState([]);
const [currentStudent, setCurrentStudent] = useState(null);
const [studentInput, setStudentInput] = useState("");

const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
const [adminPinInput, setAdminPinInput] = useState("");

const [formData, setFormData] = useState({
id:null,
name:"",
email:"",
assess1:"",
assess2:"",
endSem:""
});

const [isEditing,setIsEditing]=useState(false);

useEffect(()=>{
fetch(`${API}/students`)
.then(res=>res.json())
.then(data=>setStudents(data))
.catch(err=>console.log(err))
},[])

useEffect(()=>{
const onScroll=()=>setNavbarSolid(window.scrollY>40)
window.addEventListener("scroll",onScroll)
return()=>window.removeEventListener("scroll",onScroll)
},[])

const logout=()=>{
setIsAdminLoggedIn(false)
setCurrentStudent(null)
setStudentInput("")
}

const handleAdminLogin=()=>{
if(adminPinInput==="4036"){
setIsAdminLoggedIn(true)
setAdminPinInput("")
}else{
alert("Incorrect PIN")
}
}

const handleAdminCRUD=(e)=>{
e.preventDefault()

const payload={
name:formData.name,
email:formData.email,
assess1:formData.assess1.toUpperCase(),
assess2:formData.assess2.toUpperCase(),
endSem:formData.endSem.toUpperCase()
}

if(isEditing){

fetch(`${API}/students/${formData.id}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
}).then(()=>{
setStudents(students.map(s=>
s._id===formData.id?{...s,...payload}:s
))
setIsEditing(false)
})

}else{

fetch(`${API}/students`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
})
.then(res=>res.json())
.then(newStudent=>setStudents([...students,newStudent]))

}

setFormData({
id:null,
name:"",
email:"",
assess1:"",
assess2:"",
endSem:""
})
}

const handleDelete=(id)=>{
fetch(`${API}/students/${id}`,{method:"DELETE"})
.then(()=>setStudents(students.filter(s=>s._id!==id)))
}

const handleStudentLogin=(e)=>{
e.preventDefault()
const found=students.find(s=>
s.name.toLowerCase()===studentInput.toLowerCase()
)

if(found)setCurrentStudent(found)
else alert("Student not found")
}

const chartData=(student)=>({
labels:["Assess 1","Assess 2","End Sem"],
datasets:[
{
label:"Performance",
data:[
gradeToValue(student.assess1),
gradeToValue(student.assess2),
gradeToValue(student.endSem)
],
fill:true,
borderColor:"#50c878",
backgroundColor:"rgba(80,200,120,0.1)"
}
]
})

const chartOptions={
responsive:true,
scales:{
y:{beginAtZero:true,max:10}
}
}

const renderTrend=(student)=>{

const start=gradeToValue(student.assess1)
const end=gradeToValue(student.endSem)

const percent=((end-start)/(start||1))*100
const value=Math.abs(percent).toFixed(1)

let arrow="▬"
let color="#aaa"

if(percent>0){
arrow="▲"
color="#50c878"
}

if(percent<0){
arrow="▼"
color="#ff6b6b"
}

return(
<div style={{marginBottom:"10px",fontWeight:"600",color}}>
{arrow} {value}% since Assess 1
</div>
)
}

return(
<div className="app-container">

<nav className={`navbar ${navbarSolid?"solid":""}`}>
<div className="nav-logo" onClick={()=>setCurrentPage("home")}>
EDU<span>PORTAL</span>
</div>

<ul className="nav-links">
{["home","admin","student","contact"].map(p=>(
<li key={p}>
<button
className={currentPage===p?"active":""}
onClick={()=>setCurrentPage(p)}
>
{p.toUpperCase()}
</button>
</li>
))}
</ul>
</nav>

<main className="main-content">

{currentPage==="home"&&(
<div className="hero fadeIn">

{!showMore&&(
<div>
<h1>Welcome to <span>EduPortal</span></h1>
<p>Academic excellence starts here.</p>

<button
className="cta-btn"
onClick={()=>setShowMore(true)}
>
Learn More
</button>
</div>
)}

{showMore&&(
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

<button className="back-btn" onClick={()=>setShowMore(false)}>
Go Back
</button>

</div>
)}

</div>
)}

{currentPage==="admin"&&(
<div className="admin-container fadeIn">

{!isAdminLoggedIn?(
<div className="login-card">

<h2>Admin <span>Access</span></h2>

<input
type="password"
placeholder="Enter 4-Digit PIN"
className="login-input"
value={adminPinInput}
onChange={(e)=>setAdminPinInput(e.target.value)}
/>

<button
className="login-btn"
onClick={handleAdminLogin}
>
Enter Dashboard
</button>

</div>

):(

<div className="crud-section">

<h2>Student <span>Registry</span></h2>

<form onSubmit={handleAdminCRUD} className="crud-form">

<input
placeholder="Name"
value={formData.name}
onChange={(e)=>setFormData({...formData,name:e.target.value})}
/>

<input
placeholder="Email"
value={formData.email}
onChange={(e)=>setFormData({...formData,email:e.target.value})}
/>

<input
placeholder="Assess 1"
value={formData.assess1}
onChange={(e)=>setFormData({...formData,assess1:e.target.value})}
/>

<input
placeholder="Assess 2"
value={formData.assess2}
onChange={(e)=>setFormData({...formData,assess2:e.target.value})}
/>

<input
placeholder="End Sem"
value={formData.endSem}
onChange={(e)=>setFormData({...formData,endSem:e.target.value})}
/>

<button className="cta-btn">
{isEditing?"Update Student":"Add Student"}
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

{students.map(s=>(
<tr key={s._id}>

<td>{s.name}</td>
<td>{s.email}</td>
<td className="emerald-text">{s.assess1}</td>
<td className="emerald-text">{s.assess2}</td>
<td className="emerald-text">{s.endSem}</td>

<td>

<button
className="edit-link"
onClick={()=>{
setFormData({
id:s._id,
name:s.name,
email:s.email,
assess1:s.assess1,
assess2:s.assess2,
endSem:s.endSem
})
setIsEditing(true)
}}
>
Edit
</button>

<button
className="delete-link"
onClick={()=>handleDelete(s._id)}
>
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

{currentPage==="student"&&(
<div className="student-container">

{!currentStudent?(
<div className="login-card">

<h2>Student Portal</h2>

<form onSubmit={handleStudentLogin}>

<input
placeholder="Enter Registered Name"
value={studentInput}
onChange={(e)=>setStudentInput(e.target.value)}
/>

<button className="login-btn">
Check Grades
</button>

</form>

</div>

):(

<div className="student-dashboard">

<h2>Report Card — <span>{currentStudent.name}</span></h2>

<div className="report-grid">

<div className="report-card">

<h3>Grades</h3>

<div className="grade-row">
<span>Assess 1</span>
<strong>{currentStudent.assess1}</strong>
</div>

<div className="grade-row">
<span>Assess 2</span>
<strong>{currentStudent.assess2}</strong>
</div>

<div className="grade-row">
<span>End Sem</span>
<strong>{currentStudent.endSem}</strong>
</div>

</div>

<div className="chart-card">

<h3>Progress</h3>

{renderTrend(currentStudent)}

<Line
data={chartData(currentStudent)}
options={chartOptions}
/>

</div>

</div>

<button
className="back-btn"
onClick={()=>setCurrentStudent(null)}
>
Sign Out
</button>

</div>

)}

</div>
)}

{currentPage==="contact"&&(
<div className="contact-section">
<h2>Get in Touch</h2>
<p>Email: support@eduportal.com</p>
</div>
)}

</main>

<footer className="footer">
Created by Fahmiya | ©️ 2026 EduPortal
</footer>

</div>
)
}

export default App
