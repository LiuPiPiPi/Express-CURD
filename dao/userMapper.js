// 对数据库中的 user 表进行增，删，查操作语句
module.exports = {
    addUser: "INSERT INTO user (account, name, password, phone, email) VALUES (?, ?, ?, ?, ?);",
    deleteUser: "DELETE FROM user WHERE id = ?;",
    queryUser: "SELECT * FROM user WHERE id = ?;",
    queryAllUsers: "SELECT * FROM user;",
    updateUser: "UPDATE user SET account=?, name=?, password=?, phone=?, email=? WHERE id=?;"
}
