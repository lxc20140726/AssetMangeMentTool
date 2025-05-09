# 资产管理工具

一个轻量级的个人资产管理工具，帮助用户管理日常记账和资产配置。

## 功能特点

### 记账统计
- 📊 账单数据可视化分析
- 📈 消费趋势预测
- 📝 类Notion风格的账单管理
- 📅 多维度数据对比
- 💰 预算管理
- 📤 数据导入导出

### 理财管理
- 📊 资产配置可视化
- 📈 资产状态追踪
- 💹 涨跌幅分析

## 快速开始

### 环境要求
- Node.js >= 18
- Docker (可选)

### 本地开发
1. 克隆项目
```bash
git clone [项目地址]
cd asset-management-tool
```

2. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 启动开发服务器
```bash
# 启动前端
cd frontend
npm run dev

# 启动后端
cd backend
npm run dev
```

### Docker部署
1. 构建镜像
```bash
docker build -t asset-management-tool:latest .
```

2. 运行容器
```bash
docker run -d \
  --name asset-management \
  -p 80:80 \
  -v ~/asset-management-data:/app/data \
  asset-management-tool:latest
```

## 使用指南

### 账单管理
1. 导入账单
   - 支持Excel格式导入
   - 自动分类账单项目
   - 支持手动编辑和标签管理

2. 数据分析
   - 查看消费趋势
   - 分析消费结构
   - 对比历史数据

3. 预算管理
   - 设置预算目标
   - 跟踪预算执行
   - 查看预算分析

### 资产管理
1. 资产配置
   - 记录资产分布
   - 可视化展示
   - 定期更新

2. 收益分析
   - 查看资产收益
   - 分析涨跌幅
   - 生成分析报告

## 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus
- ECharts

### 后端
- Node.js + Express
- SQLite
- Winston (日志)

## 项目结构
```
project/
├── frontend/          # 前端代码
├── backend/           # 后端代码
└── docker/           # Docker配置
```

## 日志监控
- 系统运行日志
- 业务操作日志
- 错误追踪日志

## 数据备份
```bash
# 备份数据
./backup.sh

# 恢复数据
./restore.sh [备份文件]
```
