'use strict'

const catalog = document.getElementById('catalog')
const searchInput = document.querySelector('.search-section input')
const cartCount = document.getElementById('cart-count')
let allProducts = {}
let cart = []

fetch("./data/products.json").then(uploadProducts)

function uploadProducts(data){
    data.json().then(getProducts)
}

function getProducts(products){
    allProducts = products
    renderCatalog(products)
    setupSearch()
}

function renderCatalog(products) {
    catalog.innerHTML = ''
    for (let guitarName in products){
        const guitarData = products[guitarName]
        const guitarCard = getProductCard(guitarName, guitarData)
        catalog.append(guitarCard)
    }
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase()
        const filtered = {}
        for (let guitarName in allProducts) {
            if (guitarName.toLowerCase().includes(searchTerm)) {
                filtered[guitarName] = allProducts[guitarName]
            }
        }
        renderCatalog(filtered)
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

    const buttonDiv = document.createElement('div')
    buttonDiv.className = 'card-buttons'
    const addButton = document.createElement('button')
    addButton.innerText = 'Добавить в корзину'
    addButton.className = 'add-to-cart-btn'
    addButton.onclick = () => addToCart(guitarName, guitarData)
    buttonDiv.append(addButton)
    guitarCard.append(buttonDiv)

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

function addToCart(guitarName, guitarData) {
    cart.push({name: guitarName, data: guitarData})
    cartCount.innerText = cart.length
    alert(`"${guitarName}" добавлена в корзину!`)
}