# 资产管理工具项目指南

## 项目概述
本项目是一个基于Vue 3和Flask的资产管理工具，用于管理和追踪资产、账单、预测分析等。

## 技术栈
### 前端
- Vue 3 + TypeScript
- Element Plus UI框架
- Vite构建工具
- Pinia状态管理
- Vue Router路由管理
- Axios HTTP客户端
- ECharts图表库

### 后端
- Python Flask框架
- SQLite数据库
- JWT认证
- Python日志模块

## 项目结构

### 前端结构 (frontend/)
```
frontend/
├── src/
│   ├── assets/          # 静态资源文件
│   ├── components/      # 通用组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia状态管理
│   ├── utils/           # 工具函数
│   │   └── logger.ts    # 日志工具类
│   ├── views/           # 页面组件
│   │   ├── Analytics.vue    # 数据分析页面
│   │   ├── AssetDetail.vue  # 资产详情页面
│   │   ├── AssetManagement.vue  # 资产管理页面
│   │   ├── Bills.vue    # 账单管理页面
│   │   ├── Forecast.vue # 预测分析页面
│   │   ├── Import.vue   # 数据导入页面
│   │   ├── Logs.vue     # 系统日志页面
│   │   └── SystemSettings.vue  # 系统设置页面
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── style.css        # 全局样式
├── public/              # 公共资源
└── package.json         # 项目依赖配置
```

### 后端结构 (backend/)
```
backend/
├── src/                # 源代码目录
├── data/              # 数据文件目录
├── uploads/           # 上传文件目录
├── logs/              # 日志文件目录
├── app.py             # 主应用入口
├── requirements.txt   # Python依赖配置
└── config.py          # 配置文件
```

## 主要功能模块

### 1. 资产管理
- 资产列表展示
- 资产详情查看
- 资产添加/编辑/删除
- 资产状态追踪
- 资产维护记录

### 2. 账单管理
- 账单列表展示
- 账单添加/编辑/删除
- 账单分类管理
- 账单导出功能
- 账单数据筛选

### 3. 数据分析
- 资产趋势分析
- 账单统计分析
- 数据可视化展示
- 自定义报表生成

### 4. 预测分析
- 资产价值预测
- 支出趋势预测
- 预测模型配置
- 预测结果展示

### 5. 系统设置
- 系统参数配置
- 数据备份/恢复
- 日志管理
- 系统维护

### 6. 数据导入
- Excel数据导入
- 数据格式验证
- 导入历史记录
- 错误处理

## 日志系统

### 日志级别
- DEBUG: 调试信息
- INFO: 一般信息
- WARN: 警告信息
- ERROR: 错误信息

### 日志记录点
1. 资产管理
   - 资产添加/编辑/删除
   - 资产状态更新
   - 维护记录操作

2. 账单管理
   - 账单添加/编辑/删除
   - 账单导出
   - 数据筛选操作

3. 系统操作
   - 系统设置更新
   - 数据备份/恢复
   - 数据导入操作

## 开发规范

### 代码规范
1. 前端
   - 使用TypeScript进行开发
   - 遵循Vue 3组合式API规范
   - 使用ESLint进行代码检查
   - 组件命名采用PascalCase
   - 变量命名采用camelCase

2. 后端
   - 遵循PEP 8规范
   - 使用类型注解
   - 函数和类需要添加文档字符串
   - 异常处理需要记录日志

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 部署说明

### 环境要求
- Node.js >= 16
- Python >= 3.8
- SQLite >= 3

### 部署步骤
1. 前端部署
```bash
cd frontend
npm install
   npm run build
```

2. 后端部署
```bash
cd backend
   pip install -r requirements.txt
   python app.py
   ```

### 配置说明
1. 前端配置
   - 环境变量配置
   - API地址配置
   - 构建配置

2. 后端配置
   - 数据库配置
   - 日志配置
   - 安全配置

## 维护说明

### 日常维护
1. 日志检查
   - 定期检查系统日志
   - 分析错误日志
   - 清理过期日志

2. 数据备份
   - 定期数据备份
   - 备份文件管理
   - 恢复测试

3. 性能优化
   - 数据库优化
   - 缓存优化
   - 代码优化

### 故障处理
1. 错误排查
   - 日志分析
   - 代码检查
   - 环境检查

2. 数据恢复
   - 备份恢复
   - 数据修复
   - 验证确认
