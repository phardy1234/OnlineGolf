import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { createProductViaApi, deleteProductViaApi, loginAndGetCookie } from '../utils/apiHelpers.js'
import { Selectors } from '../utils/selectors.js'

const PRODUCT_NAME = 'E2E Test Cart Product'

function productCard(name: string) {
  return By.xpath(
    `//article[contains(@class,'product-card')][.//h3[contains(@class,'product-card__name')][text()='${name}']]`,
  )
}

async function cartCountText(driver: WebDriver) {
  return driver.findElement(Selectors.navCart).getText()
}

describe('Cart and checkout', () => {
  let driver: WebDriver
  let productId: string
  const identities = loadIdentities()
  const { baseUrl, apiBaseUrl, customer, password } = identities

  beforeAll(async () => {
    const adminCookie = await loginAndGetCookie(apiBaseUrl, identities.admin.email, password)
    productId = await createProductViaApi(apiBaseUrl, adminCookie, {
      name: PRODUCT_NAME,
      category: 'drivers',
      brand: 'E2E Brand',
      price: 19.99,
      stock: 5,
      imageSeed: 'e2e-cart-test',
      description: 'Provisioned by the E2E suite for cart tests.',
    })
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
    const adminCookie = await loginAndGetCookie(apiBaseUrl, identities.admin.email, password)
    await deleteProductViaApi(apiBaseUrl, adminCookie, productId)
  })

  it('lets a guest add the product to the cart', async () => {
    await driver.get(`${baseUrl}/category/drivers`)
    await driver.wait(until.elementLocated(productCard(PRODUCT_NAME)), 15000)

    const card = await driver.findElement(productCard(PRODUCT_NAME))
    await card.findElement(By.xpath(".//button[contains(text(),'Add to Cart')]")).click()

    await driver.wait(async () => (await cartCountText(driver)) === 'Cart (1)', 5000)
  })

  it('allows adjusting quantity in the cart', async () => {
    await driver.get(`${baseUrl}/cart`)
    await driver.wait(until.elementLocated(Selectors.cartItem), 10000)

    const row = await driver.findElement(Selectors.cartItem)
    await row.findElement(Selectors.cartItemIncrement).click()
    await driver.wait(async () => (await cartCountText(driver)) === 'Cart (2)', 5000)

    await row.findElement(Selectors.cartItemDecrement).click()
    await driver.wait(async () => (await cartCountText(driver)) === 'Cart (1)', 5000)
  })

  it('redirects a guest to the login page when placing an order', async () => {
    await driver.get(`${baseUrl}/cart`)
    await driver.wait(until.elementLocated(Selectors.placeOrderButton), 10000)
    await driver.findElement(Selectors.placeOrderButton).click()

    await driver.wait(until.urlContains('/login'), 10000)
  })

  it('places the order once logged in and clears the cart', async () => {
    await driver.findElement(Selectors.byId('email')).sendKeys(customer.email)
    await driver.findElement(Selectors.byId('password')).sendKeys(password)
    await driver.findElement(Selectors.buttonWithText('Log In')).click()

    // LoginPage redirects back to the page the user came from (the cart).
    await driver.wait(until.urlContains('/cart'), 10000)
    await driver.wait(until.elementLocated(Selectors.placeOrderButton), 10000)
    await driver.findElement(Selectors.placeOrderButton).click()

    await driver.wait(until.elementLocated(By.xpath("//h1[text()='Order Placed']")), 15000)
    const confirmation = await driver.findElement(Selectors.formSuccess).getText()
    expect(confirmation).toContain('demo order')

    await driver.wait(async () => (await cartCountText(driver)) === 'Cart', 5000)
  })
})
