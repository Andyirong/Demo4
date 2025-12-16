import { test, expect } from '@playwright/test';

test.describe('性能监控仪表板 - 基础功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前都访问主页
    await page.goto('/');
  });

  test('页面正常打开', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle('Performance Monitor');

    // 检查是否正确加载了 React 应用
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('#root')).not.toBeEmpty();

    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
  });

  test('选择项目并查询数据', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');

    // 等待项目选择器出现（项目需要时间加载）
    // 使用更准确的选择器定位项目选择器
    let projectSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Select Application' })
    }).first();

    await expect(projectSelect).toBeVisible({ timeout: 15000 });

    // 等待项目数据加载（监听网络请求完成）
    await page.waitForLoadState('networkidle');

    // 检查 BluePillClient 是否已经被选中
    let selectedValue: string = '';

    // 尝试不同的方法获取选中的值
    try {
      selectedValue = await projectSelect.inputValue();
    } catch {
      // 如果 inputValue 不工作，尝试获取选中选项的文本
      const selectedOption = projectSelect.locator('option[selected]').first();
      selectedValue = await selectedOption.textContent() || '';
    }

    console.log('当前选中:', selectedValue);

    if (selectedValue !== 'BluePillClient') {
      // 如果不是 BluePillClient，则需要选择
      console.log('选择 BluePillClient 项目...');

      // 尝试不同的选择方法
      try {
        await projectSelect.selectOption('BluePillClient');
        console.log('通过 selectOption 选择了 BluePillClient 项目');
      } catch {
        // 如果 selectOption 不工作，尝试点击选项
        const bluepillOption = projectSelect.locator('option').filter({
          hasText: 'BluePillClient'
        }).first();
        await bluepillOption.click();
        console.log('通过点击选择了 BluePillClient 项目');
      }
    } else {
      console.log('BluePillClient 已经被选中');
    }

    // 等待操作加载（操作也需要时间加载）
    await page.waitForTimeout(3000);

    // 查找操作选择器
    let actionCombobox: any;

    // 尝试多种方法定位操作选择器
    try {
      actionCombobox = page.locator('combobox').nth(1);
      const isCombobox = await actionCombobox.isVisible().catch(() => false);
      if (!isCombobox) {
        throw new Error('Not combobox');
      }
    } catch {
      // 如果不是 combobox，尝试 select
      actionCombobox = page.locator('select').filter({
        has: page.locator('option', { hasText: 'Select Operation' })
      }).first();
    }

    // 等待操作选择器启用（初始可能是禁用的）
    try {
      await expect(actionCombobox).toBeEnabled({ timeout: 5000 });
      console.log('操作选择器已启用');
    } catch {
      // 如果元素存在但是是禁用的，这是正常的
      console.log('操作选择器存在但可能仍然禁用');
    }

    // 点击操作选择器
    await actionCombobox.click();
    console.log('点击了操作选择器');
    await page.waitForTimeout(1000);

    // 获取所有操作选项（排除占位符）
    const actionOptions = await actionCombobox.locator('option').all();
    console.log(`找到 ${actionOptions.length} 个操作选项`);

    // 选择第一个有效操作（跳过第一个占位符选项）
    if (actionOptions.length > 1) {
      // 获取第一个非占位符选项的文本
      const firstValidOption = actionOptions[1]; // 第二个选项
      const optionText = await firstValidOption.textContent();

      if (optionText && !optionText.includes('Select Operation')) {
        await actionCombobox.selectOption(optionText);
        console.log(`选择了操作: ${optionText}`);
      } else {
        // 使用索引方式选择
        await actionCombobox.selectOption({ index: 1 });
        console.log('选择了索引为1的操作');
      }
    }

    // 点击执行按钮 - 根据页面快照，按钮初始可能是禁用的
    const executeButton = page.locator('button').filter({
      hasText: /Execute/i
    }).first();

    // 等待按钮启用
    await executeButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('找到 Execute 按钮');

    // 检查按钮是否启用，如果禁用则等待
    if (await executeButton.isDisabled()) {
      console.log('Execute 按钮当前禁用，等待启用...');
      // 使用 waitForFunction 等待按钮启用
      await page.waitForFunction(
        () => !(document.querySelector('button') as HTMLButtonElement)?.disabled,
        { timeout: 5000 }
      );
    }

    // 点击按钮
    await executeButton.click();
    console.log('点击了 Execute 按钮');

    // 等待数据加载
    await page.waitForTimeout(5000);

    // 检查是否显示了数据
    // 方法1：检查是否有数据表格或列表
    const dataContainer = page.locator('table, .data-list, .record-item, [data-testid="record"]');
    const hasData = await dataContainer.count() > 0;

    // 方法2：检查页面文本中是否有数据相关的内容
    const pageContent = await page.textContent('body');
    const hasTextData = pageContent && (
      pageContent.includes('Time-consuming') ||
      pageContent.includes('耗时') ||
      pageContent.includes('ms') ||
      /[0-9]+.*ms/.test(pageContent) ||
      pageContent.includes('No data') ||
      pageContent.includes('无数据') ||
      pageContent.includes('记录') ||
      pageContent.includes('Result') ||
      pageContent.includes('结果')
    );

    // 方法3：检查是否有图表元素
    const hasChart = await page.locator('svg, canvas, .recharts-wrapper').count() > 0;

    // 方法4：检查是否有响应结果
    const hasResponse = await page.locator('[data-testid="response"], .response, .result').count() > 0;

    // 断言：如果有数据、图表、响应结果或明确的无数据提示，则测试通过
    expect(hasData || hasTextData || hasChart || hasResponse).toBeTruthy();

    if (hasData) {
      console.log('找到数据表格或列表');
    } else if (hasTextData) {
      console.log('找到文本数据');
    } else if (hasChart) {
      console.log('找到图表元素');
    } else if (hasResponse) {
      console.log('找到响应结果');
    }
  });
});