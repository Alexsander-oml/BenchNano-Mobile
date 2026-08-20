const fs = require('node:fs/promises');
const { chromium } = require('playwright');

const baseUrl = process.env.BENCHNANO_URL || 'http://127.0.0.1:8000/src/index.html';
const outputDir = 'screenshots';

async function captureModule(page, moduleName, fileName) {
  await page.evaluate(() => window.closeSheet());
  await page.locator('button[title="Settings"]').click();
  await page.locator('#settingsRoot').getByText(moduleName, { exact: true }).click();
  await page.screenshot({
    path: `${outputDir}/${fileName}.png`,
    fullPage: true
  });
}

(async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${outputDir}/home.png`, fullPage: true });

  await page.locator('.zoom-chip[data-v="200"]').click();
  await page.screenshot({ path: `${outputDir}/home-zoom-200.png`, fullPage: true });

  await captureModule(page, 'Camera Settings', 'camera-settings');
  await captureModule(page, 'Optical Characterization', 'optical-characterization');
  await captureModule(page, 'System Monitoring', 'system-monitoring');
  await captureModule(page, 'Segmentation', 'segmentation');
  await captureModule(page, 'Fluidic Acquisition', 'fluidic-acquisition');
  await captureModule(page, 'Sample', 'sample');

  await page.evaluate(() => window.closeSheet());
  await page.locator('.thumb-btn').click();
  await page.screenshot({ path: `${outputDir}/gallery.png`, fullPage: true });

  await browser.close();
  console.log(`Screenshots saved to ${outputDir}/`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
