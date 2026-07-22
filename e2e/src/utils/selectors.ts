import { By } from 'selenium-webdriver'

/** Common selectors shared across specs, based on the app's actual markup (no data-testid convention exists). */
export const Selectors = {
  formSuccess: By.css('.form-success'),
  formError: By.css('.form-error'),
  emptyState: By.css('.empty-state'),
  loadingSpinner: By.css('.loading-spinner'),

  navCart: By.css('.navbar__cart'),
  navLogIn: By.linkText('Log In'),
  navSignUp: By.linkText('Sign Up'),
  navLogOut: By.xpath("//button[normalize-space(text())='Log Out']"),
  navProfile: By.linkText('Profile'),
  navAdmin: By.linkText('Admin'),
  navContact: By.linkText('Contact Us'),

  categoryTile: (label: string) => By.xpath(`//a[contains(@class,'category-tile')][.//span[text()='${label}']]`),
  productCard: By.css('.product-card'),
  productCardAddButton: By.xpath(".//button[not(@disabled)][contains(text(),'Add to Cart')]"),

  cartItem: By.css('.cart-item'),
  cartItemIncrement: By.xpath(".//button[normalize-space(text())='+']"),
  cartItemDecrement: By.xpath(".//button[normalize-space(text())='−']"),
  cartItemRemove: By.xpath(".//button[normalize-space(text())='Remove']"),
  placeOrderButton: By.xpath("//button[contains(text(),'Place Order')]"),

  byId: (id: string) => By.id(id),
  buttonWithText: (text: string) => By.xpath(`//button[normalize-space(text())='${text}']`),
  linkWithText: (text: string) => By.xpath(`//a[normalize-space(text())='${text}']`),

  adminTableRowByName: (name: string) => By.xpath(`//table[contains(@class,'admin-table')]//tr[td[1][normalize-space(text())='${name}']]`),
}
