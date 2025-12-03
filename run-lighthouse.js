import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse performance audit...\n');
  
  let chrome;
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });
    
    console.log('Chrome launched on port:', chrome.port);
    
    // Run Lighthouse
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse('http://localhost:5000', options);
    
    // Save HTML report
    const reportHtml = runnerResult.report;
    fs.writeFileSync('./lighthouse-report.html', reportHtml);
    
    // Extract key metrics
    const lhr = runnerResult.lhr;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };
    
    console.log('📊 Lighthouse Audit Results:');
    console.log('================================');
    console.log(`Performance: ${scores.performance}/100`);
    console.log(`Accessibility: ${scores.accessibility}/100`);
    console.log(`Best Practices: ${scores.bestPractices}/100`);
    console.log(`SEO: ${scores.seo}/100`);
    console.log('================================');
    
    // Key metrics
    const metrics = lhr.audits;
    console.log('\n⚡ Key Performance Metrics:');
    if (metrics['first-contentful-paint']) {
      console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
    }
    if (metrics['largest-contentful-paint']) {
      console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
    }
    if (metrics['speed-index']) {
      console.log(`Speed Index: ${metrics['speed-index'].displayValue}`);
    }
    if (metrics['cumulative-layout-shift']) {
      console.log(`Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
    }
    
    console.log('\n📄 Full HTML report saved to: lighthouse-report.html');
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

runLighthouse();