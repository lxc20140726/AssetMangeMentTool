# 资产管理工具 - 测试套件文档

## 📋 功能梳理

### 后端功能模块

#### 1. 账单管理 (Bills Management)
- **GET /api/bills** - 获取所有账单
- **GET /api/bills/range** - 按日期范围获取账单
- **POST /api/bills/import** - 导入Excel账单文件

#### 2. 资产管理 (Assets Management)  
- **GET /api/assets** - 获取所有资产
- **POST /api/assets** - 创建新资产
- **PUT /api/assets/:id** - 更新资产金额

#### 3. 日志管理 (Logs Management)
- **GET /api/logs** - 获取系统日志，支持按级别和时间范围筛选

#### 4. 数据模型 (Data Models)
- **billModel** - 账单数据操作 (create, findAll, findByDateRange)
- **assetModel** - 资产数据操作 (create, findAll, update)

#### 5. 工具服务 (Utilities)
- **Logger** - 基于Winston的日志系统
- **数据库** - 基于better-sqlite3的SQLite数据库
- **文件上传** - 基于Multer的文件处理

### 前端功能模块

#### 1. 账单页面 (Bills Page)
- 账单列表显示
- 日期范围筛选
- 账单导入功能

#### 2. 资产页面 (Assets Page)
- 资产列表管理
- 新增资产对话框
- 资产更新功能
- 资产详情查看

#### 3. 数据分析页面 (Analytics Page)
- 支出分类统计 (饼图)
- 月度支出趋势 (折线图)
- 资产分布分析 (饼图)

#### 4. 支出预测页面 (Forecast Page)
- 支出预测图表
- 分类预测分析
- 资产增长预测
- 预测周期选择

#### 5. 日志页面 (Logs Page)
- 系统日志显示
- 日志级别筛选
- 时间范围筛选

#### 6. 数据导入页面 (Import Page)
- Excel文件上传
- 导入模板下载
- 导入进度显示

## 🧪 测试套件架构

### 测试类型概览

```
测试套件架构
├── 单元测试 (Unit Tests)           - 独立模块功能测试
├── 集成测试 (Integration Tests)    - API和服务间交互测试  
├── 冒烟测试 (Smoke Tests)          - 基础功能快速验证
└── 端到端测试 (E2E Tests)          - 完整用户流程测试
```

### 1. 单元测试 (Unit Tests)

**位置**: `backend/src/__tests__/unit/`

#### 测试文件结构
```
backend/src/__tests__/unit/
├── models.test.ts          # 数据模型测试
└── utils.test.ts           # 工具函数测试
```

#### 覆盖功能
- **数据模型测试**
  - billModel: create, findAll, findByDateRange
  - assetModel: create, findAll, update
  - 数据验证和错误处理
  - 边界条件测试

- **工具函数测试**
  - Logger配置和日志级别
  - 验证中间件 (validateDateRange, validateAsset)
  - 环境配置测试

#### 测试特点
- 使用内存数据库进行隔离测试
- 模拟外部依赖 (Winston)
- 完整的错误情况覆盖

### 2. 集成测试 (Integration Tests)

**位置**: `backend/src/__tests__/integration/`

#### 测试文件结构
```
backend/src/__tests__/integration/
└── api.test.ts             # API端点集成测试
```

#### 覆盖功能
- **API端点测试**
  - Bills API (GET, POST, 文件上传)
  - Assets API (CRUD操作)
  - Logs API (日志获取和筛选)
  
- **中间件测试**
  - CORS配置
  - 错误处理中间件
  - JSON/表单数据解析

- **系统集成测试**
  - 数据库操作集成
  - 文件系统操作
  - 完整请求-响应流程

#### 测试特点
- 使用SuperTest模拟HTTP请求
- 模拟数据库和文件系统
- 测试完整的API交互流程

### 3. 冒烟测试 (Smoke Tests)

**位置**: `backend/src/__tests__/smoke/`

#### 测试文件结构
```
backend/src/__tests__/smoke/
└── smoke.test.ts           # 系统健康检查
```

#### 覆盖功能
- **环境检查**
  - Node.js运行时检查
  - 环境变量验证
  - 文件系统权限

- **依赖验证**
  - 核心依赖可用性 (Express, SQLite, Winston等)
  - 配置文件完整性 (package.json, tsconfig.json)
  - 模块导入测试

- **系统资源**
  - 内存使用检查
  - 基本API健康检查
  - 数据库连接测试

#### 测试特点
- 快速执行 (< 30秒)
- 验证系统基本可用性
- 适合CI/CD流水线前置检查

### 4. 端到端测试 (E2E Tests)

**位置**: `frontend/tests/e2e/`

#### 测试文件结构
```
frontend/tests/e2e/
└── e2e.test.ts             # 用户交互流程测试
```

#### 覆盖功能
- **导航功能**
  - 页面间跳转
  - 路由正确性
  - 菜单交互

- **业务流程**
  - 账单管理完整流程
  - 资产添加/编辑流程
  - 数据筛选和查询
  - 文件上传流程

- **用户体验**
  - 表单验证
  - 加载状态
  - 错误处理
  - 响应式设计

- **系统稳定性**
  - 网络错误处理
  - API异常处理
  - 性能测试

#### 测试特点
- 使用Playwright进行浏览器自动化
- 模拟真实用户操作
- 跨浏览器兼容性测试
- 响应式设计验证

## 🛠️ 测试工具和配置

### 测试工具类

**位置**: `backend/src/__tests__/setup/test-setup.ts`

#### 核心工具
- **TestDatabase** - 测试数据库管理
- **TestHelper** - 通用测试辅助函数
- **MockDataGenerator** - 模拟数据生成器
- **PerformanceHelper** - 性能测试工具
- **ErrorSimulator** - 错误场景模拟

#### 自定义断言
- **toBeValidBill** - 验证账单对象
- **toBeValidAsset** - 验证资产对象  
- **toBeValidDate** - 验证日期格式

### 测试配置

#### Jest配置 (后端)
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/types/**'
  ]
};
```

#### Playwright配置 (前端)
```javascript
// playwright.config.ts
export default {
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## 🚀 运行测试

### 使用测试运行器

我们提供了统一的测试运行器脚本 `test-runner.js`：

```bash
# 运行所有测试
node test-runner.js

# 运行特定类型的测试
node test-runner.js unit           # 单元测试
node test-runner.js integration    # 集成测试
node test-runner.js smoke          # 冒烟测试
node test-runner.js e2e            # 端到端测试

# 使用选项
node test-runner.js unit --coverage    # 生成覆盖率报告
node test-runner.js all --watch         # 监视模式
node test-runner.js all --bail          # 遇到失败即停止
node test-runner.js --help              # 显示帮助
```

### 手动运行测试

#### 后端测试
```bash
cd backend

# 单元测试
npm test -- --testPathPattern=".*\.test\.(ts|js)$"

# 集成测试  
npm test -- --testPathPattern="integration.*\.test\.(ts|js)$"

# 冒烟测试
npm test -- --testPathPattern="smoke.*\.test\.(ts|js)$"

# 生成覆盖率报告
npm test -- --coverage
```

#### 前端测试
```bash
cd frontend

# 端到端测试
npx playwright test

# 生成测试报告
npx playwright show-report
```

## 📊 测试报告和覆盖率

### 覆盖率目标
- **单元测试覆盖率**: > 80%
- **集成测试覆盖率**: > 70%
- **关键路径覆盖**: 100%

### 报告生成
- **HTML覆盖率报告**: `backend/coverage/lcov-report/index.html`
- **Playwright测试报告**: `frontend/playwright-report/index.html`
- **JUnit XML报告**: 支持CI/CD集成

## 🔄 CI/CD 集成

### GitHub Actions 示例
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: node test-runner.js --install-only
        
      - name: Run smoke tests
        run: node test-runner.js smoke
        
      - name: Run unit tests
        run: node test-runner.js unit --coverage
        
      - name: Run integration tests
        run: node test-runner.js integration
        
      - name: Run E2E tests
        run: node test-runner.js e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎯 测试最佳实践

### 1. 测试命名规范
- 使用描述性的测试名称
- 遵循 "应该...当...时" 的模式
- 使用中文描述增强可读性

### 2. 测试数据管理
- 使用内存数据库进行隔离
- 每个测试后清理数据
- 使用MockDataGenerator生成测试数据

### 3. 错误处理测试
- 测试所有错误路径
- 验证错误消息的准确性
- 模拟各种异常情况

### 4. 性能测试
- 设置合理的超时时间
- 监控测试执行时间
- 避免不必要的等待

### 5. 维护性
- 定期更新测试用例
- 及时修复失败的测试
- 保持测试和代码同步

## 🐛 常见问题

### 1. 测试环境问题
**问题**: 测试数据库连接失败
**解决**: 确保使用内存数据库，检查better-sqlite3依赖

### 2. E2E测试问题
**问题**: Playwright浏览器启动失败
**解决**: 运行 `npx playwright install` 安装浏览器

### 3. 覆盖率问题
**问题**: 覆盖率报告不准确
**解决**: 检查Jest配置中的collectCoverageFrom设置

### 4. 性能问题
**问题**: 测试运行缓慢
**解决**: 使用--bail选项快速失败，优化测试数据大小

## 📝 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 初始测试套件创建
- ✅ 单元测试覆盖所有核心模块
- ✅ 集成测试覆盖所有API端点
- ✅ 冒烟测试验证系统健康
- ✅ E2E测试覆盖主要用户流程
- ✅ 统一测试运行器脚本
- ✅ 完整的测试工具和辅助类

## 🤝 贡献指南

1. 添加新功能时，请同时添加相应的测试
2. 确保所有测试通过后再提交代码
3. 遵循现有的测试命名和结构规范
4. 更新相关文档和测试用例

## 📞 支持

如有问题或建议，请：
1. 查看本文档的常见问题部分
2. 运行 `node test-runner.js --help` 查看命令帮助
3. 提交Issue或联系开发团队 