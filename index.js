const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strom_store"
});

db.connect(err => {
    if (err) return console.log("MySQL Error:", err);
    console.log("MySQL connected!");
});

app.get("/games", (req, res) => {
    db.query("SELECT * FROM games", (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result);
    });
});

app.post("/games", (req, res) => {
    const { title, price, thumb, description } = req.body;
    db.query(
        "INSERT INTO games (title, price, thumb, description) VALUES (?, ?, ?, ?)",
        [title, price, thumb, description],
        (err) => {
            if (err) return res.json({ error: err });
            res.json({ success: true });
        }
    );
});

app.delete("/games/:id", (req, res) => {
    db.query("DELETE FROM games WHERE id = ?", [req.params.id], err => {
        if (!err) res.json({ success: true });
        else res.json({ error: err });
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));