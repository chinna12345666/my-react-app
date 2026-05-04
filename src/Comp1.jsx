import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(time);

  const hours = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minutes = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const seconds = Number(parts.find((p) => p.type === "second")?.value || 0);

  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;

  return (
    <div className="clock-wrap">
      <div className="analog-clock">
        {[...Array(12)].map((_, i) => {
          const num = i + 1;
          return (
            <div
              key={num}
              className="clock-number"
              style={{ transform: `rotate(${num * 30}deg)` }}
            >
              <span style={{ transform: `rotate(-${num * 30}deg)` }}>
                {num}
              </span>
            </div>
          );
        })}

        <div
          className="hand hour-hand"
          style={{ transform: `rotate(${hourDeg}deg)` }}
        ></div>

        <div
          className="hand minute-hand"
          style={{ transform: `rotate(${minuteDeg}deg)` }}
        ></div>

        <div
          className="hand second-hand"
          style={{ transform: `rotate(${secondDeg}deg)` }}
        ></div>

        <div className="center-dot"></div>
      </div>
    </div>
  );
}

function Comp1() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [page, setPage] = useState(1);
  const usersPerPage = 4;

  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    street: "",
    zipcode: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const cities = ["All", ...new Set(users.map((user) => user.address?.city))];

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.address?.city.toLowerCase().includes(searchValue);

      const matchCity = city === "All" || user.address?.city === city;

      return matchSearch && matchCity;
    });

    result.sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [users, search, city, sortOrder]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddOrUpdate(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.city) {
      alert("Name, Email, City required raja");
      return;
    }

    if (editingUser) {
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: form.name,
              email: form.email,
              address: {
                ...user.address,
                city: form.city,
                street: form.street,
                zipcode: form.zipcode,
              },
            }
          : user
      );

      setUsers(updatedUsers);
      setEditingUser(null);
    } else {
      const newUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        address: {
          city: form.city,
          street: form.street,
          zipcode: form.zipcode,
        },
      };

      setUsers([newUser, ...users]);
    }

    setForm({
      name: "",
      email: "",
      city: "",
      street: "",
      zipcode: "",
    });

    setPage(1);
  }

  function handleEdit(user) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      city: user.address?.city || "",
      street: user.address?.street || "",
      zipcode: user.address?.zipcode || "",
    });
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm("Delete cheyyala raja?");
    if (confirmDelete) {
      setUsers(users.filter((user) => user.id !== id));
    }
  }

  function clearFilters() {
    setSearch("");
    setCity("All");
    setSortOrder("asc");
    setPage(1);
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="container">
        <div className="header">
          <h1>User Management 👤</h1>

          <AnalogClock />

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>
        </div>

        <form className="form" onSubmit={handleAddOrUpdate}>
          <input name="name" placeholder="Enter name" value={form.name} onChange={handleChange} />
          <input name="email" placeholder="Enter email" value={form.email} onChange={handleChange} />
          <input name="city" placeholder="Enter city" value={form.city} onChange={handleChange} />
          <input name="street" placeholder="Enter street" value={form.street} onChange={handleChange} />
          <input name="zipcode" placeholder="Enter zipcode" value={form.zipcode} onChange={handleChange} />

          <button type="submit">{editingUser ? "Update User" : "Add User"}</button>

          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setForm({ name: "", email: "", city: "", street: "", zipcode: "" });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div className="controls">
          <input
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
          >
            {cities.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>

          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            Sort {sortOrder === "asc" ? "Z-A" : "A-Z"}
          </button>

          <button onClick={clearFilters}>Clear</button>
        </div>

        {loading && <p className="message">Loading users...</p>}

        {error && (
          <div className="message error">
            <p>{error}</p>
            <button onClick={fetchUsers}>Retry</button>
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <p className="message">No users found ❌</p>
        )}

        <div className="user-list">
          {paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={setSelectedUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}

        {selectedUser && (
          <div className="modal">
            <div className="modal-box">
              <h2>{selectedUser.name}</h2>
              <p>Email: {selectedUser.email}</p>
              <p>City: {selectedUser.address?.city}</p>
              <p>Street: {selectedUser.address?.street}</p>
              <p>Zipcode: {selectedUser.address?.zipcode}</p>

              <button onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, onView, onEdit, onDelete }) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>City: {user.address?.city}</p>

      <div className="card-buttons">
        <button onClick={() => onView(user)}>View</button>
        <button onClick={() => onEdit(user)}>Edit</button>
        <button onClick={() => onDelete(user.id)}>Delete</button>
      </div>
    </div>
  );
}

export default Comp1;