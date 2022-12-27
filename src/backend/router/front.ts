import express from 'express';
const router = express.Router();
router.get('/chat', (req, res) => {
    if (req.cookies.ac_ === "") {
        res.redirect("/login")
    } else {
        res.sendFile(process.cwd() + '/src/public/chat.html')
    }
});
router.get('/login', (req, res) => {
    res.sendFile(process.cwd() + '/src/public/login.html')
});
router.get('/home', (req, res) => {
    res.sendFile(process.cwd() + '/src/public/home.html')
});
router.get('/hello', (req, res) => {
    res.sendFile(process.cwd() + '/src/public/hello.html')
});
router.get('/acount/settings', (req, res) => {
    res.sendFile(process.cwd() + '/src/public/setting.html')
});
router.get('/register', (req, res) => {
    res.sendFile(process.cwd() + '/src/public/register.html')
});
module.exports = router;