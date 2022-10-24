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
