import { employees } from '../../data/employees';

export default function EmployeeList() {
  return (
    <div>
      <h1>社員一覧</h1>
      <table>
        <thread>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>年齢</th>
          </tr>
        </thread>
        <tbody>
          {employees.map((employee) => (
            <tr>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
