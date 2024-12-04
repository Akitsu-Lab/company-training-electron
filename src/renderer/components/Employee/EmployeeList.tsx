import { employees } from '../../data/employees';

export default function EmployeeList() {
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
