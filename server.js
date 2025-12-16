const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 存储测试历史
let testHistory = [];

// 浏览器实例
let browser = null;

// 初始化浏览器
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: 'new',
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
  }
}

// 测试单个URL的延时
app.post('/api/test-latency', async (req, res) => {
  try {
    const { url, waitForSelector, networkCondition = 'fast4g' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    await initBrowser();

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    const startTime = Date.now();
    const result = {
      url,
      loadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timestamp: new Date(),
      error: null
    };

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      const endTime = Date.now();
      result.loadTime = endTime - startTime;

      // 获取性能指标
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;

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

      // 获取 LCP
      const lcpValue = await page.evaluate(() => {
        return new Promise((resolve) => {
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

          setTimeout(() => resolve(lcp), 1000);
        });
      });

      result.largestContentfulPaint = lcpValue;

      // 保存到历史
      testHistory.push(result);
      if (testHistory.length > 1000) {
        testHistory = testHistory.slice(-1000);
      }

      res.json(result);
    } catch (error) {
      result.error = error.message;
      testHistory.push(result);
      res.json(result);
    } finally {
      await context.close();
    }
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批量测试多个URL
app.post('/api/test-multiple', async (req, res) => {
  try {
    const { urls, testCount = 3, interval = 2000, waitForSelector } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    const allResults = [];

    for (const url of urls) {
      for (let i = 0; i < testCount; i++) {
        const response = await fetch(`http://localhost:${port}/api/test-latency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, waitForSelector })
        });

        const result = await response.json();
        allResults.push(result);

        if (i < testCount - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
    }

    res.json(allResults);
  } catch (error) {
    console.error('Batch test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取测试历史
app.get('/api/history', (req, res) => {
  const { url, limit } = req.query;

  let filtered = testHistory;

  if (url) {
    filtered = filtered.filter(test => test.url === url);
  }

  if (limit) {
    filtered = filtered.slice(-parseInt(limit));
  }

  res.json(filtered);
});

// 获取测试摘要
app.get('/api/summaries', (req, res) => {
  const urls = [...new Set(testHistory.map(test => test.url))];
  const summaries = urls.map(url => {
    const urlTests = testHistory.filter(test => test.url === url);
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
        lastTestTime: urlTests[urlTests.length - 1]?.timestamp || new Date()
      };
    }

    const loadTimes = successfulTests.map(test => test.loadTime);
    const domContentLoadedTimes = successfulTests.map(test => test.domContentLoaded);
    const fcpTimes = successfulTests.map(test => test.firstContentfulPaint);
    const lcpTimes = successfulTests.map(test => test.largestContentfulPaint);

    return {
      url,
      avgLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      avgDomContentLoaded: domContentLoadedTimes.reduce((a, b) => a + b, 0) / domContentLoadedTimes.length,
      avgFirstContentfulPaint: fcpTimes.reduce((a, b) => a + b, 0) / fcpTimes.length,
      avgLargestContentfulPaint: lcpTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / lcpTimes.filter(t => t > 0).length || 0,
      testCount: urlTests.length,
      errorCount,
      lastTestTime: urlTests[urlTests.length - 1].timestamp
    };
  }).sort((a, b) => new Date(b.lastTestTime) - new Date(a.lastTestTime));

  res.json(summaries);
});

// 清除历史
app.delete('/api/history', (req, res) => {
  testHistory = [];
  res.json({ message: 'History cleared' });
});

// 导出数据
app.get('/api/export', (req, res) => {
  const summaries = urls.map(url => {
    const urlTests = testHistory.filter(test => test.url === url);
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
        lastTestTime: urlTests[urlTests.length - 1]?.timestamp || new Date()
      };
    }

    const loadTimes = successfulTests.map(test => test.loadTime);
    const domContentLoadedTimes = successfulTests.map(test => test.domContentLoaded);
    const fcpTimes = successfulTests.map(test => test.firstContentfulPaint);
    const lcpTimes = successfulTests.map(test => test.largestContentfulPaint);

    return {
      url,
      avgLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      avgDomContentLoaded: domContentLoadedTimes.reduce((a, b) => a + b, 0) / domContentLoadedTimes.length,
      avgFirstContentfulPaint: fcpTimes.reduce((a, b) => a + b, 0) / fcpTimes.length,
      avgLargestContentfulPaint: lcpTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / lcpTimes.filter(t => t > 0).length || 0,
      testCount: urlTests.length,
      errorCount,
      lastTestTime: urlTests[urlTests.length - 1].timestamp
    };
  });

  const exportData = {
    testHistory,
    summaries,
    exportTime: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="latency-test-results-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(exportData);
});

// 静态文件服务（为前端提供）
app.use(express.static(path.join(__dirname, 'dist')));

// 启动服务器
app.listen(port, async () => {
  console.log(`Latency test server running on port ${port}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/test-latency - Test single URL`);
  console.log(`  POST /api/test-multiple - Test multiple URLs`);
  console.log(`  GET /api/history - Get test history`);
  console.log(`  GET /api/summaries - Get test summaries`);
  console.log(`  DELETE /api/history - Clear history`);
  console.log(`  GET /api/export - Export data`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});