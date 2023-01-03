let displayname;
let username;
let imageurl;
fetch("/api/chat/nowlogin").then((res) => {
    res.json().then((text) => {
        if (text.nowlogin.length == 0) {
            document.getElementById("chat-nowlogin").textContent = "現在参加している人はいません。"
            let now = new Date();
            let Hour = now.getHours();
            let Minute = now.getMinutes();
            const content_div = document.createElement("span");
            const list = document.querySelector("#chat-nowlogin");
            content_div.innerHTML = `<span>//更新:${Hour}:${Minute}</span>`
            list.appendChild(content_div, list.firstChild);  
        } else {
            for (var i = 0; i < text.nowlogin.length; i++) {
                const content_div = document.createElement("span");
                const list = document.querySelector("#chat-nowlogin");
                content_div.innerHTML = `<span>${text.nowlogin[i]}|</span>`
                list.appendChild(content_div, list.firstChild);
            }
            let now = new Date();
            let Hour = now.getHours();
            let Minute = now.getMinutes();
            const content_div = document.createElement("span");
            const list = document.querySelector("#chat-nowlogin");
            content_div.innerHTML = `<span>//更新:${Hour}:${Minute}</span>`
            list.appendChild(content_div, list.firstChild);   
        }
        fetch("/api/acount").then((res) => {
            res.json().then((text) => {
                displayname = text.name
                username = text.username
                imageurl = text.imageurl
        
                document.getElementById("myicon").src = imageurl
                document.getElementById("my-displayname").textContent = displayname
                document.getElementById("my-name").textContent = "@"+username
                document.getElementById("main").style.display = "inline"
                document.getElementById("loading").style.display = "none";
            })
        })
    })
})
$(".info").modaal({
    overlay_close: true,//モーダル背景クリック時に閉じるか
    before_open: function () {// モーダルが開く前に行う動作
        $('html').css('overflow-y', 'hidden');/*縦スクロールバーを出さない*/
    },
    after_close: function () {// モーダルが閉じた後に行う動作
        $('html').css('overflow-y', 'scroll');/*縦スクロールバーを出す*/
    }
});
function changename() {
    const newname = document.getElementById("changename").value
    console.log(newname)
    const param = {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: newname
        })
    }
    fetch("/api/acount/changename", param).then((res) => {
        res.text().then((text) => {
            swal("名前を変更しました","変更を適用するには、リロードしてください","success");
        })
    })
}
function reloadlogin() {
    document.querySelector("#chat-nowlogin").innerHTML = "|"
    fetch("/api/chat/nowlogin").then((res) => {
        res.json().then((text) => {
            if (text.nowlogin.length == 0) {
                document.getElementById("chat-nowlogin").textContent = "現在参加している人はいません。"
                let now = new Date();
                let Hour = now.getHours();
                let Minute = now.getMinutes();
                const content_div = document.createElement("span");
                const list = document.querySelector("#chat-nowlogin");
                content_div.innerHTML = `<span>//更新:${Hour}:${Minute}</span>`
                list.appendChild(content_div, list.firstChild);  
            } else {
                for (var i = 0; i < text.nowlogin.length; i++) {
                    const content_div = document.createElement("span");
                    const list = document.querySelector("#chat-nowlogin");
                    content_div.innerHTML = `<span>${text.nowlogin[i]}|</span>`
                    list.appendChild(content_div, list.firstChild);
                }
                let now = new Date();
                let Hour = now.getHours();
                let Minute = now.getMinutes();
                const content_div = document.createElement("span");
                const list = document.querySelector("#chat-nowlogin");
                content_div.innerHTML = `<span>//更新:${Hour}:${Minute}</span>`
                list.appendChild(content_div, list.firstChild);   
            }
        })
    })
}
//Cookieを取得
function getcookie(name) {
    var cookies = document.cookie; //全てのcookieを取り出して
    var cookiesArray = cookies.split(';'); // ;で分割し配列に
    for (var c of cookiesArray) { //一つ一つ取り出して
      var cArray = c.split('='); //さらに=で分割して配列に
      if (cArray[0] == name) { // 取り出したいkeyと合致したら
        return cArray[1]  // [key,value] 
      }
    }
  }
  if (getcookie("ac_") == null) {
    location.href = "/login?q="
  }