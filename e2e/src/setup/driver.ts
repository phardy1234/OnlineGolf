import { Builder, until, type WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

export async function buildDriver(): Promise<WebDriver> {
  const options = new chrome.Options()
  if (process.env.E2E_HEADLESS !== 'false') {
    options.addArguments('--headless=new')
  }
  options.addArguments('--window-size=1440,1000', '--disable-gpu')

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 20000 })
  return driver
}

export async function quitDriver(driver: WebDriver | undefined): Promise<void> {
  if (driver) await driver.quit()
}

/** Waits for and accepts a native `confirm()`/`alert()` dialog. */
export async function acceptAlert(driver: WebDriver): Promise<string> {
  await driver.wait(until.alertIsPresent(), 5000)
  const alert = await driver.switchTo().alert()
  const text = await alert.getText()
  await alert.accept()
  return text
}
