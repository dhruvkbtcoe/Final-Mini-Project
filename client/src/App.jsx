import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/employees";
const emptyForm = { name: "", phone: "", salary: "", designation: "" };
const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ef4444"];

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const getColor = (name) => {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

const money = (n) => "₹ " + Number(n).toLocaleString("en-IN");

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const loadEmployees = async () => {
    const res = await fetch(API);
    setEmployees(await res.json());
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validation: warns the user and stops saving to the database
  const validate = () => {
    const lettersOnly = /^[A-Za-z ]+$/;

    if (!lettersOnly.test(form.name.trim())) {
      alert("Name: please add only characters (letters), no numbers!");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Phone: please add only numbers (exactly 10 digits)!");
      return false;
    }
    if (!/^\d+$/.test(form.salary) || Number(form.salary) <= 0) {
      alert("Salary: please add only numbers!");
      return false;
    }
    if (!lettersOnly.test(form.designation.trim())) {
      alert("Designation: please add only characters (letters), no numbers!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await fetch(editId ? `${API}/${editId}` : API, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
      return;
    }

    setForm(emptyForm);
    setEditId(null);
    loadEmployees();
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      phone: emp.phone,
      salary: String(emp.salary),
      designation: emp.designation,
    });
    setEditId(emp._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    loadEmployees();
  };

  const filtered = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary = employees.length ? Math.round(totalSalary / employees.length) : 0;
  const highSalary = employees.length ? Math.max(...employees.map((e) => e.salary)) : 0;

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="logo">👥</div>
          <div>
            <h1>EmpManager</h1>
            <p>Employee Management System</p>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Stat cards */}
        <section className="stats">
          <div className="stat">
            <div className="stat-icon blue">👤</div>
            <div>
              <h3>{employees.length}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon green">💰</div>
            <div>
              <h3>{money(totalSalary)}</h3>
              <p>Total Payroll</p>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon orange">📊</div>
            <div>
              <h3>{money(avgSalary)}</h3>
              <p>Average Salary</p>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon pink">🏆</div>
            <div>
              <h3>{money(highSalary)}</h3>
              <p>Highest Salary</p>
            </div>
          </div>
        </section>

        <div className="layout">
          {/* Form */}
          <form className={`panel form ${editId ? "editing" : ""}`} onSubmit={handleSubmit}>
            <h2>{editId ? "✏️ Edit Employee" : "➕ Add Employee"}</h2>

            <label>Full Name</label>
            <input name="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handleChange} />

            <label>Phone Number</label>
            <input
              name="phone"
              placeholder="10 digit number"
              maxLength={10}
              inputMode="numeric"
              value={form.phone}
              onChange={handleChange}
            />

            <label>Designation</label>
            <input
              name="designation"
              placeholder="e.g. Web Developer"
              value={form.designation}
              onChange={handleChange}
            />

            <label>Salary (₹)</label>
            <input
              name="salary"
              placeholder="e.g. 25000"
              inputMode="numeric"
              value={form.salary}
              onChange={handleChange}
            />

            <button type="submit" className="btn primary full">
              {editId ? "Update Employee" : "Add Employee"}
            </button>
            {editId && (
              <button type="button" className="btn ghost full" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </form>

          {/* List */}
          <section className="panel">
            <div className="list-head">
              <h2>
                Employee List <span className="count">{filtered.length}</span>
              </h2>
              <input
                className="search"
                placeholder="🔍 Search by name or designation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          <div className="person">
                            <div className="avatar" style={{ background: getColor(emp.name) }}>
                              {getInitials(emp.name)}
                            </div>
                            <span className="pname">{emp.name}</span>
                          </div>
                        </td>
                        <td>{emp.phone}</td>
                        <td>
                          <span className="badge">{emp.designation}</span>
                        </td>
                        <td className="salary">{money(emp.salary)}</td>
                        <td>
                          <button className="btn small edit" onClick={() => handleEdit(emp)}>
                            Edit
                          </button>
                          <button className="btn small delete" onClick={() => handleDelete(emp._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">Built with MongoDB, Express, React and Node.js</footer>
    </div>
  );
}

export default App;