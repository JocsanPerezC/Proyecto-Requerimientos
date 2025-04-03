import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Crud = () => {
    const [employees, setEmployees] = useState([]);

    const API_URL = "http://localhost:5000/api/employees";

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(API_URL);
            setEmployees(response.data.empData);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">CRUD de Empleados</h1>
            <table className="table table-striped table-hover shadow-sm">
                <thead className="bg-primary text-white text-center">
                    <tr>
                        <th style={{ padding: "15px" }}>Nombre</th>
                        <th style={{ padding: "15px" }}>Teléfono</th>
                        <th style={{ padding: "15px" }}>Departamento</th>
                        <th style={{ padding: "15px" }}>Salario</th>
                        <th style={{ padding: "15px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {employees.map((emp) => (
                        <tr key={emp._id} className="align-middle">
                            <td style={{ padding: "12px" }}>{emp.EmployeeName}</td>
                            <td style={{ padding: "12px" }}>{emp.MobileNumber}</td>
                            <td style={{ padding: "12px" }}>{emp.Department}</td>
                            <td style={{ padding: "12px" }}>${emp.Salary}</td>
                            <td style={{ padding: "12px" }}>
                                <button className="btn btn-warning btn-sm mx-1">Editar</button>
                                <button className="btn btn-danger btn-sm mx-1">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ToastContainer />
        </div>
    );
};

export default Crud;
