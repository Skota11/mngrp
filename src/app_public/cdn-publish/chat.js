const socket = io();
let reply_mode;
let reply_id;
let socketid;
let lastm;
let username_g;
let cantsend = false;
let stopserver = false;
//enter系
document.getElementById("content").addEventListener("paste", function (e) {
  if (
    !e.clipboardData ||
    !e.clipboardData.types ||
    e.clipboardData.types.length != 1 ||
    e.clipboardData.types[0] != "Files"
  ) {
    return true;
  }
  var imageFile = e.clipboardData.items[0].getAsFile();

  const formData = new FormData();
  formData.append("file", imageFile);

  const param = {
    method: "POST",
    body: formData,
  };
  fetch("https://file-up.skota11.repl.co/upload", param)
    .then((res) => {
      return res.text();
    })
    .then((text) => {
      document.getElementById("content").innerHTML = "";
      document.getElementById("content").textContent = text;
    });
});
document.getElementById("content").addEventListener("keydown", key_event);
function key_event(e) {
  if (e.keyCode === 13 && e.shiftKey == true) {
  } else if (e.keyCode === 13) {
    if (document.getElementById("content").textContent !== "") {
      if (document.getElementById("content").textContent.length > 100) {
        document.getElementById("cantsend").textContent =
          "100文字以上は送れません";
        cantsend = true;
      } else {
        if (reply_mode) {
          socket.emit("newreply", {
            msg: document.getElementById("content").textContent,
            reply_id: reply_id,
          });

          reply_mode = false;
          document.getElementById("reply-show").innerHTML = "";
          document.getElementById("reply-show").innerHTML = "";
          document.getElementById("content").innerHTML = "";
          return e.preventDefault();
        } else {
          socket.emit("newmsg", document.getElementById("content").textContent);
          document.getElementById("content").innerHTML = "";
          return e.preventDefault();
        }
      }
    } else {
      document.getElementById("content").innerHTML = "";
      return e.preventDefault();
    }
  } else {
    if (cantsend) {
      cantsend = false;
      document.getElementById("cantsend").textContent = "";
    }
    inputText();
  }
}
//Ctrl系
document.addEventListener("keydown", keydownEvent, false);
function keydownEvent(event) {
  if (event.ctrlKey) {
    if (event.code === "KeyX") {
      if (document.getElementById("scroll_check").checked) {
        document.getElementById("scroll_check").checked = false;
        return false;
      } else {
        document.getElementById("scroll_check").checked = true;
        return false;
      }
    }
  } else if ((event.code = "Key/")) {
    const activeTextarea = document.activeElement;
    const contentElement = document.getElementById("content");
    if (activeTextarea !== contentElement) {
      contentElement.focus();
      contentElement.innerHTML = "";
    }
  }
}

//function系
//Cookieを取得
function getcookie(name) {
  var cookies = document.cookie; //全てのcookieを取り出して
  var cookiesArray = cookies.split(";"); // ;で分割し配列に
  for (var c of cookiesArray) {
    //一つ一つ取り出して
    var cArray = c.split("="); //さらに=で分割して配列に
    if (cArray[0] == name) {
      // 取り出したいkeyと合致したら
      return cArray[1]; // [key,value]
    }
  }
}
//HTML系を大丈夫のやつにする
function htmlspecialchars(unsafeText) {
  if (typeof unsafeText !== "string") {
    return unsafeText;
  }
  return unsafeText.replace(/[&'`"<>]/g, function (match) {
    return {
      "&": "&amp;",
      "'": "&#x27;",
      "`": "&#x60;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
    }[match];
  });
}
//返信
function makereply(id) {
  reply_mode = true;
  reply_id = id;
  const reply_name = document.getElementById(id + "_username").textContent;
  document.getElementById("reply-show").innerHTML = `--> ${reply_name}に返信`;
}
//コピー
function ctc(text) {
  // テキストコピー用の一時要素を作成
  const pre = document.createElement("pre");

  // テキストを選択可能にしてテキストセット
  pre.style.webkitUserSelect = "auto";
  pre.style.userSelect = "auto";
  pre.textContent = text;

  // 要素を追加、選択してクリップボードにコピー
  document.body.appendChild(pre);
  document.getSelection().selectAllChildren(pre);
  const result = document.execCommand("copy");

  // 要素を削除
  document.body.removeChild(pre);

  return result;
}
//新しいメッセージで自動スクロール
function scrollid(id) {
  if (document.getElementById("scroll_check").checked) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }
}
//入力中系
var gTimer;
function inputText() {
  // --- サンプル用 メッセージ出力 -------------------
  socket.emit("nowtype");
  if (gTimer) {
    clearTimeout(gTimer);
  }
  gTimer = setTimeout(inputEnd, 1400);
}
function inputEnd() {
  socket.emit("endtype");
}
document.body.oncontextmenu = function () {
  return false;
};
function onrightclick(e) {
  const username = document.getElementById(e + "_username").textContent;
  const msg = document.getElementById(e + "_content").textContent;
  document.getElementById(
    "reply-menu"
  ).innerHTML = `<div><ul><li>${username}</li><li>${msg}</li></ul><p><button id="${e}_replyright" onclick="makereply('${e}')">返信</button><button id="${e}_replyright" onclick="ctc('${username} : ${msg}')">コピー</button></p></div>`;
  return false;
}
function onreplybutton(id) {
  document.getElementById(id).style.display = "flex";
}
function outreplybutton(id) {
  document.getElementById(id).style.display = "none";
}
function newemoji(moji, id) {
  fetch("/api/acount").then((res) => {
    res.json().then((text) => {
      if (document.getElementById(`${id}_${moji}_${text.username}`) == null) {
        socket.emit("newemoji", { id: id, moji: moji });
      } else {
        socket.emit("destoryemoji", { id: id, moji: moji });
      }
    });
  });
}
(function () {
  const sec = 20;
  const events = ["keydown", "mousemove", "click"];
  let timeoutId;
  let houchi = false;

  // タイマー設定
  function setTimer() {
    if (houchi) {
      houchi = false;
      socket.emit("setstatus", "オンライン");
    }
    timeoutId = setTimeout(logout, sec * 1000);
  }
  function resetTimer() {
    clearTimeout(timeoutId);
    setTimer();
  }

  // イベント設定
  function setEvents(func) {
    let len = events.length;
    while (len--) {
      addEventListener(events[len], func, false);
    }
  }

  // ログアウト
  function logout() {
    houchi = true;
    socket.emit("setstatus", "退席中");
  }
  function setonline() {
    if (houchi) {
      socket.emit("setstatus", "退席中");
    } else {
      socket.emit("setstatus", "オンライン");
    }
  }

  setTimer();
  setEvents(resetTimer);
  setInterval(setonline, 2000);
})();
//imgCheck
function urlcheck(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
////function系終了
//モーダル処理
//アコーディオンをクリックした時の動作
$(".title").on("click", function () {
  //タイトル要素をクリックしたら
  var findElm = $(this).next(".box"); //直後のアコーディオンを行うエリアを取得し
  $(findElm).slideToggle(); //アコーディオンの上下動作

  if ($(this).hasClass("close")) {
    //タイトル要素にクラス名closeがあれば
    $(this).removeClass("close"); //クラス名を除去し
  } else {
    //それ以外は
    $(this).addClass("close"); //クラス名closeを付与
  }
});

//ページが読み込まれた際にopenクラスをつけ、openがついていたら開く動作※不必要なら下記全て削除
$(window).on("load", function () {
  $(".accordion-area li:first-of-type section").addClass("open"); //accordion-areaのはじめのliにあるsectionにopenクラスを追加
  $(".open").each(function (index, element) {
    //openクラスを取得
    var Title = $(element).children(".title"); //openクラスの子要素のtitleクラスを取得
    $(Title).addClass("close"); //タイトルにクラス名closeを付与し
    var Box = $(element).children(".box"); //openクラスの子要素boxクラスを取得
    $(Box).slideDown(500); //アコーディオンを開く
  });
});
//<=モーダル処理
//最初の処理=>
if (getcookie("ac_") == null) {
  location.href = "/login?q=";
}
socket.emit("login", getcookie("ac_"));
socket.emit("setstatus", "オンライン");
fetch("/api/acount").then((res) => {
  res.json().then((text) => {
    username_g = text.username;
    document.getElementById(
      "nowlogin"
    ).textContent = `${text.name}/@${text.username}`;
  });
});
//<=最初の処理

//socket受け取った時=>
socket.on("newlog", (msg) => {
  const list = document.querySelector("#msglist");
  const li = document.createElement("p");
  let safeText = htmlspecialchars(msg);
  li.innerHTML = `<span class="msg"> - ${safeText}</span>`;
  list.appendChild(li, list.firstChild);
  twemoji.parse(document.getElementById("msglist"));
  twemoji.parse(document.getElementById("side"));
});

socket.on("setstatus", (msg) => {
  const statusdom = document.getElementById(msg.username);
  statusdom.innerHTML = msg.content;
  twemoji.parse(document.getElementById("msglist"));
  twemoji.parse(document.getElementById("side"));
});

socket.on("newmsg", (msg) => {
  const list = document.querySelector("#msglist");
  const content_div = document.createElement("div");
  let safeText = htmlspecialchars(msg.content);
  if (urlcheck(msg.content)) {
    const today = new Date();
    var Hour = today.getHours();
    var Min = today.getMinutes();
    var Sec = today.getSeconds();
    content_div.innerHTML = `<div id="${msg.id}" class="msg" oncontextmenu="onrightclick('${msg.id}')" onmouseover="onreplybutton('${msg.id}_menu')" onmouseleave="outreplybutton('${msg.id}_menu')"><img class="userimg" src="${msg.img}"><ul class="msg_ul"><li id="${msg.id}_username" class="username"><a href="/users/${msg.username}">${msg.name}/@${msg.username}</a> <span class="nowdate">${Hour}:${Min}:${Sec}</span></li><br><li id="${msg.id}_content"><a href="${msg.content}" target="_blank" rel="noopener noreferrer" class="info">${msg.content}(外部リンクへ移動します)</a></li></ul><div id="${msg.id}_emoji"></div><div id="${msg.id}_menu" style="display: none;"><button id="${msg.id}_reply" onclick="makereply('${msg.id}')">返信</button> / <button onclick="newemoji('👍','${msg.id}')">👍</button><button onclick="newemoji('🤔' , '${msg.id}')">🤔</button><button onclick="newemoji('👏' , '${msg.id}')">👏</button><button onclick="newemoji('😢' , '${msg.id}')">😢</button></div></div>`;
    list.appendChild(content_div, list.firstChild);
    scrollid(msg.id);
    twemoji.parse(document.getElementById("msglist"));
    twemoji.parse(document.getElementById("side"));
  } else {
    const today = new Date();
    var Hour = today.getHours();
    var Min = today.getMinutes();
    var Sec = today.getSeconds();
    content_div.innerHTML = `<div id="${msg.id}" class="msg" oncontextmenu="onrightclick('${msg.id}')" onmouseover="onreplybutton('${msg.id}_menu')" onmouseleave="outreplybutton('${msg.id}_menu')"><img class="userimg" src="${msg.img}"><ul class="msg_ul"><li id="${msg.id}_username" class="username"><a href="/users/${msg.username}">${msg.name}/@${msg.username}</a><span class="nowdate">${Hour}:${Min}:${Sec}</span></li><br><li id="${msg.id}_content" class="content">${safeText}</li></ul><div id="${msg.id}_emoji"></div><div id="${msg.id}_menu" style="display: none;"><button id="${msg.id}_reply" onclick="makereply('${msg.id}')">返信</button> / <button onclick="newemoji('👍','${msg.id}')">👍</button><button onclick="newemoji('🤔' , '${msg.id}')">🤔</button><button onclick="newemoji('👏' , '${msg.id}')">👏</button><button onclick="newemoji('😢' , '${msg.id}')">😢</button></div></div>`;
    list.appendChild(content_div, list.firstChild);
    scrollid(msg.id);
    twemoji.parse(document.getElementById("msglist"));
    twemoji.parse(document.getElementById("side"));
  }
});

socket.on("newreply", (msg) => {
  const list = document.querySelector("#msglist");
  const content_div = document.createElement("div");
  let safeText = htmlspecialchars(msg.content);
  if (urlcheck(msg.content)) {
    const today = new Date();
    var Hour = today.getHours();
    var Min = today.getMinutes();
    var Sec = today.getSeconds();
    const reply_name = document.getElementById(
      msg.reply + "_username"
    ).textContent;
    const reply_content = document.getElementById(
      msg.reply + "_content"
    ).textContent;
    content_div.innerHTML = `<div id="${msg.id}" class="msg" oncontextmenu="onrightclick('${msg.id}')" onmouseover="onreplybutton('${msg.id}_menu')" onmouseleave="outreplybutton('${msg.id}_menu')"><span onclick="scrollid('${msg.reply}')">-->${reply_name}:${reply_content}</span><br><img class="userimg" src="${msg.img}"><ul class="msg_ul"><li id="${msg.id}_username" class="username"><a href="/users/${msg.username}">${msg.name}/@${msg.username}</a> <span class="nowdate">${Hour}:${Min}:${Sec}</span></li><br><li id="${msg.id}_content" class="content"><a href="${msg.content}" target="_blank" rel="noopener noreferrer" class="info">${msg.content}(外部リンクへ移動します)</a></li></ul><div id="${msg.id}_emoji"></div><div id="${msg.id}_menu" style="display: none;"><button id="${msg.id}_reply" onclick="makereply('${msg.id}')">返信</button> / <button onclick="newemoji('👍','${msg.id}')">👍</button><button onclick="newemoji('🤔' , '${msg.id}')">🤔</button><button onclick="newemoji('👏' , '${msg.id}')">👏</button><button onclick="newemoji('😢' , '${msg.id}')">😢</button></div></div>`;
    list.appendChild(content_div, list.firstChild);
    scrollid(msg.id);
    twemoji.parse(document.getElementById("msglist"));
    twemoji.parse(document.getElementById("side"));
  } else {
    const today = new Date();
    var Hour = today.getHours();
    var Min = today.getMinutes();
    var Sec = today.getSeconds();
    const reply_name = document.getElementById(
      msg.reply + "_username"
    ).textContent;
    const reply_content = document.getElementById(
      msg.reply + "_content"
    ).textContent;
    content_div.innerHTML = `<div id="${msg.id}" class="msg" oncontextmenu="onrightclick('${msg.id}')" onmouseover="onreplybutton('${msg.id}_menu')" onmouseleave="outreplybutton('${msg.id}_menu')"><span onclick="scrollid('${msg.reply}')">-->${reply_name}:${reply_content}</span><br><img class="userimg" src="${msg.img}"><ul class="msg_ul"><li id="${msg.id}_username" class="username"><a href="/users/${msg.username}">${msg.name}/@${msg.username}</a> <span class="nowdate">${Hour}:${Min}:${Sec}</span></li><br><li id="${msg.id}_content" class="content">${safeText}</li></ul><div id="${msg.id}_emoji"></div><div id="${msg.id}_menu" style="display: none;"><button id="${msg.id}_reply" onclick="makereply('${msg.id}')">返信</button> / <button onclick="newemoji('👍','${msg.id}')">👍</button><button onclick="newemoji('🤔' , '${msg.id}')">🤔</button><button onclick="newemoji('👏' , '${msg.id}')">👏</button><button onclick="newemoji('😢' , '${msg.id}')">😢</button></div></div>`;
    list.appendChild(content_div, list.firstChild);
    scrollid(msg.id);
    twemoji.parse(document.getElementById("msglist"));
    twemoji.parse(document.getElementById("side"));
  }
});
socket.on("nowtype", (username) => {
  if (document.getElementById(`type_${username}`) == null) {
    const list = document.getElementById(`typenow`);
    const content_div = document.createElement("span");
    content_div.innerHTML = `<span id="type_${username}">${username}が入力中/</span>`;
    list.appendChild(content_div, list.firstChild);
    twemoji.parse(document.getElementById("msglist"));
    twemoji.parse(document.getElementById("side"));
  }
});
socket.on("endtype", (username) => {
  document.getElementById(`type_${username}`).remove();
});
socket.on("newemoji", (msg) => {
  const list = document.getElementById(`${msg.id}_emoji`);
  const content_div = document.createElement("span");
  content_div.innerHTML = `<span class="m_emoji" id="${msg.id}_${msg.moji}_${msg.username}">${msg.username} : ${msg.moji}</span>`;
  list.appendChild(content_div, list.firstChild);
  twemoji.parse(document.getElementById("msglist"));
  twemoji.parse(document.getElementById("side"));
});
socket.on("destoryemoji", (msg) => {
  document.getElementById(`${msg.id}_${msg.moji}_${msg.username}`).remove();
});
//<=Socket受け取った時

//高さ調整=>
setInterval(check_height, 500);
function check_height() {
  document.getElementById("msglist").style.height =
    window.innerHeight -
    document.getElementById("msgsend").offsetHeight +
    "px" -
    document.getElementById("side").offsetHeight +
    "px";
}
//<=高さ調整
setInterval(check_mamber, 1000);
function check_mamber() {
  fetch("/api/chat/nowlogin").then((res) => {
    res.json().then((text) => {
      if (!text.nowlogin.includes(username_g)) {
        if (!stopserver) {
          swal(
            "サーバーから切断されました!",
            "リロードをして、再接続してください。",
            "error"
          ).then((willDelete) => {
            location.reload();
          });
          stopserver = true;
        }
      }
      if (lastm !== text.nowlogin.length) {
        lastm = text.nowlogin.length;
        const content = text.nowlogin;
        const list = document.querySelector("#online");
        list.innerHTML = "";
        for (var i = 0; i < content.length; i++) {
          const content_div = document.createElement("span");
          const list = document.querySelector("#online");
          content_div.innerHTML = `<img src=""><span class="status_name">${content[i]}</span>/<span class="status" id="${content[i]}"></span>|`;
          list.appendChild(content_div, list.firstChild);
        }
      }
    });
  });
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PAUSED) {
    nowtime = player.getCurrentTime();
    socket.emit("pauce", { room: roomname, time: nowtime, id: myid });
  } else if (event.data == YT.PlayerState.PLAYING) {
    if (noplaysignal) {
      nowtime = player.getCurrentTime();
      socket.emit("play", { room: roomname, time: nowtime, id: myid });
    }
  }
}
