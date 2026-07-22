import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { Selectors } from '../utils/selectors.js'

describe('Signup, login, and logout', () => {
  let driver: WebDriver
  const { baseUrl } = loadIdentities()
  const runId = Date.now()
  const email = `e2e-authflow-${runId}@example.com`
  const password = 'e2e-Test-Pass1'

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
  })

  it('rejects a signup password shorter than 6 characters via HTML5 validation', async () => {
    await driver.get(`${baseUrl}/signup`)
    await driver.wait(until.elementLocated(By.css('.auth-form')), 10000)

    await driver.findElement(Selectors.byId('displayName')).sendKeys('Too Short')
    await driver.findElement(Selectors.byId('email')).sendKeys(`e2e-shortpass-${runId}@example.com`)
    await driver.findElement(Selectors.byId('password')).sendKeys('123')
    await driver.findElement(Selectors.buttonWithText('Sign Up')).click()

    expect(await driver.getCurrentUrl()).toContain('/signup')
  })

  it('signs up successfully and logs the user in', async () => {
    await driver.get(`${baseUrl}/signup`)
    await driver.wait(until.elementLocated(Selectors.byId('displayName')), 10000)

    await driver.findElement(Selectors.byId('displayName')).sendKeys('E2E Auth Flow')
    await driver.findElement(Selectors.byId('email')).sendKeys(email)
    await driver.findElement(Selectors.byId('password')).sendKeys(password)
    await driver.findElement(Selectors.buttonWithText('Sign Up')).click()

    await driver.wait(until.urlIs(`${baseUrl}/`), 10000)
    await driver.wait(until.elementLocated(Selectors.navProfile), 10000)
  })

  it('logs out and shows the logged-out nav links', async () => {
    await driver.findElement(Selectors.navLogOut).click()
    await driver.wait(until.elementLocated(Selectors.navLogIn), 10000)
    expect(await driver.findElements(Selectors.navProfile)).toHaveLength(0)
  })

  it('rejects login with an incorrect password', async () => {
    await driver.get(`${baseUrl}/login`)
    await driver.wait(until.elementLocated(Selectors.byId('email')), 10000)

    await driver.findElement(Selectors.byId('email')).sendKeys(email)
    await driver.findElement(Selectors.byId('password')).sendKeys('wrong-password')
    await driver.findElement(Selectors.buttonWithText('Log In')).click()

    await driver.wait(until.elementLocated(Selectors.formError), 10000)
    expect(await driver.getCurrentUrl()).toContain('/login')
  })

  it('logs in successfully with correct credentials', async () => {
    await driver.get(`${baseUrl}/login`)
    await driver.wait(until.elementLocated(Selectors.byId('email')), 10000)

    await driver.findElement(Selectors.byId('email')).sendKeys(email)
    await driver.findElement(Selectors.byId('password')).sendKeys(password)
    await driver.findElement(Selectors.buttonWithText('Log In')).click()

    await driver.wait(until.urlIs(`${baseUrl}/`), 10000)
    await driver.wait(until.elementLocated(Selectors.navProfile), 10000)

    await driver.findElement(Selectors.navLogOut).click()
    await driver.wait(until.elementLocated(Selectors.navLogIn), 10000)
  })

  it('redirects logged-out users away from protected routes', async () => {
    await driver.get(`${baseUrl}/profile`)
    await driver.wait(until.urlContains('/login'), 10000)

    await driver.get(`${baseUrl}/admin`)
    await driver.wait(until.urlContains('/login'), 10000)
  })
})
