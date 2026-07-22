import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { Selectors } from '../utils/selectors.js'

const CATEGORY_LABELS = ['Drivers', 'Fairway Woods', 'Irons', 'Wedges', 'Putters', 'Golf Balls']

describe('Home page', () => {
  let driver: WebDriver
  const { baseUrl } = loadIdentities()

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
  })

  it('renders the hero banner and all category tiles', async () => {
    await driver.get(baseUrl)
    await driver.wait(until.elementLocated(By.css('.hero-banner')), 10000)

    const heading = await driver.findElement(By.css('.hero-banner h1')).getText()
    expect(heading).toBe('Gear up for your best round yet')

    for (const label of CATEGORY_LABELS) {
      const tiles = await driver.findElements(Selectors.categoryTile(label))
      expect(tiles.length, `expected a category tile for "${label}"`).toBe(1)
    }
  })

  it('navigates to a category page when a tile is clicked', async () => {
    await driver.get(baseUrl)
    await driver.wait(until.elementLocated(Selectors.categoryTile('Drivers')), 10000)
    await driver.findElement(Selectors.categoryTile('Drivers')).click()

    await driver.wait(until.urlContains('/category/drivers'), 10000)
    await driver.wait(until.elementLocated(By.css('.category-page h1')), 10000)
    const heading = await driver.findElement(By.css('.category-page h1')).getText()
    expect(heading).toBe('Drivers')
  })
})
