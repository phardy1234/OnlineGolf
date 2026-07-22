/** Direct HTTP helpers for provisioning test data without going through the browser. */

export async function loginAndGetCookie(apiBaseUrl: string, email: string, password: string): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`)
  }
  const setCookie = res.headers.get('set-cookie')
  if (!setCookie) throw new Error('No set-cookie header returned from login response')
  return setCookie.split(';')[0]
}

export interface TestProductInput {
  name: string
  category: string
  brand: string
  price: number
  stock: number
  imageSeed: string
  description?: string
}

export async function createProductViaApi(
  apiBaseUrl: string,
  cookie: string,
  product: TestProductInput,
): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(product),
  })
  if (!res.ok) {
    throw new Error(`Failed to create test product "${product.name}": ${res.status} ${await res.text()}`)
  }
  const body = (await res.json()) as { product: { id: string } }
  return body.product.id
}

export async function deleteProductViaApi(apiBaseUrl: string, cookie: string, id: string): Promise<void> {
  await fetch(`${apiBaseUrl}/api/products/${id}`, { method: 'DELETE', headers: { Cookie: cookie } })
}
