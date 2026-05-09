'use strict'

const CART_STORAGE_KEY = 'guitarShopCart'
const cartItemsContainer = document.getElementById('cart-items')
const totalSumElement = document.getElementById('total-sum')
const emptyCartMessage = document.getElementById('empty-cart-message')
const cartCountElements = document.querySelectorAll('#cart-count')
const checkoutButton = document.getElementById('checkout-btn')

let cart = loadCartFromStorage()
updateCartPage()

function loadCartFromStorage() {
  const saved = localStorage.getItem(CART_STORAGE_KEY)
  if (!saved) return []
  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.map(item => ({ ...item, quantity: item.quantity || 1 }))
  } catch {
    return []
  }
}

function saveCartToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

function updateCartCount() {
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
  cartCountElements.forEach(el => el.innerText = totalCount)
  saveCartToStorage()
}

function updateCartPage() {
  updateCartCount()

  if (!cart.length) {
    cartItemsContainer.innerHTML = ''
    totalSumElement.innerText = '0 ₽'
    emptyCartMessage.style.display = 'block'
    checkoutButton.disabled = true
    checkoutButton.style.opacity = '0.6'
    return
  }

  emptyCartMessage.style.display = 'none'
  checkoutButton.disabled = false
  checkoutButton.style.opacity = '1'
  renderCartItems()
  updateTotalSum()
}

function renderCartItems() {
  cartItemsContainer.innerHTML = ''

  cart.forEach(item => {
    const itemRow = document.createElement('div')
    itemRow.className = 'cart-item'

    const imageWrapper = document.createElement('div')
    imageWrapper.className = 'cart-item-image'
    const img = document.createElement('img')
    img.src = './images/' + (item.data.images?.[0] || '')
    img.alt = item.name
    imageWrapper.append(img)

    const details = document.createElement('div')
    details.className = 'cart-item-details'
    const title = document.createElement('h4')
    title.innerText = item.name
    const meta = document.createElement('div')
    meta.className = 'cart-item-meta'
    meta.innerText = `Цена: ${item.data.price.toLocaleString('ru-RU')} ₽ · В наличии: ${item.data.type}`
    details.append(title, meta)

    const actions = document.createElement('div')
    actions.className = 'cart-item-actions'

    const qtyControls = document.createElement('div')
    qtyControls.className = 'item-qty-controls'

    const minus = document.createElement('button')
    minus.type = 'button'
    minus.className = 'qty-btn'
    minus.innerText = '-'
    minus.onclick = () => changeItemQuantity(item.name, item.quantity - 1)

    const qtySpan = document.createElement('span')
    qtySpan.className = 'qty-value'
    qtySpan.innerText = item.quantity

    const plus = document.createElement('button')
    plus.type = 'button'
    plus.className = 'qty-btn'
    plus.innerText = '+'
    plus.onclick = () => changeItemQuantity(item.name, item.quantity + 1)

    qtyControls.append(minus, qtySpan, plus)

    const subtotal = document.createElement('div')
    subtotal.className = 'item-subtotal'
    subtotal.innerText = `Сумма: ${(item.data.price * item.quantity).toLocaleString('ru-RU')} ₽`

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'remove-from-cart-btn'
    removeButton.innerText = 'Удалить'
    removeButton.onclick = () => removeCartItem(item.name)

    actions.append(qtyControls, subtotal, removeButton)
    itemRow.append(imageWrapper, details, actions)
    cartItemsContainer.append(itemRow)
  })
}

function updateTotalSum() {
  const total = cart.reduce((sum, item) => sum + item.data.price * item.quantity, 0)
  totalSumElement.innerText = `${total.toLocaleString('ru-RU')} ₽`
}

function changeItemQuantity(guitarName, quantity) {
  if (quantity < 1) {
    removeCartItem(guitarName)
    return
  }

  const existing = cart.find(item => item.name === guitarName)
  if (existing) {
    existing.quantity = quantity
    saveCartToStorage()
    updateCartPage()
  }
}

function removeCartItem(guitarName) {
  cart = cart.filter(item => item.name !== guitarName)
  saveCartToStorage()
  updateCartPage()
}

checkoutButton.addEventListener('click', () => {
  if (!cart.length) return
  alert(`Спасибо за заказ! Общая сумма: ${totalSumElement.innerText}`)
  cart = []
  saveCartToStorage()
  updateCartPage()
})
