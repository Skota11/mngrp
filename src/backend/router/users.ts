import express from 'express';
const app = express();
app.set("view engine", "ejs");
const router = express.Router();
const { Client } = require("pg");
require('dotenv').config();
const db_host = process.env.host;
const db_pwd = process.env.password;
const client = new Client({
    user: "fasted",
    host: "127.0.0.1",
    database: "user_xxdb",
    password: db_pwd,
    port: 5432,
    ssl: false
  });
client.connect();
router.get("/:name", (req, ex_res) => {
    const value = req.params.name
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
                    const data =  {
                        username: value,
                        name: res.rows[0].name,
                        imageurl: res.rows[0].imgurl,
                        joindate: res.rows[0].joindate,
                        info:res.rows[0].introduction
                    }
                    ex_res.render(process.cwd() + '/src/public/users.ejs', data);
                });
                })