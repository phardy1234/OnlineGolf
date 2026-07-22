import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { Selectors } from '../utils/selectors.js'

describe('Contact page', () => {
  let driver: WebDriver
  const { baseUrl, customer } = loadIdentities()

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
  })

  it('blocks submission of an empty form via HTML5 validation', async () => {
    await driver.get(`${baseUrl}/contact`)
    await driver.wait(until.elementLocated(By.css('.contact-form')), 10000)

    await driver.findElement(By.xpath("//button[contains(text(),'Send Message')]")).click()

    const nameFieldIsValid = await driver.executeScript<boolean>(
      "return document.getElementById('name').validity.valid",
    )
    expect(nameFieldIsValid).toBe(false)
    // Still on the contact page — the native validation error blocked the submit handler.
    expect(await driver.getCurrentUrl()).toContain('/contact')
    expect(await driver.findElements(Selectors.formSuccess)).toHaveLength(0)
  })

  it('submits successfully with valid data', async () => {
    await driver.get(`${baseUrl}/contact`)
    await driver.wait(until.elementLocated(Selectors.byId('name')), 10000)

    await driver.findElement(Selectors.byId('name')).sendKeys('E2E Test Suite')
    await driver.findElement(Selectors.byId('email')).sendKeys(customer.email)
    await driver.findElement(Selectors.byId('message')).sendKeys('Automated E2E contact form submission.')
    await driver.findElement(By.xpath("//button[contains(text(),'Send Message')]")).click()

    await driver.wait(until.elementLocated(Selectors.formSuccess), 15000)
    const message = await driver.findElement(Selectors.formSuccess).getText()
    expect(message).toContain("Thanks — your message has been sent")
    expect(await driver.findElements(By.css('.contact-form'))).toHaveLength(0)
  })
})
