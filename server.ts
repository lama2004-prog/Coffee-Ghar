import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("coffee_ghar.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer'
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    event_category TEXT,
    table_number INTEGER,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed Manager if not exists
const seedManager = db.prepare("SELECT * FROM users WHERE email = ?");
const manager = seedManager.get("lanamahesh128@gmail.com");
if (!manager) {
  db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)").run(
    "Mahesh",
    "lanamahesh128@gmail.com",
    "9800000000",
    "mahesh22",
    "manager"
  );
}

// Seed initial menu items if empty
const menuCount = db.prepare("SELECT COUNT(*) as count FROM menu_items").get() as { count: number };
if (menuCount.count === 0) {
  const insertMenu = db.prepare("INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)");
  insertMenu.run("Espresso", "Strong and bold black coffee.", 150, "Coffee", "https://picsum.photos/seed/espresso/400/300");
  insertMenu.run("Cappuccino", "Espresso with steamed milk foam.", 250, "Coffee", "https://picsum.photos/seed/cappuccino/400/300");
  insertMenu.run("Latte", "Creamy espresso with steamed milk.", 280, "Coffee", "https://picsum.photos/seed/latte/400/300");
  insertMenu.run("Mocha", "Espresso with chocolate and milk.", 300, "Coffee", "https://picsum.photos/seed/mocha/400/300");
  insertMenu.run("Croissant", "Buttery and flaky pastry.", 180, "Bakery", "https://picsum.photos/seed/croissant/400/300");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)")
        .run(name, email, phone, password);
      const user = db.prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, name, email, phone, role, password FROM users WHERE email = ?").get(email) as any;
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/change-password", (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && user.password === oldPassword) {
      db.prepare("UPDATE users SET password = ? WHERE email = ?").run(newPassword, email);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Incorrect old password" });
    }
  });

  app.post("/api/auth/recover-password", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT password FROM users WHERE email = ?").get(email) as any;
    if (user) {
      // In a real app, send email. Here we just return it for demo purposes.
      res.json({ message: `Password recovery instructions sent to ${email}. (Demo: Your password is ${user.password})` });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Menu Routes
  app.get("/api/menu", (req, res) => {
    const items = db.prepare("SELECT * FROM menu_items").all();
    res.json(items);
  });

  app.post("/api/menu", (req, res) => {
    const { name, description, price, category, image_url } = req.body;
    const result = db.prepare("INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(name, description, price, category, image_url);
    res.json({ id: result.lastInsertRowid, name, description, price, category, image_url });
  });

  app.delete("/api/menu/:id", (req, res) => {
    db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Order Routes
  app.post("/api/orders", (req, res) => {
    const { user_id, items, total_price, payment_method } = req.body;
    const result = db.prepare("INSERT INTO orders (user_id, items, total_price, payment_method) VALUES (?, ?, ?, ?)")
      .run(user_id, JSON.stringify(items), total_price, payment_method);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders.map((o: any) => ({ ...o, items: JSON.parse(o.items) })));
  });

  // Reservation Routes
  app.post("/api/reservations", (req, res) => {
    const { user_id, customer_name, date, time, event_category, table_number } = req.body;
    const result = db.prepare("INSERT INTO reservations (user_id, customer_name, date, time, event_category, table_number) VALUES (?, ?, ?, ?, ?, ?)")
      .run(user_id, customer_name, date, time, event_category, table_number);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/reservations", (req, res) => {
    const reservations = db.prepare("SELECT * FROM reservations ORDER BY date DESC, time DESC").all();
    res.json(reservations);
  });

  // Manager Stats
  app.get("/api/manager/stats", (req, res) => {
    const salesByDay = db.prepare(`
      SELECT date(created_at) as date, SUM(total_price) as total 
      FROM orders 
      GROUP BY date(created_at) 
      ORDER BY date ASC 
      LIMIT 30
    `).all();
    
    const customerCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get();
    const totalRevenue = db.prepare("SELECT SUM(total_price) as total FROM orders").get();
    const staffList = db.prepare("SELECT id, name, email, role FROM users WHERE role = 'staff'").all();
    const customerList = db.prepare("SELECT id, name, email, phone FROM users WHERE role = 'customer'").all();

    res.json({
      salesByDay,
      customerCount,
      totalRevenue,
      staffList,
      customerList
    });
  });

  app.post("/api/manager/staff", (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'staff')")
        .run(name, email, phone, password);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Staff email already exists" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
