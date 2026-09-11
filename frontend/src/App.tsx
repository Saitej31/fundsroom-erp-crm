import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("Dashboard");

  const menu = [
    "Dashboard",
    "Customers",
    "Products",
    "Stock Movements",
    "Sales Challans",
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Fundsroom ERP</h2>

        {menu.map((item) => (
          <button
            key={item}
            className={page === item ? "active" : ""}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{page}</h1>
            <p>ERP & CRM Operations Portal</p>
          </div>

          <div className="user">
            <strong>Admin User</strong>
            <span>ADMIN</span>
          </div>
        </header>

        {page === "Dashboard" && (
          <section className="cards">
            <div className="card">
              <h3>Customers</h3>
              <strong>1</strong>
            </div>

            <div className="card">
              <h3>Products</h3>
              <strong>1</strong>
            </div>

            <div className="card">
              <h3>Stock Items</h3>
              <strong>10</strong>
            </div>

            <div className="card">
              <h3>Pending Challans</h3>
              <strong>1</strong>
            </div>
          </section>
        )}

        {page !== "Dashboard" && (
          <div className="content">
            <h2>{page}</h2>
            <p>
              {page} management module for the Fundsroom ERP CRM system.
            </p>

            <button className="primary">+ Add New</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;