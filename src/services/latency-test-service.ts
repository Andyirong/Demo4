import { BrowserAutomation, LatencyTestResult } from './browser-automation';

export interface TestConfig {
  urls: string[];
  testCount?: number;
  interval?: number;
  waitForSelector?: string;
  networkCondition?: 'slow3g' | 'fast3g' | 'slow4g' | 'fast4g';
}

export interface TestSummary {
  url: string;
  avgLoadTime: number;
  minLoadTime: number;
  maxLoadTime: number;
  avgDomContentLoaded: number;
  avgFirstContentfulPaint: number;
  avgLargestContentfulPaint: number;
  testCount: number;
  errorCount: number;
  lastTestTime: Date;
}

export class LatencyTestService {
  private browserAutomation: BrowserAutomation;
  private isRunning: boolean = false;
  private testHistory: LatencyTestResult[] = [];

  constructor() {
    this.browserAutomation = new BrowserAutomation();
  }

  async initialize(): Promise<void> {
    await this.browserAutomation.initialize();
  }

  async runLatencyTests(config: TestConfig): Promise<LatencyTestResult[]> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;

    try {
      // 如果设置了网络条件，应用它
      if (config.networkCondition) {
        await this.browserAutomation.emulateNetwork(config.networkCondition);
      }

      // 运行测试
      const results = await this.browserAutomation.testMultipleUrls(
        config.urls,
        config.testCount || 3,
        config.interval || 2000
      );

      // 保存测试历史
      this.testHistory.push(...results);

      // 限制历史记录数量，保留最近 1000 条
      if (this.testHistory.length > 1000) {
        this.testHistory = this.testHistory.slice(-1000);
      }

      return results;
    } finally {
      this.isRunning = false;
    }
  }

  async runSingleTest(url: string, waitForSelector?: string): Promise<LatencyTestResult> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;

    try {
      const result = await this.browserAutomation.testLatency(url, waitForSelector);

      // 保存测试历史
      this.testHistory.push(result);

      // 限制历史记录数量
      if (this.testHistory.length > 1000) {
        this.testHistory = this.testHistory.slice(-1000);
      }

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  getTestSummary(url: string, limit?: number): TestSummary | null {
    // 获取指定 URL 的测试结果
    const urlTests = limit
      ? this.testHistory.filter(test => test.url === url).slice(-limit)
      : this.testHistory.filter(test => test.url === url);

    if (urlTests.length === 0) {
      return null;
    }

    // 过滤出成功的测试
    const successfulTests = urlTests.filter(test => !test.error);
    const errorCount = urlTests.length - successfulTests.length;

    if (successfulTests.length === 0) {
      return {
        url,
        avgLoadTime: 0,
        minLoadTime: 0,
        maxLoadTime: 0,
        avgDomContentLoaded: 0,
        avgFirstContentfulPaint: 0,
        avgLargestContentfulPaint: 0,
        testCount: urlTests.length,
        errorCount,
        lastTestTime: urlTests[urlTests.length - 1].timestamp
      };
    }

    const loadTimes = successfulTests.map(test => test.loadTime);
    const domContentLoadedTimes = successfulTests.map(test => test.domContentLoaded);
    const fcpTimes = successfulTests.map(test => test.firstContentfulPaint);
    const lcpTimes = successfulTests.map(test => test.largestContentfulPaint);

    return {
      url,
      avgLoadTime: this.average(loadTimes),
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      avgDomContentLoaded: this.average(domContentLoadedTimes),
      avgFirstContentfulPaint: this.average(fcpTimes),
      avgLargestContentfulPaint: this.average(lcpTimes),
      testCount: urlTests.length,
      errorCount,
      lastTestTime: urlTests[urlTests.length - 1].timestamp
    };
  }

  getAllTestSummaries(): TestSummary[] {
    const urls = [...new Set(this.testHistory.map(test => test.url))];
    return urls.map(url => this.getTestSummary(url)!)
      .filter(summary => summary !== null)
      .sort((a, b) => b.lastTestTime.getTime() - a.lastTestTime.getTime());
  }

  getRecentTests(limit: number = 50): LatencyTestResult[] {
    return this.testHistory.slice(-limit);
  }

  getTestsByTimeRange(startDate: Date, endDate: Date): LatencyTestResult[] {
    return this.testHistory.filter(
      test => test.timestamp >= startDate && test.timestamp <= endDate
    );
  }

  clearHistory(): void {
    this.testHistory = [];
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  async close(): Promise<void> {
    await this.browserAutomation.close();
  }

  // 导出测试数据为 JSON
  exportData(): string {
    return JSON.stringify({
      testHistory: this.testHistory,
      summaries: this.getAllTestSummaries(),
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  // 导入测试数据
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.testHistory && Array.isArray(data.testHistory)) {
        // 转换时间戳字符串回 Date 对象
        this.testHistory = data.testHistory.map((test: any) => ({
          ...test,
          timestamp: new Date(test.timestamp)
        }));
      }
    } catch (error) {
      throw new Error('Invalid JSON data format');
    }
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}