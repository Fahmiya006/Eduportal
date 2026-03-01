export default function handler(req, res) {
  const students = [
    {
      id: 1,
      name: "Fahmiya",
      dept: "CSE"
    }
  ];

  res.status(200).json(students);
}