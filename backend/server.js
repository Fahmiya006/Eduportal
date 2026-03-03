require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err.message));

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  assess1: String,
  assess2: String,
  endSem: String
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/students', async (req, res) => {
  const newStudent = await Student.create(req.body);
  res.status(201).json(newStudent);
});

app.put('/students/:id', async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

app.delete('/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});