import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import EmployeeList from './components/Employee/EmployeeList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeList />} />
      </Routes>
    </Router>
  );
}
