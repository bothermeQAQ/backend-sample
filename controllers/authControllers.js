const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 定义密钥 (用于签发JWT Token)
const secretKey = 'your_secret_key';

// 注册用户的处理逻辑
exports.register = (req, res) => {
    const { username, email, password } = req.body;

    // 后端验证，确保字段不为空
    if (!username || !email || !password) {
        return res.status(400).json({ message: '用户名、电子邮箱和密码不能为空' });
    }

    // 验证用户名长度
    if (username.length < 6) {
        return res.status(400).json({ message: '用户名必须至少包含6个字符' });
    }

    // 验证密码复杂性
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: '密码必须至少包含8个字符，且包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符'
        });
    }

    // 验证邮箱格式是否有效
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '无效的电子邮箱地址' });
    }

    // 查询数据库中是否已存在相同用户名或邮箱
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkUserQuery, [username, email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: '服务器内部错误' });
        }

        // 分别检查用户名和邮箱是否已存在
        if (result.length > 0) {
            if (result[0].username === username) {
                return res.status(400).json({ message: '用户名已存在' });
            } else if (result[0].email === email) {
                return res.status(400).json({ message: '该电子邮箱已被注册' });
            }
        }

        // 用户不存在，继续注册
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return res.status(500).json({ message: '密码加密失败' });
            }

            const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [username, email, hash], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: '注册失败，请稍后再试' });
                }
                return res.status(200).json({ message: '注册成功' });
            });
        });
    });
};


// 登录用户的处理逻辑
exports.login = (req, res) => {
    const { username, password } = req.body;

    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, result) => {
        if (err) {
            return res.status(500).json({ message: '服务器内部错误' });
        }

        if (result.length === 0) {
            return res.status(400).json({ message: '用户名不存在' });
        }

        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: '密码验证失败' });
            }

            if (!isMatch) {
                return res.status(400).json({ message: '用户名或密码错误，请重试。' });
            }

            // 密码匹配，生成 JWT token
            const token = jwt.sign({ username: user.username, email: user.email }, secretKey, { expiresIn: '1h' });

            res.status(200).json({
                message: '登录成功',
                token: token,
                user: {
                    username: user.username,
                    email: user.email
                }
            });
        });
    });
};

// 获取用户个人信息的处理逻辑 (验证 JWT)
exports.profile = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 从请求头中提取 token

    if (!token) {
        return res.status(401).json({ success: false, message: '未提供 Token' });
    }

    // 验证 Token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
        }

        // Token 验证通过，返回用户信息
        res.status(200).json({
            success: true,
            user: {
                username: decoded.username,
                email: decoded.email
            }
        });
    });
};