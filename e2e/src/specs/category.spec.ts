import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { Selectors } from '../utils/selectors.js'

describe('Category page', () => {
  let driver: WebDriver
  const { baseUrl } = loadIdentities()

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
  })

  it('shows a product grid or an empty state for a known category', async () => {
    await driver.get(`${baseUrl}/category/drivers`)
    await driver.wait(until.elementLocated(By.css('.category-page h1')), 10000)
    expect(await driver.findElement(By.css('.category-page h1')).getText()).toBe('Drivers')

    // Loading spinner must resolve to either a grid of products or the "no products" empty state.
    await driver.wait(async () => {
      const grid = await driver.findElements(By.css('.product-grid'))
      const empty = await driver.findElements(Selectors.emptyState)
      return grid.length > 0 || empty.length > 0
    }, 15000)
  })

  it('shows "Unknown category." for a category that does not exist', async () => {
    await driver.get(`${baseUrl}/category/not-a-real-category`)
    await driver.wait(until.elementLocated(Selectors.emptyState), 10000)
    expect(await driver.findElement(Selectors.emptyState).getText()).toBe('Unknown category.')
  })
})
