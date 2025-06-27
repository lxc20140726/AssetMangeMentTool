#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// 解析命令行参数
const args = process.argv.slice(2);
const testType = args[0] || 'all';
const options = {
  coverage: args.includes('--coverage'),
  watch: args.includes('--watch'),
  verbose: args.includes('--verbose'),
  bail: args.includes('--bail')
};

// 测试配置
const testConfigs = {
  unit: {
    name: '单元测试 (Unit Tests)',
    command: 'npm test -- --testPathPattern=".*\\.test\\.(ts|js)$"',
    cwd: 'backend',
    description: '测试数据模型、工具函数等独立模块'
  },
  integration: {
    name: '集成测试 (Integration Tests)',
    command: 'npm test -- --testPathPattern="integration.*\\.test\\.(ts|js)$"',
    cwd: 'backend',
    description: '测试API端点和服务间的交互'
  },
  smoke: {
    name: '冒烟测试 (Smoke Tests)',
    command: 'npm test -- --testPathPattern="smoke.*\\.test\\.(ts|js)$"',
    cwd: 'backend',
    description: '快速验证系统基本功能是否正常'
  },
  e2e: {
    name: '端到端测试 (E2E Tests)',
    command: 'npx playwright test',
    cwd: 'frontend',
    description: '测试完整的用户交互流程',
    skipIfMissing: true
  }
};

// 检查依赖
async function checkDependencies() {
  log.title('🔍 检查测试依赖');
  
  const dependencies = [
    { name: 'Jest (后端)', file: 'backend/package.json', key: 'jest' },
    { name: 'TypeScript', file: 'backend/package.json', key: 'typescript' },
    { name: 'Node.js', check: () => checkCommand('node --version') }
  ];
  
  for (const dep of dependencies) {
    if (dep.file) {
      if (fs.existsSync(dep.file)) {
        const pkg = JSON.parse(fs.readFileSync(dep.file, 'utf8'));
        if (pkg.devDependencies && pkg.devDependencies[dep.key]) {
          log.success(`${dep.name}: ${pkg.devDependencies[dep.key]}`);
        } else if (pkg.dependencies && pkg.dependencies[dep.key]) {
          log.success(`${dep.name}: ${pkg.dependencies[dep.key]}`);
        } else {
          log.warning(`${dep.name}: 未找到依赖`);
        }
      } else {
        log.warning(`${dep.name}: package.json 不存在`);
      }
    } else if (dep.check) {
      try {
        await dep.check();
        log.success(`${dep.name}: 已安装`);
      } catch (error) {
        log.error(`${dep.name}: 未安装或不可用`);
      }
    }
  }
}

// 检查命令是否可用
function checkCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'ignore' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: ${command}`));
      }
    });
    child.on('error', reject);
  });
}

// 运行单个测试类型
async function runTest(config) {
  return new Promise((resolve, reject) => {
    log.title(`🧪 运行 ${config.name}`);
    log.info(config.description);
    
    // 检查工作目录是否存在
    if (!fs.existsSync(config.cwd)) {
      if (config.skipIfMissing) {
        log.warning(`跳过 ${config.name}: 目录 ${config.cwd} 不存在`);
        resolve({ code: 0, skipped: true });
        return;
      } else {
        log.error(`目录 ${config.cwd} 不存在`);
        resolve({ code: 1, error: '目录不存在' });
        return;
      }
    }
    
    // 构建命令
    let command = config.command;
    
    // 添加选项
    if (options.coverage && config.cwd === 'backend') {
      command += ' --coverage';
    }
    if (options.watch) {
      command += ' --watch';
    }
    if (options.verbose) {
      command += ' --verbose';
    }
    if (options.bail) {
      command += ' --bail';
    }
    
    log.info(`执行命令: ${command}`);
    log.info(`工作目录: ${config.cwd}`);
    
    const startTime = Date.now();
    const child = spawn(command, {
      shell: true,
      cwd: config.cwd,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const durationStr = `${(duration / 1000).toFixed(2)}s`;
      
      if (code === 0) {
        log.success(`${config.name} 完成 (${durationStr})`);
        resolve({ code, duration });
      } else {
        log.error(`${config.name} 失败 (${durationStr})`);
        resolve({ code, duration, error: `退出码: ${code}` });
      }
    });
    
    child.on('error', (error) => {
      log.error(`${config.name} 执行错误: ${error.message}`);
      resolve({ code: 1, error: error.message });
    });
  });
}

// 安装缺失的依赖
async function installMissingDependencies() {
  log.title('📦 检查和安装依赖');
  
  const directories = ['backend', 'frontend'];
  
  for (const dir of directories) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'package.json'))) {
      log.info(`检查 ${dir} 目录的依赖...`);
      
      const hasNodeModules = fs.existsSync(path.join(dir, 'node_modules'));
      
      if (!hasNodeModules) {
        log.info(`安装 ${dir} 的依赖...`);
        
        try {
          await new Promise((resolve, reject) => {
            const npmInstall = spawn('npm install', {
              shell: true,
              cwd: dir,
              stdio: 'inherit'
            });
            
            npmInstall.on('close', (code) => {
              if (code === 0) {
                log.success(`${dir} 依赖安装完成`);
                resolve();
              } else {
                reject(new Error(`npm install 失败，退出码: ${code}`));
              }
            });
            
            npmInstall.on('error', reject);
          });
        } catch (error) {
          log.error(`${dir} 依赖安装失败: ${error.message}`);
        }
      } else {
        log.success(`${dir} 依赖已安装`);
      }
    }
  }
}

// 清理测试数据
async function cleanupTestData() {
  log.title('🧹 清理测试数据');
  
  const cleanupItems = [
    'backend/coverage',
    'backend/test-results',
    'frontend/test-results',
    'frontend/playwright-report'
  ];
  
  for (const item of cleanupItems) {
    if (fs.existsSync(item)) {
      try {
        fs.rmSync(item, { recursive: true, force: true });
        log.success(`已清理: ${item}`);
      } catch (error) {
        log.warning(`清理失败: ${item} - ${error.message}`);
      }
    }
  }
}

// 生成测试报告
function generateReport(results) {
  log.title('📊 测试报告');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.code === 0).length;
  const failedTests = results.filter(r => r.code !== 0 && !r.skipped).length;
  const skippedTests = results.filter(r => r.skipped).length;
  
  console.log(`总测试套件: ${totalTests}`);
  console.log(`${colors.green}通过: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}失败: ${failedTests}${colors.reset}`);
  console.log(`${colors.yellow}跳过: ${skippedTests}${colors.reset}`);
  
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  console.log(`总用时: ${(totalDuration / 1000).toFixed(2)}s`);
  
  if (failedTests > 0) {
    log.error('\n失败的测试:');
    results.forEach((result, index) => {
      if (result.code !== 0 && !result.skipped) {
        const testName = Object.keys(testConfigs)[index];
        log.error(`  - ${testConfigs[testName].name}: ${result.error || '未知错误'}`);
      }
    });
  }
  
  return failedTests === 0;
}

// 显示帮助信息
function showHelp() {
  log.title('🚀 测试运行器');
  
  console.log('用法: node test-runner.js [测试类型] [选项]');
  console.log('\n测试类型:');
  console.log('  all        运行所有测试 (默认)');
  console.log('  unit       只运行单元测试');
  console.log('  integration 只运行集成测试');
  console.log('  smoke      只运行冒烟测试');
  console.log('  e2e        只运行端到端测试');
  console.log('\n选项:');
  console.log('  --coverage  生成代码覆盖率报告');
  console.log('  --watch     监视模式');
  console.log('  --verbose   详细输出');
  console.log('  --bail      遇到第一个失败就停止');
  console.log('  --help      显示此帮助信息');
  console.log('\n示例:');
  console.log('  node test-runner.js unit --coverage');
  console.log('  node test-runner.js e2e --verbose');
  console.log('  node test-runner.js all --bail');
}

// 主函数
async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  log.title('🚀 资产管理工具 - 测试运行器');
  
  try {
    // 检查依赖
    await checkDependencies();
    
    // 安装缺失的依赖
    await installMissingDependencies();
    
    // 清理旧的测试数据
    if (!options.watch) {
      await cleanupTestData();
    }
    
    // 确定要运行的测试
    let testsToRun = [];
    
    if (testType === 'all') {
      testsToRun = Object.values(testConfigs);
    } else if (testConfigs[testType]) {
      testsToRun = [testConfigs[testType]];
    } else {
      log.error(`未知的测试类型: ${testType}`);
      log.info('可用的测试类型: ' + Object.keys(testConfigs).join(', '));
      process.exit(1);
    }
    
    // 运行测试
    const results = [];
    
    for (const config of testsToRun) {
      const result = await runTest(config);
      results.push(result);
      
      // 如果开启了 --bail 且测试失败，则停止
      if (options.bail && result.code !== 0 && !result.skipped) {
        log.error('由于 --bail 选项，停止后续测试');
        break;
      }
    }
    
    // 生成报告
    const success = generateReport(results);
    
    // 退出
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log.error(`执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理进程信号
process.on('SIGINT', () => {
  log.warning('\n收到中断信号，正在退出...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  log.warning('\n收到终止信号，正在退出...');
  process.exit(143);
});

// 运行
if (require.main === module) {
  main().catch(error => {
    log.error(`未处理的错误: ${error.message}`);
    process.exit(1);
  });
} 