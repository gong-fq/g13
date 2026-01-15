# Grammar Guru - Netlify 部署版

AI英语语法导师的 Netlify 公网部署版本 - **已启用流式响应优化** ⚡

## ✨ 最新优化

- **流式响应（Streaming）** - AI回复逐字显示，几乎零等待
- **即时反馈** - 用户提问后0.5秒内看到AI开始回复
- **打字机效果** - 更自然流畅的交互体验

## 📁 项目结构

```
grammar-guru-netlify/
├── index.html              # 主页面（已启用流式响应）
├── netlify.toml           # Netlify 配置
├── package.json           # 项目依赖
├── .gitignore            # Git 忽略文件
├── netlify/
│   └── functions/
│       └── chat.js       # Serverless API 代理（支持流式响应）
└── README.md             # 本文件
```

## 🚀 快速部署

### 方法一：通过 Netlify CLI 部署

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **初始化并部署**
   ```bash
   cd grammar-guru-netlify
   netlify init
   netlify deploy --prod
   ```

### 方法二：通过 Netlify 网页界面部署

1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 访问 [Netlify](https://app.netlify.com)
3. 点击 "New site from Git"
4. 选择你的仓库
5. 构建设置：
   - **Build command**: 留空或 `echo "No build needed"`
   - **Publish directory**: `.`（当前目录）
6. 点击 "Deploy site"

### 方法三：拖拽部署

1. 访问 [Netlify Drop](https://app.netlify.com/drop)
2. 将整个项目文件夹拖拽到页面上
3. 等待自动部署完成

## ⚙️ 环境变量配置（推荐）

如果你想使用 serverless function 来隐藏 API key：

1. 在 Netlify 网站上：
   - 进入 Site settings > Environment variables
   - 添加 `DEEPSEEK_API_KEY` 变量
   - 值为你的 DeepSeek API key

2. 将 `netlify/functions/chat.js` 放到项目的 `netlify/functions/` 目录下

3. 修改 `index.html` 中的 API 调用：
   ```javascript
   // 将这行：
   const API_URL = 'https://api.deepseek.com/v1/chat/completions';
   
   // 改为：
   const API_URL = '/.netlify/functions/chat';
   ```

**注意：** Serverless function 版本也已支持流式响应，保持最佳性能！

## 🔒 安全建议

**重要：** 当前 `index.html` 中直接包含了 API key，这在公网环境不安全。建议：

1. **使用环境变量**（推荐）
   - 在 Netlify 设置中添加环境变量
   - 使用 serverless function 代理 API 调用
   - 参考 `netlify/functions/chat.js`

2. **限制 API key 权限**
   - 在 DeepSeek 控制台设置 API 使用限制
   - 设置每日/每月配额

## 📝 自定义域名

部署成功后，你可以在 Netlify 设置中：
1. 添加自定义域名
2. 自动配置 SSL 证书
3. 设置自定义重定向规则

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器（包括 functions）
npm run dev
```

## 📊 功能特性

- ✅ 完全静态部署（无需服务器）
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ **流式响应（Streaming）** - 新增 ⚡
- ✅ 支持 Serverless Functions
- ✅ 自动部署（Git 集成）
- ✅ 支持自定义域名
- ✅ 语音输入/输出功能

## 🔧 故障排查

### 部署失败
- 检查 `netlify.toml` 配置是否正确
- 确认所有文件路径正确

### API 调用失败
- 确认 API key 是否有效
- 检查浏览器控制台错误信息
- 如使用 function，确认环境变量已设置

### 流式响应不工作
- 确保使用的是最新版本的 `index.html`
- 检查浏览器是否支持 Fetch API 和 ReadableStream
- 查看浏览器控制台是否有错误信息

### 语音功能不工作
- 确保网站使用 HTTPS（Netlify 自动提供）
- 检查浏览器麦克风权限

## ⚡ 性能优化说明

**流式响应优化：**
- 用户提问后立即看到AI开始回复（约0.5秒内）
- 文字逐字显示，打字机效果
- 不再需要等待完整响应生成
- 用户体验提升显著

**技术实现：**
- 启用 DeepSeek API 的 `stream: true` 参数
- 使用 Server-Sent Events (SSE) 接收数据
- 实时解析和渲染内容
- 优化的缓冲区处理避免解析错误

## 📞 支持

遇到问题？
- 查看 [Netlify 文档](https://docs.netlify.com)
- 查看 [DeepSeek API 文档](https://platform.deepseek.com/docs)
- 检查浏览器控制台日志
- 查看 Netlify 部署日志

## 📄 许可

MIT License
