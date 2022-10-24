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
