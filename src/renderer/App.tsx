import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

type Employee = {
  id: number;
  name: string;
  age: number;
};

const employees: Employee[] = [
  { id: 1, name: 'sota', age: 27 },
  { id: 2, name: 'keita', age: 27 },
];

function Hello() {
  return (
    <div>
      <h1>社員一覧</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {employees.map((employee) => (
          <li key={employee.id}>
            <h3>{employee.name}</h3>
            <h3>{employee.age}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
