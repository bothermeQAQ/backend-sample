const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController'); // 确保路径正确

// 注册路由
router.post('/register', register);

// 登录路由
router.post('/login', login);

// 用户信息获取路由
router.get('/profile', profile);

module.exports = router;
