'use strict'

const catalog = document.getElementById('catalog')
const searchInput = document.getElementById('search-input')
const filterType = document.getElementById('filter-type')
const filterBrand = document.getElementById('filter-brand')
const sortSelect = document.getElementById('sort-order')
const cartCount = document.getElementById('cart-count')
let allProducts = {}
const STORAGE_KEY = 'guitarShopCart'
let cart = loadCartFromStorage()

updateCartCount()
fetch("./data/products.json").then(uploadProducts)

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (!savedCart) return []
    try {
        const parsed = JSON.parse(savedCart)
        if (!Array.isArray(parsed)) return []
        return parsed.map(item => ({ ...item, quantity: item.quantity || 1 }))
    } catch {
        return []
    }
}

function saveCartToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
    cartCount.innerText = total
    saveCartToStorage()
}

function setCartItemQuantity(guitarName, guitarData, quantity) {
    if (quantity < 1) {
        cart = cart.filter(item => item.name !== guitarName)
        updateCartCount()
        return 0
    }

    const existingItem = cart.find(item => item.name === guitarName)
    if (existingItem) {
        existingItem.quantity = quantity
    } else {
        cart.push({name: guitarName, data: guitarData, quantity})
    }

    updateCartCount()
    return quantity
}

function uploadProducts(data){
    data.json().then(getProducts)
}

function getProducts(products){
    allProducts = products
    populateFilterOptions(products)
    applyCatalogFilters()
    setupSearchAndFilters()
}

function renderCatalog(products) {
    catalog.innerHTML = ''
    if (!Object.keys(products).length) {
        const emptyMessage = document.createElement('p')
        emptyMessage.className = 'catalog-empty'
        emptyMessage.innerText = 'Товары по заданным фильтрам не найдены.'
        catalog.append(emptyMessage)
        return
    }

    for (let guitarName in products){
        const guitarData = products[guitarName]
        const guitarCard = getProductCard(guitarName, guitarData)
        catalog.append(guitarCard)
    }
}

function setupSearchAndFilters() {
    const apply = () => applyCatalogFilters()
    searchInput.addEventListener('input', apply)
    filterType.addEventListener('change', apply)
    filterBrand.addEventListener('change', apply)
    sortSelect.addEventListener('change', apply)
}

function applyCatalogFilters() {
    const query = searchInput.value.trim().toLowerCase()
    const typeValue = filterType.value
    const brandValue = filterBrand.value
    const sortValue = sortSelect.value

    const filteredEntries = Object.entries(allProducts).filter(([guitarName, guitarData]) => {
        const matchesSearch = guitarName.toLowerCase().includes(query)
        const matchesType = typeValue === 'all' || guitarData.type === typeValue
        const matchesBrand = brandValue === 'all' || guitarData.brand === brandValue
        return matchesSearch && matchesType && matchesBrand
    })

    const sortedEntries = filteredEntries.sort((a, b) => {
        const [nameA, dataA] = a
        const [nameB, dataB] = b
        if (sortValue === 'price-asc') {
            return dataA.price - dataB.price
        }
        if (sortValue === 'price-desc') {
            return dataB.price - dataA.price
        }
        if (sortValue === 'name-desc') {
            return nameB.localeCompare(nameA, 'ru')
        }
        return nameA.localeCompare(nameB, 'ru')
    })

    renderCatalog(Object.fromEntries(sortedEntries))
}

function populateFilterOptions(products) {
    const types = new Set()
    const brands = new Set()

    for (let guitarName in products) {
        types.add(products[guitarName].type)
        brands.add(products[guitarName].brand)
    }

    types.forEach(type => {
        const option = document.createElement('option')
        option.value = type
        option.innerText = type
        filterType.append(option)
    })

    brands.forEach(brand => {
        const option = document.createElement('option')
        option.value = brand
        option.innerText = brand
        filterBrand.append(option)
    })
}

function getProductCard(guitarName, guitarData) {

    const guitarCard = document.createElement('div')
    guitarCard.className = "guitar-card"

    const cardTitle = document.createElement('h4')
    cardTitle.innerText = guitarName
    guitarCard.append(cardTitle) 

    const cardImagesSlider = getImagesSlider(guitarData.images)
    guitarCard.append(cardImagesSlider)

    const descriptionDiv = getDescriptionDiv(guitarData)
    guitarCard.append(descriptionDiv)

    const orderBlock = document.createElement('div')
    orderBlock.className = 'order-block'
    orderBlock.style.display = 'none'

    let pendingQuantity = 1
    const qtyControls = document.createElement('div')
    qtyControls.className = 'qty-controls'

    const minusButton = document.createElement('button')
    minusButton.type = 'button'
    minusButton.className = 'qty-btn'
    minusButton.innerText = '-'

    const qtyValue = document.createElement('span')
    qtyValue.className = 'qty-value'
    qtyValue.innerText = pendingQuantity

    const plusButton = document.createElement('button')
    plusButton.type = 'button'
    plusButton.className = 'qty-btn'
    plusButton.innerText = '+'

    minusButton.onclick = () => {
        if (pendingQuantity > 1) {
            pendingQuantity -= 1
            qtyValue.innerText = pendingQuantity
        }
    }

    plusButton.onclick = () => {
        pendingQuantity += 1
        qtyValue.innerText = pendingQuantity
    }

    qtyControls.append(minusButton, qtyValue, plusButton)
    orderBlock.append(qtyControls)

    const confirmButton = document.createElement('button')
    confirmButton.type = 'button'
    confirmButton.className = 'add-to-cart-btn'
    confirmButton.innerText = 'Добавить ещё'
    confirmButton.onclick = () => {
        addToCart(guitarName, guitarData, pendingQuantity, cardCount)
        addedBadge.style.display = 'inline-flex'
        setTimeout(() => {
            addedBadge.style.display = 'none'
        }, 1500)
        pendingQuantity = 1
        qtyValue.innerText = pendingQuantity
    }

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'remove-from-cart-btn'
    removeButton.innerText = 'Удалить из корзины'
    removeButton.onclick = () => {
        setCartItemQuantity(guitarName, guitarData, 0)
        cardCount.style.display = 'none'
        orderBlock.style.display = 'none'
        buttonDiv.style.display = 'block'
    }

    orderBlock.append(confirmButton, removeButton)
    guitarCard.append(orderBlock)

    const cardCount = document.createElement('div')
    cardCount.className = 'card-count'
    cardCount.style.display = 'none'
    guitarCard.append(cardCount)

    const buttonDiv = document.createElement('div')
    buttonDiv.className = 'card-buttons'
    const addButton = document.createElement('button')
    addButton.innerText = 'Добавить в корзину'
    addButton.className = 'add-to-cart-btn'

    const addedBadge = document.createElement('span')
    addedBadge.className = 'added-badge'
    addedBadge.innerText = '+1'
    addedBadge.style.display = 'none'

    const existingCartItem = cart.find(item => item.name === guitarName)
    if (existingCartItem) {
        cardCount.innerText = `В корзине: ${existingCartItem.quantity}`
        cardCount.style.display = 'block'
        orderBlock.style.display = 'flex'
        buttonDiv.style.display = 'none'
    }

    addButton.onclick = () => {
        addToCart(guitarName, guitarData, 1, cardCount)
        orderBlock.style.display = 'flex'
        buttonDiv.style.display = 'none'
        addedBadge.style.display = 'inline-flex'
        setTimeout(() => {
            addedBadge.style.display = 'none'
        }, 1500)
        pendingQuantity = 1
        qtyValue.innerText = pendingQuantity
    }

    buttonDiv.append(addButton)
    guitarCard.append(buttonDiv)
    guitarCard.append(addedBadge)

    return guitarCard
}

function getImagesSlider(imagesList) {

    const imagesSlider = document.createElement('div')
    imagesSlider.className = 'slider-wrapper'
    
    for(let i=0; i < imagesList.length; i++) {
        const img = new Image()
        img.src = './images/' + imagesList[i]
        img.className = "slide"
        if (i === 0) img.classList.add('visible')
        imagesSlider.append(img)
    }
    
    if (imagesList.length > 1) {
        const arrowForward = new Image()
        arrowForward.src = './images/left_arrow.png'
        arrowForward.className = "arrow forward"
        arrowForward.onclick = () => showForwardImage(imagesSlider)
        imagesSlider.append(arrowForward)

        const arrowBack = new Image()
        arrowBack.src='./images/right_arrow.png'
        arrowBack.className = "arrow back"
        arrowBack.onclick = () => showBackImage(imagesSlider)
        imagesSlider.append(arrowBack)
        
    }

    return imagesSlider
}

function showBackImage(slider) {
    const images = slider.querySelectorAll('.slide')
    let index = 0
    while (index < images.length) {
        if(images [index].classList.contains('visible')) {
            images [index].classList.remove('visible')
            if (index > 0) {
                images [index - 1].classList.add('visible')
                } 
            else {
                images [images.length - 1].classList.add('visible')
                }
            index = images.length
        }
        index++
    }
}

function showForwardImage(slider) {
    const images = slider.querySelectorAll('.slide')
    let index = 0
    while (index < images.length) {
        if(images [index].classList.contains('visible')) {
            images [index].classList.remove('visible')
            if (index < images.length - 1) {
                images [index + 1].classList.add('visible')
                } 
            else {
                images [0].classList.add('visible')
                }
            index = images.length
        }
        index++
    }
}

function getDescriptionDiv(guitarData) {
    const descDiv = document.createElement('div')
    descDiv.className = 'card-description'
    
    const desc = document.createElement('p')
    desc.className = 'main-desc'
    desc.innerText = guitarData.description
    descDiv.append(desc)
    
    const brand = document.createElement('p')
    brand.className = 'brand'
    brand.innerText = `Бренд: ${guitarData.brand}`
    descDiv.append(brand)
    
    const price = document.createElement('p')
    price.className = 'price'
    price.innerText = `Цена: ${guitarData.price.toLocaleString('ru-RU')} ₽`
    descDiv.append(price)
    
    const type = document.createElement('p')
    type.className = 'type'
    type.innerText = `Тип: ${guitarData.type}`
    descDiv.append(type)
    
    const body = document.createElement('p')
    body.innerText = `Корпус: ${guitarData.bodyMaterial}`
    descDiv.append(body)
    
    if (guitarData.neck) {
        const neck = document.createElement('p')
        neck.innerText = `Гриф: ${guitarData.neck.material}, ${guitarData.neck.frets} ладов`
        descDiv.append(neck)
        
        const fretboard = document.createElement('p')
        fretboard.innerText = `Гриф-доска: ${guitarData.neck.fretboard}`
        descDiv.append(fretboard)
    }
    
    const bridge = document.createElement('p')
    bridge.innerText = `Бридж: ${guitarData.bridge}`
    descDiv.append(bridge)
    
    if (guitarData.electronics) {
        const pickups = document.createElement('p')
        pickups.innerText = `Пикапы: ${guitarData.electronics.pickups}`
        descDiv.append(pickups)
        
        const controls = document.createElement('p')
        controls.innerText = `Управление: ${guitarData.electronics.controls}`
        descDiv.append(controls)
    }
    
    return descDiv
}

function addToCart(guitarName, guitarData, quantity = 1, cardCount = null) {
    if (quantity < 1) return

    const existingItem = cart.find(item => item.name === guitarName)
    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        cart.push({name: guitarName, data: guitarData, quantity})
    }

    if (cardCount) {
        const currentQty = existingItem ? existingItem.quantity : quantity
        cardCount.innerText = `В корзине: ${currentQty}`
        cardCount.style.display = 'block'
    }

    updateCartCount()
    alert(`"${guitarName}" добавлена в корзину (${quantity} шт).`)
}