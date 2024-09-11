const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'newuser', // 你创建的用户名
    password: 'your_password', // 用户密码 记得改一下
    database: 'myappdb' // 数据库名称
});

connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败: ' + err.stack);
        return;
    }
    console.log('数据库连接成功');
});

module.exports = connection;
