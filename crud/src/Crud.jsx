import { use, useState } from "react";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Crud = () => {
const [employees, setEmployees] = useState([]);
const [employee, setEmployee] = useState({
    EmployeeName: "",
    MobileNumber: "",
    Department: "",
    Salary: "",
});
const [editing, setEditing] = useState(false);
const [employeeId, setEmployeeId] = useState(null);

const API_URL = "http://localhost:5000/api/employees";



const fetchEmployees = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log(response);
        setEmployees(response.data.empData);
        setEmployeeId(response.data.empData.EmployeeID);
    } catch (error) {
        console.log(error);
    }
};
    return(
        <div className="container mt-5">
            <h1>Crud</h1>
            <table className="table table-bordered">
                <thread>
                    <tr>
                        <th>Employee Name</th>
                        <th>Mobile Number</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Actions</th>
                    </tr>
                </thread>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee._id}>
                            <td>{employee.EmployeeName}</td>
                            <td>{employee.MobileNumber}</td>
                            <td>{employee.Department}</td>
                            <td>{employee.Salary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Crud;