import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { createProductViaApi, deleteProductViaApi, loginAndGetCookie } from '../utils/apiHelpers.js'
import { Selectors } from '../utils/selectors.js'

const PRODUCT_NAME = 'E2E Test Profile Product'

describe('Customer profile', () => {
  let driver: WebDriver
  let productId: string
  let orderId: string
  const identities = loadIdentities()
  const { baseUrl, apiBaseUrl, customer, password } = identities

  beforeAll(async () => {
    const adminCookie = await loginAndGetCookie(apiBaseUrl, identities.admin.email, password)
    productId = await createProductViaApi(apiBaseUrl, adminCookie, {
      name: PRODUCT_NAME,
      category: 'irons',
      brand: 'E2E Brand',
      price: 9.99,
      stock: 2,
      imageSeed: 'e2e-profile-test',
    })

    // Place an order directly via the API — the checkout *flow* itself is covered by cart.spec.ts;
    // this spec only needs an existing order to verify the profile's order-history rendering.
    const customerCookie = await loginAndGetCookie(apiBaseUrl, customer.email, password)
    const res = await fetch(`${apiBaseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: JSON.stringify({
        items: [{ productId, name: PRODUCT_NAME, price: 9.99, quantity: 1, imageSeed: 'e2e-profile-test' }],
        total: 9.99,
      }),
    })
    const body = (await res.json()) as { order: { id: string } }
    orderId = body.order.id

    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
    const adminCookie = await loginAndGetCookie(apiBaseUrl, identities.admin.email, password)
    await deleteProductViaApi(apiBaseUrl, adminCookie, productId)
  })

  async function loginAsCustomer() {
    await driver.get(`${baseUrl}/login`)
    await driver.wait(until.elementLocated(Selectors.byId('email')), 10000)
    await driver.findElement(Selectors.byId('email')).sendKeys(customer.email)
    await driver.findElement(Selectors.byId('password')).sendKeys(password)
    await driver.findElement(Selectors.buttonWithText('Log In')).click()
    await driver.wait(until.urlIs(`${baseUrl}/`), 10000)
  }

  it('shows the previously placed order in order history', async () => {
    await loginAsCustomer()
    await driver.get(`${baseUrl}/profile`)
    await driver.wait(until.elementLocated(By.css('.order-history')), 10000)

    await driver.wait(async () => {
      const items = await driver.findElements(By.css('.order-list__item'))
      return items.length > 0
    }, 15000)

    const row = await driver.findElement(By.xpath(`//li[contains(@class,'order-list__item')][.//span[text()='${orderId}']]`))
    const status = await row.findElement(By.css('.order-status')).getText()
    expect(status.toLowerCase()).toBe('placed')
  })

  it('updates and saves profile details', async () => {
    await driver.get(`${baseUrl}/profile`)
    await driver.wait(until.elementLocated(Selectors.byId('displayName')), 10000)

    const phoneField = await driver.findElement(Selectors.byId('phone'))
    await phoneField.clear()
    await phoneField.sendKeys('01234 567890')

    const cityField = await driver.findElement(Selectors.byId('city'))
    await cityField.clear()
    await cityField.sendKeys('St Andrews')

    await driver.findElement(Selectors.buttonWithText('Save Changes')).click()

    await driver.wait(until.elementLocated(Selectors.formSuccess), 10000)
    expect(await driver.findElement(Selectors.formSuccess).getText()).toBe('Profile updated.')
    expect(await driver.findElement(Selectors.byId('city')).getAttribute('value')).toBe('St Andrews')
  })
})
