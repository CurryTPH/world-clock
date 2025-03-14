/**
 * Memory Profiler Script
 * 
 * This script helps identify memory leaks and track memory usage
 * in the World Clock application. Run with:
 * 
 * npm run profile:memory
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration options
const CONFIG = {
  url: 'http://localhost:3000',
  iterations: 5,
  actionsPerIteration: 10,
  memorySnapshotInterval: 2,
  outputDir: './memory-profiles',
  headless: false,
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Get timestamp for filenames
function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// Save memory snapshot to file
async function saveMemorySnapshot(page, iteration, actionIndex) {
  // Force garbage collection if possible
  try {
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
  } catch (error) {
    console.log('Note: garbage collection not available in this environment');
  }
  
  // Get memory info
  const memoryInfo = await page.evaluate(() => {
    return {
      jsHeapSizeLimit: performance.memory?.jsHeapSizeLimit,
      totalJSHeapSize: performance.memory?.totalJSHeapSize,
      usedJSHeapSize: performance.memory?.usedJSHeapSize,
    };
  });
  
  // Log current memory usage
  console.log(`Iteration ${iteration}, Action ${actionIndex}:`);
  console.log(`  Heap Size Limit: ${formatBytes(memoryInfo.jsHeapSizeLimit)}`);
  console.log(`  Total Heap Size: ${formatBytes(memoryInfo.totalJSHeapSize)}`);
  console.log(`  Used Heap Size: ${formatBytes(memoryInfo.usedJSHeapSize)}`);
  
  // Take a heap snapshot
  const client = await page.target().createCDPSession();
  await client.send('HeapProfiler.enable');
  const { profile } = await client.send('HeapProfiler.takeHeapSnapshot', {
    reportProgress: false,
  });
  
  // Save the snapshot to file
  const fileName = `memory-snapshot-${iteration}-${actionIndex}-${getTimestamp()}.heapsnapshot`;
  fs.writeFileSync(path.join(CONFIG.outputDir, fileName), JSON.stringify(profile));
  console.log(`Saved heap snapshot to ${fileName}`);
  
  await client.send('HeapProfiler.disable');
  
  return memoryInfo;
}

// Perform a series of random user actions
async function performRandomActions(page, iteration, count) {
  const memoryData = [];
  
  const actions = [
    // Add a timezone
    async () => {
      await page.click('button:has-text("Add Timezone")');
      await page.waitForTimeout(500);
      await page.keyboard.type('Tokyo');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    },
    
    // Remove a timezone
    async () => {
      const removeButtons = await page.$$('.timezone-card button[aria-label="Remove"]');
      if (removeButtons.length > 0) {
        await removeButtons[Math.floor(Math.random() * removeButtons.length)].click();
        await page.waitForTimeout(1000);
      }
    },
    
    // Toggle settings panel
    async () => {
      await page.click('button[aria-label="Settings"]');
      await page.waitForTimeout(1000);
      await page.click('button[aria-label="Close Settings"]');
      await page.waitForTimeout(500);
    },
    
    // Change view mode
    async () => {
      const viewButtons = await page.$$('button[aria-label*="view"]');
      if (viewButtons.length > 0) {
        await viewButtons[Math.floor(Math.random() * viewButtons.length)].click();
        await page.waitForTimeout(1000);
      }
    },
    
    // Scroll down and up
    async () => {
      await page.evaluate(() => {
        window.scrollTo(0, 1000);
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
    },
  ];
  
  for (let i = 0; i < count; i++) {
    // Choose a random action
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    // Perform the action
    try {
      await action();
      console.log(`Performed action ${i + 1}/${count} in iteration ${iteration}`);
    } catch (error) {
      console.error(`Error performing action: ${error.message}`);
    }
    
    // Take memory snapshot at intervals
    if (i % CONFIG.memorySnapshotInterval === 0) {
      const snapshot = await saveMemorySnapshot(page, iteration, i);
      memoryData.push({
        iteration,
        action: i,
        ...snapshot,
      });
    }
  }
  
  return memoryData;
}

// Main function to run the memory profile
async function runMemoryProfile() {
  console.log('Starting memory profiling session...');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    defaultViewport: null,
    args: ['--js-flags=--expose-gc'],
  });
  
  const page = await browser.newPage();
  let allMemoryData = [];
  
  try {
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.performance.setResourceTimingBufferSize(500);
    });
    
    for (let i = 1; i <= CONFIG.iterations; i++) {
      console.log(`\n--- Starting iteration ${i}/${CONFIG.iterations} ---`);
      
      // Navigate to the app
      await page.goto(CONFIG.url, { waitUntil: 'networkidle2' });
      
      // Wait for the app to be fully loaded
      await page.waitForSelector('.world-clock-container', { timeout: 5000 });
      
      // Take initial memory snapshot
      await saveMemorySnapshot(page, i, 0);
      
      // Perform random actions
      const iterationMemoryData = await performRandomActions(page, i, CONFIG.actionsPerIteration);
      allMemoryData = [...allMemoryData, ...iterationMemoryData];
      
      // Take final snapshot for this iteration
      await saveMemorySnapshot(page, i, CONFIG.actionsPerIteration);
      
      // Clear session storage and cookies between iterations
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.deleteCookie();
    }
    
    // Save memory data to JSON file
    const memoryDataFile = path.join(CONFIG.outputDir, `memory-data-${getTimestamp()}.json`);
    fs.writeFileSync(memoryDataFile, JSON.stringify(allMemoryData, null, 2));
    console.log(`\nMemory profile data saved to ${memoryDataFile}`);
    
    // Generate a simple HTML report
    const reportFile = path.join(CONFIG.outputDir, `memory-report-${getTimestamp()}.html`);
    const reportContent = generateHtmlReport(allMemoryData);
    fs.writeFileSync(reportFile, reportContent);
    console.log(`Memory profile report saved to ${reportFile}`);
    
  } catch (error) {
    console.error('Error during memory profiling:', error);
  } finally {
    await browser.close();
    console.log('\nMemory profiling completed');
  }
}

// Generate HTML report from memory data
function generateHtmlReport(memoryData) {
  const timestamps = memoryData.map((d, i) => i);
  const usedHeapData = memoryData.map(d => d.usedJSHeapSize / (1024 * 1024)); // Convert to MB
  const totalHeapData = memoryData.map(d => d.totalJSHeapSize / (1024 * 1024)); // Convert to MB
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Memory Profile Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .chart-container { height: 400px; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Memory Profile Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    
    <h2>Memory Usage Over Time</h2>
    <div class="chart-container">
      <canvas id="memoryChart"></canvas>
    </div>
    
    <h2>Raw Data</h2>
    <table>
      <tr>
        <th>Iteration</th>
        <th>Action</th>
        <th>Used Heap (MB)</th>
        <th>Total Heap (MB)</th>
      </tr>
      ${memoryData.map(d => `
        <tr>
          <td>${d.iteration}</td>
          <td>${d.action}</td>
          <td>${(d.usedJSHeapSize / (1024 * 1024)).toFixed(2)}</td>
          <td>${(d.totalJSHeapSize / (1024 * 1024)).toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <script>
    const ctx = document.getElementById('memoryChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(timestamps)},
        datasets: [
          {
            label: 'Used JS Heap (MB)',
            data: ${JSON.stringify(usedHeapData)},
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: true,
          },
          {
            label: 'Total JS Heap (MB)',
            data: ${JSON.stringify(totalHeapData)},
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Memory Usage Over Actions'
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Memory (MB)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Action Number'
            }
          }
        }
      }
    });
  </script>
</body>
</html>
  `;
}

// Run the profiler
runMemoryProfile().catch(console.error); 