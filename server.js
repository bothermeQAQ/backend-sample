const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/auth', authRoutes);

// 启动服务器
app.listen(3000, () => {
    console.log('服务器已启动，端口3000');
});
