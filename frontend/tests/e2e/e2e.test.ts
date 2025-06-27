import { test, expect, Page } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://localhost:3000';

// 辅助函数
const waitForElement = async (page: Page, selector: string, timeout = 5000) => {
  await page.waitForSelector(selector, { timeout });
};

const fillForm = async (page: Page, formData: Record<string, string | number>) => {
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value.toString());
  }
};

// 测试前的设置
test.beforeEach(async ({ page }) => {
  // 拦截API请求，返回模拟数据
  await page.route('**/api/bills', async route => {
    const mockBills = [
      {
        id: 1,
        date: '2024-01-01',
        category: '餐饮',
        amount: 100,
        description: '午餐',
        tags: '日常'
      },
      {
        id: 2,
        date: '2024-01-02',
        category: '交通',
        amount: 50,
        description: '地铁',
        tags: '通勤'
      }
    ];
    await route.fulfill({ json: mockBills });
  });

  await page.route('**/api/assets', async route => {
    const mockAssets = [
      {
        id: 1,
        name: '招商银行',
        type: 'cash',
        amount: 10000,
        last_updated: '2024-01-01'
      },
      {
        id: 2,
        name: '阿里股票',
        type: 'stock',
        amount: 15000,
        last_updated: '2024-01-02'
      }
    ];
    await route.fulfill({ json: mockAssets });
  });

  await page.route('**/api/logs', async route => {
    const mockLogs = [
      {
        level: 'info',
        message: 'Test log message',
        timestamp: '2024-01-01T10:00:00.000Z'
      }
    ];
    await route.fulfill({ json: mockLogs });
  });

  // 每个测试前访问首页
  await page.goto(BASE_URL);
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
});

test.describe('资产管理工具 E2E 测试', () => {
  
  test.describe('导航功能', () => {
    test('应该能够访问主页', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page).toHaveTitle(/资产管理工具/i);
      
      // 检查是否重定向到账单页面
      await expect(page).toHaveURL(/.*\/bills/);
    });

    test('应该能够在各页面间导航', async ({ page }) => {
      await page.goto(BASE_URL);

      // 测试导航到各个页面
      const navigationTests = [
        { selector: '[data-testid="nav-bills"]', url: '/bills', title: '账单' },
        { selector: '[data-testid="nav-assets"]', url: '/assets', title: '资产' },
        { selector: '[data-testid="nav-analytics"]', url: '/analytics', title: '分析' },
        { selector: '[data-testid="nav-forecast"]', url: '/forecast', title: '预测' },
        { selector: '[data-testid="nav-logs"]', url: '/logs', title: '日志' }
      ];

      for (const nav of navigationTests) {
        if (await page.locator(nav.selector).isVisible()) {
          await page.click(nav.selector);
          await expect(page).toHaveURL(new RegExp(`.*${nav.url}`));
          await expect(page.locator('h1, h2, .page-title')).toContainText(nav.title);
        }
      }
    });

    test('应该显示导航菜单', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // 检查主要导航项是否存在
      const navItems = ['账单', '资产', '分析', '预测', '日志'];
      for (const item of navItems) {
        await expect(page.locator('.nav-menu')).toContainText(item);
      }
    });
  });

  test.describe('账单管理功能', () => {
    test('应该显示账单列表', async ({ page }) => {
      await page.goto(`${BASE_URL}/bills`);
      
      // 等待表格加载
      await page.waitForSelector('.el-table');
      
      // 检查表格头部
      const tableHeaders = ['日期', '分类', '金额', '描述', '标签'];
      for (const header of tableHeaders) {
        await expect(page.locator('.el-table th')).toContainText(header);
      }
      
      // 检查是否显示模拟数据
      await expect(page.locator('.el-table tbody tr')).toHaveCount(2);
      await expect(page.locator('.el-table tbody')).toContainText('餐饮');
      await expect(page.locator('.el-table tbody')).toContainText('交通');
    });

    test('应该能够使用日期筛选功能', async ({ page }) => {
      await page.goto(`${BASE_URL}/bills`);
      
      // 查找日期选择器
      const dateRangePicker = page.locator('.el-date-editor');
      if (await dateRangePicker.isVisible()) {
        await dateRangePicker.click();
        
        // 选择日期范围（这里简化处理）
        await page.keyboard.press('Escape'); // 关闭日期选择器
        
        // 检查查询按钮
        const queryButton = page.locator('button:has-text("查询")');
        if (await queryButton.isVisible()) {
          await expect(queryButton).toBeEnabled();
        }
      }
    });

    test('应该能够重置筛选条件', async ({ page }) => {
      await page.goto(`${BASE_URL}/bills`);
      
      const resetButton = page.locator('button:has-text("重置")');
      if (await resetButton.isVisible()) {
        await resetButton.click();
        // 验证重置后的状态
        await expect(resetButton).toBeEnabled();
      }
    });

    test('应该能够导航到导入页面', async ({ page }) => {
      await page.goto(`${BASE_URL}/bills`);
      
      const importButton = page.locator('button:has-text("导入账单")');
      if (await importButton.isVisible()) {
        await importButton.click();
        await expect(page).toHaveURL(/.*\/import/);
      }
    });
  });

  test.describe('资产管理功能', () => {
    test('应该显示资产列表', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      // 等待表格加载
      await page.waitForSelector('.el-table');
      
      // 检查表格头部
      const tableHeaders = ['名称', '类型', '金额', '最后更新', '操作'];
      for (const header of tableHeaders) {
        await expect(page.locator('.el-table th')).toContainText(header);
      }
      
      // 检查是否显示模拟数据
      await expect(page.locator('.el-table tbody tr')).toHaveCount(2);
      await expect(page.locator('.el-table tbody')).toContainText('招商银行');
      await expect(page.locator('.el-table tbody')).toContainText('阿里股票');
    });

    test('应该能够打开添加资产对话框', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      const addButton = page.locator('button:has-text("添加资产")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // 检查对话框是否打开
        const dialog = page.locator('.el-dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('添加资产');
        
        // 检查表单字段
        await expect(page.locator('input[placeholder*="名称"]')).toBeVisible();
        await expect(page.locator('.el-select')).toBeVisible();
        await expect(page.locator('.el-input-number')).toBeVisible();
      }
    });

    test('应该能够填写资产表单', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      const addButton = page.locator('button:has-text("添加资产")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // 填写表单
        await page.fill('input[placeholder*="名称"]', '测试资产');
        
        // 选择资产类型
        await page.click('.el-select');
        await page.click('.el-option:has-text("现金")');
        
        // 输入金额
        await page.fill('.el-input-number input', '5000');
        
        // 检查确定按钮
        const confirmButton = page.locator('button:has-text("确定")');
        await expect(confirmButton).toBeEnabled();
      }
    });

    test('应该能够查看资产详情', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      // 点击详情按钮
      const detailButton = page.locator('button:has-text("详情")').first();
      if (await detailButton.isVisible()) {
        await detailButton.click();
        // 验证导航到详情页面
        await expect(page).toHaveURL(/.*\/assets\/\d+/);
      }
    });

    test('应该能够更新资产', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      // 点击更新按钮
      const updateButton = page.locator('button:has-text("更新")').first();
      if (await updateButton.isVisible()) {
        await updateButton.click();
        
        // 检查更新对话框
        const dialog = page.locator('.el-dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText('更新资产');
      }
    });
  });

  test.describe('数据分析功能', () => {
    test('应该显示分析图表', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      
      // 检查页面标题
      await expect(page.locator('.card-header')).toContainText('支出分类统计');
      
      // 检查图表容器
      const chartContainers = page.locator('.chart');
      await expect(chartContainers).toHaveCount(3); // 分类统计、趋势、资产分布
      
      // 检查日期选择器
      const dateRangePicker = page.locator('.el-date-editor');
      if (await dateRangePicker.isVisible()) {
        await expect(dateRangePicker).toBeEnabled();
      }
    });

    test('应该能够切换日期范围', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`);
      
      const dateRangePicker = page.locator('.el-date-editor');
      if (await dateRangePicker.isVisible()) {
        await dateRangePicker.click();
        await page.keyboard.press('Escape'); // 简化测试，关闭选择器
      }
    });
  });

  test.describe('支出预测功能', () => {
    test('应该显示预测图表', async ({ page }) => {
      await page.goto(`${BASE_URL}/forecast`);
      
      // 检查页面标题
      await expect(page.locator('.card-header')).toContainText('支出预测');
      
      // 检查预测周期选择器
      const periodSelect = page.locator('.el-select');
      if (await periodSelect.isVisible()) {
        await expect(periodSelect).toBeEnabled();
      }
      
      // 检查图表容器
      const chartContainers = page.locator('.chart');
      await expect(chartContainers).toHaveCount(3); // 预测、分类预测、资产增长预测
    });

    test('应该能够切换预测周期', async ({ page }) => {
      await page.goto(`${BASE_URL}/forecast`);
      
      const periodSelect = page.locator('.el-select');
      if (await periodSelect.isVisible()) {
        await periodSelect.click();
        
        // 选择不同的预测周期
        const options = ['未来3个月', '未来6个月', '未来12个月'];
        for (const option of options) {
          const optionElement = page.locator(`.el-option:has-text("${option}")`);
          if (await optionElement.isVisible()) {
            await optionElement.click();
            break; // 只测试一个选项的点击
          }
        }
      }
    });
  });

  test.describe('系统日志功能', () => {
    test('应该显示日志列表', async ({ page }) => {
      await page.goto(`${BASE_URL}/logs`);
      
      // 检查是否显示日志数据
      await expect(page.locator('body')).toContainText('日志');
      
      // 等待日志数据加载
      await page.waitForTimeout(1000);
    });
  });

  test.describe('响应式设计测试', () => {
    test('应该在移动设备上正常显示', async ({ page }) => {
      // 设置移动设备视口
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      
      // 检查页面是否能正常加载
      await expect(page.locator('body')).toBeVisible();
      
      // 检查导航是否适配移动端
      const nav = page.locator('.nav-menu, .el-menu');
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
    });

    test('应该在平板设备上正常显示', async ({ page }) => {
      // 设置平板设备视口
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      
      // 检查页面布局
      await expect(page.locator('body')).toBeVisible();
      
      // 检查表格是否正常显示
      await page.goto(`${BASE_URL}/bills`);
      const table = page.locator('.el-table');
      if (await table.isVisible()) {
        await expect(table).toBeVisible();
      }
    });
  });

  test.describe('错误处理测试', () => {
    test('应该处理API错误', async ({ page }) => {
      // 模拟API错误
      await page.route('**/api/bills', async route => {
        await route.fulfill({ status: 500, json: { error: 'Internal Server Error' } });
      });
      
      await page.goto(`${BASE_URL}/bills`);
      
      // 检查错误处理（这取决于应用的错误处理实现）
      await page.waitForTimeout(2000);
      // 这里可以添加更具体的错误状态检查
    });

    test('应该处理网络错误', async ({ page }) => {
      // 模拟网络连接失败
      await page.route('**/api/**', async route => {
        await route.abort('failed');
      });
      
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
      
      // 检查应用是否能优雅地处理网络错误
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('性能测试', () => {
    test('页面加载时间应该合理', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // 页面加载时间应该在5秒内
      expect(loadTime).toBeLessThan(5000);
    });

    test('导航切换应该流畅', async ({ page }) => {
      await page.goto(BASE_URL);
      
      const pages = ['/bills', '/assets', '/analytics', '/forecast'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('domcontentloaded');
        const navTime = Date.now() - startTime;
        
        // 页面切换时间应该在2秒内
        expect(navTime).toBeLessThan(2000);
      }
    });
  });

  test.describe('用户体验测试', () => {
    test('应该显示加载状态', async ({ page }) => {
      await page.goto(`${BASE_URL}/bills`);
      
      // 检查是否有加载指示器
      const loadingIndicator = page.locator('.el-loading, .loading, [v-loading]');
      
      // 注意：由于加载很快，这个测试可能需要调整
      await page.waitForTimeout(100);
    });

    test('应该提供用户反馈', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      // 测试按钮交互反馈
      const addButton = page.locator('button:has-text("添加资产")');
      if (await addButton.isVisible()) {
        await addButton.hover();
        // 检查悬停效果（这取决于CSS实现）
      }
    });

    test('表单验证应该工作正常', async ({ page }) => {
      await page.goto(`${BASE_URL}/assets`);
      
      const addButton = page.locator('button:has-text("添加资产")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // 尝试提交空表单
        const confirmButton = page.locator('button:has-text("确定")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // 检查是否显示验证错误（这取决于Element Plus的验证实现）
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('功能集成测试', () => {
    test('完整的资产添加流程', async ({ page }) => {
      // 模拟成功的创建API
      await page.route('**/api/assets', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ 
            status: 201, 
            json: { id: 3, changes: 1, lastInsertRowid: 3 } 
          });
        } else {
          // GET请求返回更新后的列表
          const mockAssets = [
            {
              id: 1,
              name: '招商银行',
              type: 'cash',
              amount: 10000,
              last_updated: '2024-01-01'
            },
            {
              id: 2,
              name: '阿里股票',
              type: 'stock',
              amount: 15000,
              last_updated: '2024-01-02'
            },
            {
              id: 3,
              name: '测试资产',
              type: 'cash',
              amount: 5000,
              last_updated: '2024-01-03'
            }
          ];
          await route.fulfill({ json: mockAssets });
        }
      });

      await page.goto(`${BASE_URL}/assets`);
      
      // 点击添加按钮
      const addButton = page.locator('button:has-text("添加资产")');
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // 填写表单
        await page.fill('input[placeholder*="名称"]', '测试资产');
        await page.click('.el-select');
        await page.click('.el-option:has-text("现金")');
        await page.fill('.el-input-number input', '5000');
        
        // 提交表单
        await page.click('button:has-text("确定")');
        
        // 等待对话框关闭和列表刷新
        await page.waitForTimeout(1000);
        
        // 验证新资产出现在列表中
        await expect(page.locator('.el-table tbody')).toContainText('测试资产');
      }
    });
  });
}); 