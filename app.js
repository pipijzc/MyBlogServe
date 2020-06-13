const express = require('express');
const app = express();
// const session = require('express-session')
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const fs = require('fs')
class Jwt {
    constructor(data) {
            this.data = data;
        }
        //生成token
    generateToken() {
            let data = this.data;
            let created = Math.floor(Date.now() / 1000);
            let cert = fs.readFileSync(path.join(__dirname, 'pem/private_key.pem')); //私钥 可以自己生成
            let token = jwt.sign({
                data,
                exp: created + 60 * 30,
            }, cert, { algorithm: 'RS256' });
            return token;
        }
        // 校验token
    verifyToken() {
        let token = this.data;
        let cert = fs.readFileSync(path.join(__dirname, 'pem/public_key.pem')); //公钥 可以自己生成
        let res;
        try {
            let result = jwt.verify(token, cert, { algorithms: ['RS256'] }) || {};
            let { exp = 0 } = result, current = Math.floor(Date.now() / 1000);
            if (current <= exp) {
                res = result.data || {};
            }
        } catch (e) {
            res = 'err';
        }
        return res;
    }
}

// 数据库
require('./model/connect.js')
    // 第一次导入用户数据
    // require('./model/user')

const { PipiUser } = require('./model/user.js')
const { PipiArticle } = require('./model/article')
const { Star } = require('./model/star')
const { Common } = require('./model/common')
const { Link } = require('./model/link')
    // 接收post参数
const bodyParser = require('body-parser');
const path = require('path');

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
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, access-control-request-headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, authorization, Access-Control-Allow-Credentials, X-Auth-Token, X-Accept-Charset,X-Accept");
    next()
})

app.use((req, res, next) => {
    var reg = '/admin/readstr';
    if (reg === req.url) {
        let token = req.headers.authorization;
        // console.log(req.headers);
        let jwts = new Jwt(token);
        let result = jwts.verifyToken();
        // 如果考验通过就next，否则就返回登陆信息不正确
        if (result == 'err') {
            res.status(403).send({ code: 403, msg: '登录已过期,请重新登录' });
        } else {
            next();
        }
    } else {
        next();
    }
});


// 上传数据
app.post('/upload', bodyParser.json(), async(req, res) => {
    const result = req.body.contents
    const category = req.body.category;
    const showDetail = req.body.showDetail
    console.log(showDetail)
    console.log(result);
    const data = await PipiArticle.create({
        str: result.content,
        title: result.title,
        author: result.author,
        date: result.date,
        introduct: result.introduct,
        category: category,
        showDetail: showDetail
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
        str = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js', 'daily'] } }).sort({ _id: -1 }).limit(5);
    } else {
        str = await PipiArticle.find().sort({ _id: -1 })
    }
    res.send(str)
})

// 读取数据(后台)
app.get('/admin/readstr', async(req, res) => {
    str = await PipiArticle.find().sort({ _id: -1 })

    res.send(str)
})

// 登录
app.post('/login', async(req, res) => {

    // 获取用户信息
    const username = req.body.username;
    const password = req.body.password
        // 查询用户
    const isUsername = await PipiUser.findOne({ username });
    // console.log(isUsername);

    // 如果用户存在
    if (isUsername) {
        // 获取数据库中用户的密码
        const isPassword = isUsername.password
            // 密码比对
        if (isPassword == password) {
            const _id = isUsername._id.toString()
            let Jwts = new Jwt(_id)
            let Token = Jwts.generateToken()
                // console.log(Token);
                // 成功
            res.send({
                code: 200,
                data: '登陆成功o(∩_∩)o ',
                token: Token
            })
        } else {
            // 失败
            res.send({
                data: '用户名或密码错误((‵□′)) '
            })
        }
    }
    // 用户不存在
    else {
        res.send({
            data: '没有这个人'
        })
    }

})


// 删除文章
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
    const showDetail = req.body.showDetail
    console.log(showDetail)
    const { content, title, author, date, introduct } = result;
    const update = await PipiArticle.findByIdAndUpdate(id, { title: title, str: content, author: author, date: date, category: category, introduct: introduct, showDetail: showDetail });
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

    const result = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js', 'daily'] } }).sort({ _id: -1 }).skip(count).limit(6);
    count = count + 5;
    if (result.length < 5) {
        count = 5;
    }

    if (result.length < 6) {
        res.send({
            data: result,
            moreData: false
        })
        count = 5;
    } else {
        result.pop()
        res.send({
            data: result,
            moreData: true
        })
    }

})

// 获取最新
app.get('/getnew', async(req, res) => {
        const result = await PipiArticle.find({ category: { $in: ['note', 'bug', 'example', 'js', 'daily'] } }).sort({ _id: -1 }).limit(8)
        res.send(result);
    })
    // 文章搜索
app.get('/search', async(req, res) => {
    const keyWord = req.query.word
    const ss = keyWord.toString()
    console.log(keyWord)
    const result = await PipiArticle.find({ title: { $regex: ss, $options: 'i' } })
    console.log(result);
    res.send(result)
})

// 发送留言
app.post('/frimsg', async(req, res) => {
    const result = req.body.friendMsg
    const success = await Common.create({ username: result.username, content: result.content, time: localDate(), replay: result.replay })
    console.log(success);
    res.send('code:200')
})

// 时间格式化
function localDate(v) {
    const d = new Date(v || Date.now());
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString();
}
// 获取留言
app.get('/getfrimsg', async(req, res) => {
        const isAll = req.query.all;
        console.log(isAll);
        countMsg = 10
        if (isAll === 'true') {
            const result = await Common.find().sort({ _id: -1 });
            res.send({
                data: result,
                moreData: true
            })
        } else {
            const result = await Common.find().sort({ _id: -1 }).limit(10);
            res.send({
                data: result,
                moreData: true
            })
        }

    })
    // 首页获取5条留言
app.get('/getfrimsg5', async(req, res) => {
        const result = await Common.find().sort({ _id: -1 }).limit(5);
        res.send({
            data: result,
            moreData: true
        })
    })
    // 获取更多留言
let countMsg = 10;
app.get('/addmsg', async(req, res) => {
    const result = await Common.find().sort({ _id: -1 }).skip(countMsg).limit(11);
    countMsg = countMsg + 10;
    if (result.length < 10) {
        countMsg = 10;
    }
    if (result.length < 11) {
        res.send({
            data: result,
            moreData: false
        })
        countMsg = 10;
    } else {
        result.pop()

        res.send({
            data: result,
            moreData: true
        })
    }
})

// 回复消息
app.post('/replaymsg', async(req, res) => {
    const result = req.body.replay
    const { id, content } = result
    const update = await Common.findByIdAndUpdate(id, { replay: content })
    res.send({
        code: 200
    })
})

// 删除消息
app.post('/delefrimsg', async(req, res) => {
        const result = req.body.id;
        const success = await Common.findByIdAndDelete({ _id: result })
        res.send({
            code: 200
        })
    })
    // 上传头像
app.post('/uploadlogo', async(req, res) => {
    // 创建表单解析对象
    const form = new formidable.IncomingForm();
    // 配置上传文件的存放位置
    form.uploadDir = path.join(__dirname, 'public', 'uploadlogo');
    // 保留上传文件的后缀
    form.keepExtensions = true;
    var cover = null
    form.parse(req, async(err, fields, files) => {
        console.log(files);
        cover = 'http://127.0.0.1:4000' + files.file.path.split('public')[1]
        res.send({
            logoUrl: cover
        })
    })
})

// 上传友链信息
app.post('/uploadlink', async(req, res) => {
        const result = req.body.FriLink;
        console.log(result);
        const success = await Link.create({
            username: result.username,
            url: result.url,
            logo: result.logo
        })
        res.send({
            code: 200
        })
    })
    // 获取友链信息
app.get('/getlink', async(req, res) => {
        const result = await Link.find().sort({ _id: -1 });
        res.send(result)
    })
    // 获取首页6条友链信息
app.get('/getlink6', async(req, res) => {
        const result = await Link.find().sort({ _id: -1 }).limit(9);
        res.send(result)
    })
    // 编辑友链
app.get('/editlink', async(req, res) => {
        const id = req.query.id
        const result = await Link.findOne({ _id: id });
        console.log(result);

        res.send(result)
    })
    // 更新友链
app.post('/updatelink', async(req, res) => {
        const { _id, username, logo, url } = req.body.FriLink
        const success = await Link.findByIdAndUpdate(_id, { username: username, logo: logo, url: url })
            // console.log(_id);
            // console.log(username);
            // console.log(logo);
            // console.log(url);

        res.send({
            code: '200'
        })
    })
    // 删除友链
app.get('/delelink', async(req, res) => {
    const id = req.query.id;
    const success = await Link.findByIdAndDelete({ _id: id })
    res.send({
        code: 200
    })
})



app.listen(4000);
console.log('启动成功');