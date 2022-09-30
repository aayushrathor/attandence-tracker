const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const moment = require("moment");
const cors = require("cors");
const dbcon = require("./dbconnect").db;

const app = express();

app.use(express.static(path.join(__dirname + '/static')));
app.use(cors());

app.post("/markpresent", (req, res) => {
    var roll = req.body.rollno
    dbcon.run(`INSERT INTO studentdb SELECT '${roll}','${req.body.name}','${req.body.date}','${req.body.time}','present' where not exists(select * from studentdb where roll = '${roll}' and mdate = '${moment(req.body.date).format("YYYY-MM-DD")}')`, (result, err) => {
        console.log(result);
        if (err) {
            res.send("error: " + err)
        } else {
            dbcon.all("select changes() as affectedrow", (err, row) => {
                console.log(row[0].affectedrow);
                if (row[0].affectedrow == 0) {
                    res.send(roll + " already marked")
                } else {
                    res.send(roll + " marked present")
                }
            })
        }
    })
})

app.post("/markabsent", (req, res) => {
    var roll = req.body.rollno
    dbcon.run(`INSERT INTO studentdb SELECT '${roll}','${req.body.name}','${req.body.date}','${req.body.time}','absent' where not exists(select * from studentdb where roll = '${roll}' and mdate = '${moment(req.body.date).format("YYYY-MM-DD")}')`, (result, err) => {
        console.log(result);
        if (err) {
            res.send("error: " + err)
        } else {
            dbcon.all("select changes() as affectedrow", (err, row) => {
                console.log(row[0].affectedrow);
                if (row[0].affectedrow == 0) {
                    res.send(roll + " already marked")
                } else {
                    res.send(roll + " marked absent")
                }
            })
        }
    })
})

app.get("/getone", (req, res) => {
    var out = []
    console.log(req.query);
    dbcon.all(`SELECT roll,name,mdate as date,mtime as time,status from studentdb where mdate = '${req.query.date}'`, (err, rows) => {
        rows.forEach(element => {
            element.date = moment(element.date).format("DD-MM-YYYY")
            out.push(element)
        });
        res.json(out);
    })
})

app.get("/getall", (req, res) => {
    var out = []
    dbcon.all(`SELECT roll,name,mdate as date,mtime as time,status from studentdb`, (err, rows) => {
        rows.forEach(element => {
            element.date = moment(element.date).format("DD-MM-YYYY")
            out.push(element)
        });
        res.json(out);
    })
})

const PORT = 8080;
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`running on http://localhost:${PORT}`);
})
