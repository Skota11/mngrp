import express from 'express';
require('dotenv').config();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
require('date-utils');
const crypto = require('crypto');
const PORT = process.env.PORT || 3030;
const db_host = process.env.host;
const db_pwd = process.env.password;
const app = express();
const { Client } = require("pg");
const client = new Client({
  user: "fasted",
  host: "127.0.0.1",
  database: "user_xxdb",
  password: db_pwd,
  port: 5432,
  ssl: false
});
client.connect();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let nowlogin: string[] = [];
let usernum: number[] = [];
let already = false;
let i: number;
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
let static_path = process.cwd() + '/src/public'
app.use(express.static(static_path));
//router
app.use('/', require("./router/front.js"));
app.use('/app', require("./router/app_front.js"));
app.use("/acount", require("./router/acount.js"))
app.use("/api", require("./router/api.js"))
app.use("/users", require("./router/users.js"))

//function
function createRandomId() {
  const S = '0123456789abcdefghijklmnopqrstuvwxyz';
  const L = 8;
  let buf = crypto.randomBytes(L);
  let rnd = '';
  for (var i = 0; i < L; i++) {
    rnd += S.charAt(Math.floor((buf[i] / 256) * S.length));
  }
  return rnd;
}
//nowlogin
app.get("/api/chat/nowlogin", (req, ex_res) => {
  ex_res.json({
    nowlogin: nowlogin
  })
})
//log処理
function newlog(name:string , imgurl:string , content:string) {
  const data = {username: name , avatar_url:imgurl , content:content}
  fetch('https://discord.com/api/webhooks/1060499653562482708/HkcSsAw5dwKQ1QqTUUoGElOj9zNT87pQu6Rn6QXdTMDXa5SfTUZcFj22GUnSESDlPDEo"', {  // 送信先URL
		method: 'post', // 通信メソッド
		headers: {
			'Content-Type': 'application/json' // JSON形式のデータのヘッダー
		},
		body: JSON.stringify(data) // JSON形式のデータ
	})
}
//Socket処理
io.on("connection", (socket: any) => {
  socket.on("login", async (id: any) => {
    socket.userid = id;
    //ここにDBから名前を取得する処理
    const query1 = {
      text: "SELECT * FROM pwd where ac = $1",
      values: [id]
    };
    socket.username = await client
      .query(query1)
      .then((res: { rows: { username: any; }[]; }) => {
        let value = res.rows[0].username;
        return value;
      })
      .catch((e: { stack: any; }) => console.error(e.stack));
    //name
    const query2 = {
      text: "SELECT * FROM acount where username = $1",
      values: [socket.username]
    };
    let tmp = await client
      .query(query2)
      .then((res: {
        rows: {
          name: any; imgurl: any;
        }[];
      }) => {
        let value = [res.rows[0].name, res.rows[0].imgurl]
        return value;
      }).catch((e: { stack: any; }) => console.error(e.stack));
    socket.name = tmp[0]
    socket.imgurl = tmp[1]
    if (usernum[socket.username] == undefined) {
      usernum[socket.username] = 0;
    }
    usernum[socket.username] = usernum[socket.username] + 1;
    if (nowlogin.includes(socket.username)) {
      io.emit("newlog", `${socket.username}が入室しました。`)
    } else {
      io.emit("newlog", `${socket.username}が入室しました。`)
      nowlogin[nowlogin.length] = socket.username;
      io.emit("refresh", nowlogin)
    }
  });
  socket.on("newmsg", (msg: any) => {
    io.emit("newmsg", { "id": createRandomId(), "username": socket.username, "name": socket.name, "img": socket.imgurl, "content": msg })
    newlog(socket.username , socket.imgurl , msg)
  });
  socket.on("newemoji", (msg: { id: any; moji: any; }) => {
    io.emit("newemoji", { "id": msg.id, "username": socket.username, "moji": msg.moji })
  });
  socket.on("destoryemoji", (msg: { id: any; moji: any; }) => {
    io.emit("destoryemoji", { "id": msg.id, "username": socket.username, "moji": msg.moji })
  });
  socket.on("newreply", (msg: { msg: any; reply_id: any; }) => {
    io.emit("newreply", { "id": createRandomId(), "username": socket.username, "name": socket.name, "img": socket.imgurl, "content": msg.msg, "reply": msg.reply_id })
    newlog(socket.username , socket.imgurl , `${msg.reply_id}に返信/${msg.msg}`)
  });
  socket.on("setstatus", (msg: any) => {
    io.emit("setstatus", { "username": socket.username, "content": msg })
  });
  socket.on("nowtype", () => {
    io.emit("nowtype", socket.username)
  });

  socket.on("endtype", () => {
    io.emit("endtype", socket.username)
  });
  socket.on("disconnect", () => {
    if (already) {
      for (i = 0; i < nowlogin.length; i++) {
        if (nowlogin[i] == socket.username) {
          //spliceメソッドで要素を削除
          nowlogin.splice(i, 1);
          break;
        }
      }
    } else {
      io.emit("newlog", `${socket.username}が退出しました`)
      usernum[socket.username] = usernum[socket.username] - 1;
      if (usernum[socket.username] == 0) {
        for (i = 0; i < nowlogin.length; i++) {
          if (nowlogin[i] == socket.username) {
            //spliceメソッドで要素を削除
            nowlogin.splice(i, 1);
            break;
          }
        }
      } else { }
      io.emit("refresh", nowlogin)
    }
  });
});

http.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
