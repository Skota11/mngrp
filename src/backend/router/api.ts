import express from 'express';
const router = express.Router();
const { Client } = require("pg");
require('dotenv').config();
const db_host = process.env.host;
const db_pwd = process.env.password;
const client = new Client({
    user: "fast",
    host: db_host,
    database: "user_xxdb",
    password: db_pwd,
    port: 5432,
    ssl: true
});
client.connect();
router.get("/acount", (req, ex_res) => {
    const query1 = {
        text: "SELECT * FROM pwd where ac = $1",
        values: [req.cookies.ac_]
    };
    client
        .query(query1)
        .then((res: { rows: string | any[]; }) => {
            if (res.rows.length == 0) {
                ex_res.send("error")
            } else {
                let value = res.rows[0].username;
                const query2 = {
                    text: "SELECT * FROM acount where username = $1",
                    values: [value]
                };
                client.query(query2).then((res: {
                    rows: {
                        name: any;
                        imgurl: any; joindate: any;introduction: any;
                    }[];
                }) => {
                    ex_res.json({
                        username: value,
                        name: res.rows[0].name,
                        imageurl: res.rows[0].imgurl,
                        joindate: res.rows[0].joindate,
                        info:res.rows[0].introduction
                    });
                })
            }
        })
        .catch((e: { stack: any; }) => console.error(e.stack));
})
router.post("/acount/changename", (req, ex_res) => {
    const name = req.body.name;
    const ac = req.cookies.ac_;
    const query1 = {
        text: "SELECT * FROM pwd where ac = $1",
        values: [ac]
    };
    client
        .query(query1)
        .then((res: { rows: string | any[]; }) => {
            if (res.rows.length == 0) {
                ex_res.send("error")
            } else {
                let value = res.rows[0].username;
                const query2 = {
                    text: "UPDATE acount set name = $1 where username = $2",
                    values: [name, value]
                };
                client
                    .query(query2)
                    .then((res: any) => {
                        ex_res.send("名前を変更しました")
                    })
            }
        })
        .catch((e: { stack: any; }) => console.error(e.stack));
})
router.post("/acount/changeimage", (req, ex_res) => {
    const name = req.body.image;
    const ac = req.cookies.ac_;
    const query1 = {
        text: "SELECT * FROM pwd where ac = $1",
        values: [ac]
    };
    client
        .query(query1)
        .then((res: { rows: string | any[]; }) => {
            if (res.rows.length == 0) {
                ex_res.send("error")
            } else {
                let value = res.rows[0].username;
                const query2 = {
                    text: "UPDATE acount set imgurl = $1 where username = $2",
                    values: [name, value]
                };
                client
                    .query(query2)
                    .then((res: any) => {
                        ex_res.send("画像を変更しました")
                    })
            }
        })
        .catch((e: { stack: any; }) => console.error(e.stack));
})
router.post("/acount/changeinfo", (req, ex_res) => {
    const name = req.body.info;
    const ac = req.cookies.ac_;
    const query1 = {
        text: "SELECT * FROM pwd where ac = $1",
        values: [ac]
    };
    client
        .query(query1)
        .then((res: { rows: string | any[]; }) => {
            if (res.rows.length == 0) {
                ex_res.send("error")
            } else {
                let value = res.rows[0].username;
                const query2 = {
                    text: "UPDATE acount set introduction = $1 where username = $2",
                    values: [name, value]
                };
                client
                    .query(query2)
                    .then((res: any) => {
                        ex_res.send("説明を変更しました")
                    })
            }
        })
        .catch((e: { stack: any; }) => console.error(e.stack));
})
module.exports = router;