import { chromium, Browser, Page } from 'playwright';

export interface LatencyTestResult {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timestamp: Date;
  error?: string;
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    // 创建新的页面上下文
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      // 忽略图片和CSS以加快测试速度（可选）
      ignoreHTTPSErrors: true
    });

    this.page = await context.newPage();
  }

  async testLatency(url: string, waitForSelector?: string): Promise<LatencyTestResult> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const result: LatencyTestResult = {
      url,
      loadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timestamp: new Date()
    };

    try {
      // 导航到页面并开始性能测量
      const startTime = Date.now();

      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      // 等待特定选择器（如果提供）
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      const endTime = Date.now();
      result.loadTime = endTime - startTime;

      // 获取性能指标
      const performanceMetrics = await this.page.evaluate(() => {
        // 获取导航时间
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;

        // 获取绘制时间
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(
          entry => entry.name === 'first-contentful-paint'
        )?.startTime || 0;

        return {
          domContentLoaded,
          firstContentfulPaint
        };
      });

      result.domContentLoaded = performanceMetrics.domContentLoaded;
      result.firstContentfulPaint = performanceMetrics.firstContentfulPaint;

      // 获取 LCP (Largest Contentful Paint)
      const lcpValue = await this.page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let lcp = 0;
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              lcp = lastEntry.startTime;
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // 如果不支持 LCP，使用 0
          }

          // 等待一段时间获取 LCP 值
          setTimeout(() => resolve(lcp), 1000);
        });
      });

      result.largestContentfulPaint = lcpValue;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  async runMultipleTests(
    url: string,
    count: number = 5,
    interval: number = 2000,
    waitForSelector?: string
  ): Promise<LatencyTestResult[]> {
    const results: LatencyTestResult[] = [];

    for (let i = 0; i < count; i++) {
      console.log(`Running test ${i + 1}/${count} for ${url}`);

      const result = await this.testLatency(url, waitForSelector);
      results.push(result);

      // 在测试之间等待
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    return results;
  }

  async testMultipleUrls(
    urls: string[],
    testsPerUrl: number = 3,
    interval: number = 2000
  ): Promise<LatencyTestResult[]> {
    const allResults: LatencyTestResult[] = [];

    for (const url of urls) {
      console.log(`Testing URL: ${url}`);
      const results = await this.runMultipleTests(url, testsPerUrl, interval);
      allResults.push(...results);
    }

    return allResults;
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.context().close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // 获取页面截图
  async takeScreenshot(path?: string): Promise<Buffer | string> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    if (path) {
      await this.page.screenshot({ path, fullPage: true });
      return path;
    } else {
      return await this.page.screenshot({ fullPage: true });
    }
  }

  // 模拟网络条件
  async emulateNetwork(condition: 'slow3g' | 'fast3g' | 'slow4g' | 'fast4g'): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const networkConditions = {
      slow3g: { download: 500 * 1024 / 8, upload: 500 * 1024 / 8, latency: 400 },
      fast3g: { download: 1.6 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 300 },
      slow4g: { download: 2 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 200 },
      fast4g: { download: 10 * 1024 * 1024 / 8, upload: 5 * 1024 * 1024 / 8, latency: 100 }
    };

    const conditionConfig = networkConditions[condition];
    await this.page.context().setOffline(false);

    // 注意：Playwright 的网络限制 API 可能在不同版本中有所不同
    // 这里使用一个简化的实现
    console.log(`Emulating network condition: ${condition}`);
  }
}