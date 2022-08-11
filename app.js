require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const sql = require("mssql");
const crypto = require("crypto");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine', 'ejs');

const config = {
    server: "localhost",
    user: "sa",
    password: "legends$7",
    database: "user",
    port: 1433,
    options: {
        trustServerCertificate: true
    }
}

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function (req, res) {

    sql.connect(config, function (err) {
        if (err) console.log(err);

        const hashValue = crypto.createHash('sha256', process.env.SECRET)
        .update(req.body.password)
        .digest('hex');

        let request = new sql.Request();
        request.input('email', sql.VarChar(sql.MAX), req.body.username);
        request.input('password', sql.VarChar(sql.MAX), hashValue);
        request.execute('insert_user', function (err, recordset) {
            if (err) res.send(err);

            res.render("secrets")
        });
    });
});

app.post("/login", function(req, res) {
    sql.connect(config, function (err) {
        if (err) console.log(err);

        let request = new sql.Request();
        request.query("SELECT * FROM [user]", function (err, recordset) {
            if (err) res.send(err);

            recordset.recordsets[0].forEach(function (user) {
                if (req.body.username === user.email) {
                    request.query("SELECT * FROM [user] WHERE email = '" + user.email + "'", function (err, recordset) {

                        const hashValue = crypto.createHash('sha256', process.env.SECRET)
                        .update(req.body.password)
                        .digest('hex');

                        if (recordset.recordset[0].password === hashValue) {
                            res.render("secrets");
                        };
                    });
                };
            });
        });
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000.");
});