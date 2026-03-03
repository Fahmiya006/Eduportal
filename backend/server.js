require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  assess1: String,
  assess2: String,
  endSem: String
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// GET all students
app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// POST student
app.post('/students', async (req, res) => {
  const newStudent = await Student.create(req.body);
  res.status(201).json(newStudent);
});

// PUT update
app.put('/students/:id', async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

// DELETE
app.delete('/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
