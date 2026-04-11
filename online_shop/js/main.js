'use strict'

fetch("./data/products.json").then(uploadProducts)

function uploadProducts(data){
    data.json().then(getProducts)
}

function getProducts(products){
    for (let guitarName in products){
        const guitarData = products[guitarName]
        console.log(guitarName, guitarData)
    }
}