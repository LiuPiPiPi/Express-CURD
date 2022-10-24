const mysql = require("mysql")

let database = 'express_demo'

let mysql_config = {
    connectionLimit: 10, // 最大连接数
    host: 'localhost',
    user: 'root',
    password: 'liubihao',
    port: '3307',
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

// 通过 pool.getConnection 获得链接
pool.getConnection(function (err, connection) {
    if (err) {
        console.error(err)
        return
    }
    // connection.query('SELECT * FROM articles', function (err, results, fields) {
    //     if (err) {
    //         console.error(err);
    //         return;
    //     }
    //     console.debug('results', results);

    //     connection.release();   // 释放该链接，把该链接放回池里供其他人使用

    //     // connection.destroy();   // 如果要关闭连接并将其从池中删除，请改用connection.destroy（）。该池将在下次需要时创建一个新的连接。
    // })
})

module.exports = {
    pool
}
