import express from 'express';
const router = express.Router();
const { Client } = require("pg");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
require('dotenv').config();
const db_host = process.env.host;
const db_pwd = process.env.password;
const client = new Client({
  user: "fasted",
  host: db_host,
  database: "user_xxdb",
  password: db_pwd,
  port: 5432,
  ssl: true
});
client.connect();
//function
function createRandomString() {
  const S = '0123456789abcdefghijklmnopqrstuvwxyz';
  const L = 32;
  let buf = crypto.randomBytes(L);
  let rnd = '';
  for (var i = 0; i < L; i++) {
    rnd += S.charAt(Math.floor((buf[i] / 256) * S.length));
  }
  return rnd;
}

router.post('/login', (req, ex_res) => {
  const name = req.body.username;
  const pwd = req.body.password;
  const query1 = {
    text: "SELECT * FROM pwd where username = $1",
    values: [name]
  };
  client
    .query(query1)
    .then((res: { rows: string | any[]; }) => {
      if (res.rows.length !== 0) {
        let value = res.rows[0].pwd
        bcrypt.compare(pwd, value)
          .then((isCorrectPassword: any) => {
            if (isCorrectPassword) {
              ex_res.cookie('ac_', res.rows[0].ac, {
                maxAge: 600000000,
                httpOnly: false
              });
              ex_res.redirect("/home")
            } else {
              ex_res.send('パスワードまたはユーザー名が間違っています')
            }
          });
      } else {
        ex_res.send("パスワードまたはユーザー名が間違っています")
      }
    })
    .catch((e: { stack: any; }) => console.error(e.stack));
});
router.post('/register', (req, ex_res) => {
  const name = req.body.username;
  const acname = req.body.name;
  const pwd = req.body.password;
  const query1 = {
    text: "SELECT username FROM pwd where username = $1",
    values: [name]
  };
  client
    .query(query1)
    .then((res: { rows: string | any[]; }) => {
      if (res.rows.length !== 0) {
        ex_res.send("すでにこのアカウントは登録されています。")
      } else {
        const saltRounds = 10;
        bcrypt.hash(pwd, saltRounds)
          .then((hashedPassword: any) => {
            const ac = createRandomString();
            const query2 = {
              text: "INSERT INTO pwd (username,pwd,ac) VALUES ($1, $2 ,$3)",
              values: [name, hashedPassword, ac]
            };
            client
              .query(query2)
              .then(() => {
                var dt: any = new Date();
                var nowtime = dt.toFormat("YYYYMMDDHH24MISS");
                const query3 = {
                  text: "INSERT INTO acount VALUES ($1, $2 ,$3 ,$4 ,$5 ,$6)",
                  values: [name, acname, "", "https://cdn.mngrp.skota11.com/user.svg", nowtime, false]
                };
                client
                  .query(query3)
                  .then((res: any) => {
                    ex_res.send(`OKRegister`);
                  })
                  .catch((e: { stack: any; }) => console.error(e.stack));
              })
              .catch((e: { stack: any; }) => console.error(e.stack));
          });
      }
    })
    .catch((e: { stack: any; }) => console.error(e.stack));
});
router.post('/delete', (req, res) => {
  const name = req.body.username;
  const pwd = req.body.password;
});
router.post('/change-password', (req, res) => {
  const name = req.body.username;
  const pwd = req.body.password;
  const new_pwd = req.body.newpassword;
});

module.exports = router;