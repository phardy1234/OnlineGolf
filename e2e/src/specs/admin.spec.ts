import { By, until, type WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { acceptAlert, buildDriver, quitDriver } from '../setup/driver.js'
import { loadIdentities } from '../setup/testIdentities.js'
import { Selectors } from '../utils/selectors.js'

const PRODUCT_NAME = 'E2E Test Admin Product'

function adminRow(name: string) {
  return Selectors.adminTableRowByName(name)
}

async function login(driver: WebDriver, baseUrl: string, email: string, password: string) {
  await driver.get(`${baseUrl}/login`)
  await driver.wait(until.elementLocated(Selectors.byId('email')), 10000)
  await driver.findElement(Selectors.byId('email')).sendKeys(email)
  await driver.findElement(Selectors.byId('password')).sendKeys(password)
  await driver.findElement(Selectors.buttonWithText('Log In')).click()
  await driver.wait(until.urlIs(`${baseUrl}/`), 10000)
}

async function logout(driver: WebDriver) {
  await driver.findElement(Selectors.navLogOut).click()
  await driver.wait(until.elementLocated(Selectors.navLogIn), 10000)
}

describe('Admin product management', () => {
  let driver: WebDriver
  const { baseUrl, admin, customer, password } = loadIdentities()

  beforeAll(async () => {
    driver = await buildDriver()
  })

  afterAll(async () => {
    await quitDriver(driver)
  })

  it('redirects a logged-in non-admin customer away from /admin', async () => {
    await login(driver, baseUrl, customer.email, password)
    await driver.get(`${baseUrl}/admin`)
    await driver.wait(until.urlIs(`${baseUrl}/`), 10000)
    await logout(driver)
  })

  it('lets an admin create, edit, and delete a product', async () => {
    await login(driver, baseUrl, admin.email, password)
    await driver.get(`${baseUrl}/admin`)
    await driver.wait(until.elementLocated(By.css('.admin-form')), 10000)

    await driver.findElement(Selectors.byId('name')).sendKeys(PRODUCT_NAME)
    await driver.findElement(Selectors.byId('brand')).sendKeys('E2E Brand')
    const priceField = await driver.findElement(Selectors.byId('price'))
    await priceField.clear()
    await priceField.sendKeys('49.99')
    const stockField = await driver.findElement(Selectors.byId('stock'))
    await stockField.clear()
    await stockField.sendKeys('3')
    await driver.findElement(Selectors.byId('imageSeed')).sendKeys('e2e-admin-test')
    await driver.findElement(Selectors.byId('description')).sendKeys('Created by the E2E suite.')
    await driver.findElement(Selectors.buttonWithText('Add Product')).click()

    await driver.wait(until.elementLocated(adminRow(PRODUCT_NAME)), 15000)

    // Edit: bump the price and confirm the table reflects it.
    const row = await driver.findElement(adminRow(PRODUCT_NAME))
    await row.findElement(By.xpath(".//button[text()='Edit']")).click()

    await driver.wait(until.elementLocated(By.xpath("//h2[text()='Edit Product']")), 10000)
    const editingPriceField = await driver.findElement(Selectors.byId('price'))
    expect(await editingPriceField.getAttribute('value')).toBe('49.99')
    await editingPriceField.clear()
    await editingPriceField.sendKeys('59.99')
    await driver.findElement(Selectors.buttonWithText('Update Product')).click()

    await driver.wait(async () => {
      const updatedRow = await driver.findElement(adminRow(PRODUCT_NAME))
      return (await updatedRow.getText()).includes('59.99')
    }, 15000)

    // Delete: dismiss the native confirm() dialog and confirm the row disappears.
    const rowToDelete = await driver.findElement(adminRow(PRODUCT_NAME))
    await rowToDelete.findElement(By.xpath(".//button[text()='Delete']")).click()
    const alertText = await acceptAlert(driver)
    expect(alertText).toBe('Delete this product?')

    await driver.wait(async () => (await driver.findElements(adminRow(PRODUCT_NAME))).length === 0, 15000)
  })
})
