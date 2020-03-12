const express = require('express');
const app = express();
const session = require('express-session')
const formidable = require('formidable');

// 数据库
require('./model/connect.js')
    // 第一次导入用户数据
    // require('./model/user')

const { PipiUser } = require('./model/user.js')
const { PipiArticle } = require('./model/article')
const { PipiExample } = require('./model/example')
const { Star } = require('./model/star')
    // 接收post参数
const bodyParser = require('body-parser');
const path = require('path');
// 配置session
app.use(session({
    secret: 'secret key',
    resave: true,
    saveUninitialized: true,

    cookie: {

        maxAge: 24 * 60 * 60 * 1000 // 设置cookie保存一天 单位是毫秒

    }

}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// 开放静态资源
app.use(express.static(path.join(__dirname, 'public')))

// 开放跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    //  允许客户端发送跨域请求时携带cookie信息
    res.header('Access-Control-Allow-Credentials', true);
    next()
})

// 获取列表数据
app.get('/list', (req, res) => {

        res.send({
            code: 200,
            data: '<p>这是我写的第一个网站，因为没什么经验所以也比较简陋，没有绚丽的功能，主要用来记录自己的一些学习经历和学习总结的笔记还有自己的一些想法吧。作为第一个练手的个人网站，我采用的是Vue框架，Vuex，VueRouter，和ElementUi组件库，同时也引入了富文本编辑器实现了简单的增删改查功能，后台的搭建用的是Node.js，express和mongoDB作为数据来源。希望自己能够不断进步！</p>'
        })
    })
    // 上传数据
app.post('/upload', bodyParser.json(), async(req, res) => {
    const result = req.body.contents
    const category = req.body.category;
    // console.log(result);
    const data = await PipiArticle.create({
        str: result.content,
        title: result.title,
        author: result.author,
        date: result.date,
        introduct: result.introduct,
        category: category
    })
    res.send({
        code: 200
    })
})

// 读取数据
app.get('/readstr', async(req, res) => {

    count = 5;
    const category = req.query.category
    console.log(category);
    var date = new Date()
    const riqi = date.getDate()
    const nian = date.getFullYear()
    const yue = date.getMonth() + 1
    const shi = date.getHours()
    const fen = date.getMinutes()
    console.log(nian + '-' + yue + '-' + riqi + ' ' + shi + ':' + fen);


    let str;
    if (category !== 'getfive' && category !== '') {
        str = await PipiArticle.find({ category: category }).sort({ _id: -1 });
    } else if (category == 'getfive') {
        str = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js'] } }).limit(5);
    } else {
        str = await PipiArticle.find().sort({ _id: -1 })
    }
    res.send(str)
})

// 登录
app.post('/login', async(req, res) => {
    req.session.username = req.body.username;
    const username = req.body.username;
    const password = req.body.password
    const isUsername = await PipiUser.findOne({ username });
    // 耶，成功啦 o(∩_∩)o 
    if (isUsername) {
        const isPassword = isUsername.password
        if (isPassword == password) {
            res.send({
                code: 200,
                data: '登陆成功o(∩_∩)o '
            })
        } else {
            res.send({
                data: '用户名或密码错误啦((‵□′)) '
            })
        }
    } else {
        res.send({
            data: '没有这个人'
        })
    }

})

// 获取登录状态
app.get('/userinfo', (req, res) => {
    if (req.session.username) {
        const userinfo = req.session.username
        res.send({
            code: 200,
            data: userinfo
        })
    } else {
        res.send({
            code: 300
        })
    }
})

app.get('/delete', async(req, res) => {
        const id = req.query.id;
        // 成功啦
        const result = await PipiArticle.findByIdAndDelete({ _id: id });
        res.send({
            code: 200
        })

    })
    // 需要编辑的文章
app.get('/edit', async(req, res) => {
        const id = req.query.id
        const result = await PipiArticle.findById({ _id: id })
        res.send(result)
    })
    // 更新修改完的
app.post('/modify', bodyParser.json(), async(req, res) => {
    const result = req.body.contents;
    const id = req.body.id;
    const category = req.body.category
    const { content, title, author, date, introduct } = result;
    const update = await PipiArticle.findByIdAndUpdate(id, { title: title, str: content, author: author, date: date, category: category, introduct: introduct });
    res.send({
        code: 200
    })
})

app.post('/uploadpic', (req, res) => {
    // 创建表单解析对象
    const form = new formidable.IncomingForm();
    // 配置上传文件的存放位置
    form.uploadDir = path.join(__dirname, 'public', 'upload');
    // 保留上传文件的后缀
    form.keepExtensions = true;
    var cover = null
    form.parse(req, async(err, fields, files) => {
        console.log(files);
        cover = 'http://127.0.0.1:4000' + files.jpg.path.split('public')[1]
        title = fields.title;
        str = fields.content
        res.send({
            content: cover
        })

    })
})

app.get('/getbyid', async(req, res) => {
    const result = req.query.id
    const detail = await PipiArticle.find({ _id: result }).select('author str title date category')
    res.send(detail)

})

// 加星星
// require('./model/star')
app.get('/addstar', async(req, res) => {
        let trueNum = await Star.find({});
        let nums = trueNum[0].num + 1;
        const result = await Star.update({ num: nums })
        res.send({
            code: 200
        })

    })
    // 获取星星
app.get('/getstar', async(req, res) => {
        const result = await Star.find()
        res.send({
            num: result[0].num
        })
    })
    // 获取更多
let count = 5;
app.get('/addmore', async(req, res) => {
    const result = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js'] } }).skip(count).limit(5);
    // console.log(result);

    res.send(result);
    count = count + 5;
    if (result.length < 5) {
        count = 5;
    }
})

// 获取最新
app.get('/getnew', async(req, res) => {
    const result = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js'] } }).sort({ _id: -1 }).limit(6)
    res.send(result);
})




app.listen(4000);
console.log('启动成功');