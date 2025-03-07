const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blog_db"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database.");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");

app.get("/", (req, res) => {
    db.query("SELECT * FROM blog_posts ORDER BY createdAt DESC", (err, results) => {
        if (err) throw err;
        results.forEach(post => {
            post.createdAt = moment(post.createdAt).format("MMMM Do YYYY, h:mm:ss a");
        });
        res.render("index", { posts: results });
    });
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.post("/create", (req, res) => {
    const { title, content } = req.body;
    db.query("INSERT INTO blog_posts (title, content) VALUES (?, ?)", [title, content], err => {
        if (err) throw err;
        res.redirect("/");
    });
});

app.get("/edit/:id", (req, res) => {
    db.query("SELECT * FROM blog_posts WHERE id = ?", [req.params.id], (err, results) => {
        if (err) throw err;
        res.render("edit", { post: results[0] });
    });
});

app.post("/edit/:id", (req, res) => {
    const { title, content } = req.body;
    db.query("UPDATE blog_posts SET title = ?, content = ? WHERE id = ?", [title, content, req.params.id], err => {
        if (err) throw err;
        res.redirect("/");
    });
});

app.post("/delete/:id", (req, res) => {
    db.query("DELETE FROM blog_posts WHERE id = ?", [req.params.id], err => {
        if (err) throw err;
        res.redirect("/");
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
