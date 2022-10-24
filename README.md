# Express-CURD

Express 是一个保持最小规模的灵活的 Node.js Web 应用程序开发框架，为 Web 和移动应用程序提供一组强大的功能，提供精简的基本 Web 应用程序功能，而不会隐藏 Node.js 功能。许多[流行的开发框架](https://www.expressjs.com.cn/resources/frameworks.html)都基于 Express 构建。

## 环境准备

`MySQL@8.0.27` `node@12.13.0` `npm@8.5.5` `express@4.16.1`

创建数据库和数据表：

```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
    `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `account` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '账号',
    `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '名称',
    `password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
    `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '联系方式',
    `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '电子邮箱',
    `status` int NOT NULL DEFAULT 1 COMMENT '状态',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1357608370719252483 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
```

node 项目内安装插件 express、mysql 和 axios：

```bash
npm install express --save
npm install mysql --save
npm install axios --save
```

## 核心代码

**目录结构：**

nodejs-express\
├── conf\
│   └── db.config.js\
├── dao\
│   ├── userDao.js\
│   └── userMapper.js\
├── routes\
│   ├── index.js\
│   └── user.js\
├── utils\
├── app.js\
├── package.json\
└── package-lock.json

### 连接数据库

通过相应的配置，使项目连接到指定的 MySQL 数据库，当连接成功时，控制台会输出“success”字样。

`db.config.js`

```js
const mysql = require("mysql")

let database = '***' // 数据库名

let mysql_config = {
    connectionLimit: 10, // 最大连接数
    host: 'localhost',
    user: 'root',
    password: '******',
    port: '3306',
    database: database,
    connectTimeout: 5000, // 连接超时
    multipleStatements: false //是否允许一个query中包含多条sql语句
}

// 创建连接池
let pool = mysql.createPool(mysql_config)

pool.on('connection', msg => {
    console.log(msg.state)
})

pool.on('error', err => {
    console.log('database error.')
})

module.exports = {
    pool
}
```

### SQL 语句封装

根据 CURD 的特性定义五个查询语句。

`userMapper.js`

```js
// 对数据库中的 user 表进行增，删，查操作语句
module.exports = {
    addUser: "INSERT INTO user (account, name, password, phone, email) VALUES (?, ?, ?, ?, ?);",
    deleteUser: "DELETE FROM user WHERE id = ?;",
    queryUser: "SELECT * FROM user WHERE id = ?;",
    queryAllUsers: "SELECT * FROM user;",
    updateUser: "UPDATE user SET account=?, name=?, password=?, phone=?, email=? WHERE id=?;"
}
```

### 数据访问层（DAO 层）封装

根据查询语句创建相应的功能函数，在函数对请求和响应进行对应的格式化处理。

`userDao.js`

```js
let { pool } = require("../conf/db.config")
let { addUser, deleteUser, queryUser, updateUser, queryAllUsers } = require('./userMapper')

module.exports = {
    query: function (params = {}, callback) { // user 表中查询 user
        if (params.id) {
            let { id } = params
            let sqlparam = [id]
            pool.query(queryUser, sqlparam, (err, result) => {
                if (err) throw err
                callback({ code: 200, data: result })
            })
        } else {
            pool.query(queryAllUsers, (err, result) => {
                if (err) throw err
                callback({ code: 200, data: result })
            })
        }
    },

    add: function (params, callback) { // user 表中增加 user
        let sqlparam = [
            params.account ? params.account : "",
            params.name ? params.name : "",
            params.password ? params.password : "",
            params.phone ? params.phone : "",
            params.email ? params.email : "",
        ]
        pool.query(addUser, sqlparam, (err, result) => {
            if (err) throw err
            callback({ code: 200, data: result })
        })
    },

    update: function (params, callback) { // user 表中更新指定 user
        this.query(params, r => {
            if (r.data.length === 0) {
                callback({ code: 400, msg: 'No User.' })
            } else {
                let sqlparam = [
                    params.account ? params.account : "",
                    params.name ? params.name : "",
                    params.password ? params.password : "",
                    params.phone ? params.phone : "",
                    params.email ? params.email : "",
                    params.id
                ]
                pool.query(updateUser, sqlparam, (err, result) => {
                    if (err) throw err
                    callback({ code: 200, data: result })
                })
            }
        })
    },

    delete: function (params, callback) { // user 表中删除指定 user
        this.query(params, r => {
            if (r.data.length === 0) {
                callback({ code: 400, msg: 'No User.' })
            } else {
                let { id } = params
                let sqlparam = [id]
                pool.query(deleteUser, sqlparam, (err, result) => {
                    if (err) throw err
                    callback({ code: 200, data: result })
                })
            }
        })
    }
}
```

### 实现请求接口

`route/user.js`

```js
let express = require('express')
let bodyParser = require('body-parser')
// const { response } = require('../app')
let router = express.Router()

const userDao = require("../dao/userDao") // 数据交互层操作

// 获取指定用户信息 get 请求
router.get('/query', function (req, res, next) {
    let urlParam = req.body
    userDao.query(urlParam, r => {
        if (r.data.length === 0) {
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf-8'
            })
            res.write('<h2>No Users.</h2>')
            res.end()
        } else {
            res.json(r.data)
        }
    })
})

// 添加用户 post 请求
router.post('/add', function (req, res, next) {
    let urlParam = req.body
    userDao.add(urlParam, r => {
        if (r.code !== 200) {
            res.write('fail.')
            res.end()
        } else {
            res.write('Number of records added: ' + r.data.affectedRows)
            res.end()
        }
    })
})

// 修改用户 post 请求
router.post('/update', function (req, res, next) {
    let urlParam = req.body
    userDao.update(urlParam, r => {
        if (r.code !== 200) {
            res.write('fail.')
            res.end()
        } else {
            res.write('Number of records updated: ' + r.data.affectedRows)
            res.end()
        }
    })
})

// 删除指定用户 get 请求
router.delete('/delete', function (req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
    })
    let urlParam = req.body
    userDao.delete(urlParam, r => {
        if (r.status === 200) {
            res.write('Number of records deleted: ' + r.data.affectedRows)
            res.end()
        } else {
            res.write(r.msg)
            res.end()
        }
    })
})

module.exports = router
```

使用 `res.write()` 函数可以直接将字符流渲染在 HTML 页面上，别忘了使用 `res.end()` 结束字符流传输。

`app.js`

```js
// 部分代码
var express = require('express')
var indexRouter = require('./routes/index')
var userRouter = require('./routes/user')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/user', userRouter)

module.exports = app
```

## 使用 Apipost 进行测试

**查询操作**

![image-20220910162957949](https://lpxz.oss-cn-zhangjiakou.aliyuncs.com/picgo/202209101630245.png)

**修改操作**

![image-20220910162911839](https://lpxz.oss-cn-zhangjiakou.aliyuncs.com/picgo/202209101630248.png)

## Tips

### 使用 `nodemon` 实现项目热加载

> express 项目并不像 react 等前端框架能够实时更新，即热加载，需要安装相关插件实现类似效果。

使用 nodemon 插件可以实现热加载。nodemon 可以检测文件状态，并自动执行程序关闭和启动的操作，当项目文件发生改变时，nodemon 会自动停止项目运行，然后重新启动，无需你自己操作，在使用上相当于是热加载了，但实际上是伪热加载。

**安装过程：**

```bash
npm install --save-dev nodemon # 安装为开发依赖
```

安装成功后，启动项目不再使用 npm start (等同于 node ./bin/www)，而是：

```bash
nodemon ./bin/www
```

运行结果：

```bash
> wechat-nodejs@0.0.0 start
> nodemon ./bin/www

[nodemon] 2.0.19
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node ./bin/www`
```

热加载效果可以自行测试。
