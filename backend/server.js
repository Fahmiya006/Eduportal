const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const FILE_PATH = path.join(__dirname, 'students.json');

const getStudents = () => {
  if (!fs.existsSync(FILE_PATH)) return [];
  return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
};

const saveStudents = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET all students
  if (req.url === '/students' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStudents()));
  }

  // POST new student
  else if (req.url === '/students' && req.method === 'POST') {
    let body = "";

    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      const students = getStudents();
      const newStudent = {
        ...JSON.parse(body),
        id: Date.now().toString()
      };

      students.push(newStudent);
      saveStudents(students);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newStudent));
    });
  }

  // PUT update student
  else if (req.url.startsWith('/students/') && req.method === 'PUT') {
    const idToUpdate = req.url.split('/')[2];
    let body = "";

    req.on('data', chunk => body += chunk.toString());

    req.on('end', () => {
      const students = getStudents();
      const updatedData = JSON.parse(body);

      const updatedStudents = students.map(s =>
        String(s.id) === String(idToUpdate)
          ? { ...s, ...updatedData }
          : s
      );

      saveStudents(updatedStudents);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Updated successfully" }));
    });
  }

  // DELETE student
  else if (req.url.startsWith('/students/') && req.method === 'DELETE') {
    const idToDelete = req.url.split('/')[2];
    const students = getStudents();

    const updatedStudents = students.filter(s =>
      String(s.id) !== String(idToDelete)
    );

    saveStudents(updatedStudents);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Deleted successfully" }));
  }

  else {
    res.writeHead(404);
    res.end("Route not found");
  }

});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
