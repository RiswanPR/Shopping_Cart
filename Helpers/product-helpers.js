const { resolve } = require('express-hbs/lib/resolver');
var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
const fs = require('fs');
const path = require('path');


module.exports = {
    // Common Functions For All
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new objectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    updateProduct: (proId, productDetails) => {
        return new Promise((resolve, reject) => {
            console.log(productDetails),
                db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ _id: new objectId(proId) }, {
                        
                        $set: {
                            Name: productDetails.Name,
                            Price: productDetails.Price,
                            Description: productDetails.Description,
                        }
                    }).then((response) => {
                        resolve()
                    })
        })
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    // End

    // PRODUCT1 START (CHAIRS)
    addProduct: (product, callback) => {
      
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            console.log(data);
            callback(data.insertedId)
        })
    },

    getProducts: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products)
        })

    },

    getAllProducts: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "Chairs" }).toArray();
            resolve(products)
        })

    },

    // Product 1 ENDS

    // Product 2 Starts
    getAllProducts2: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products2 = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "Beds" }).toArray();
            resolve(products2)
        })

    },
    // Product 2 Ends

    // Product 3 Starts
    getAllProducts3: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products3 = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "Furniture" }).toArray();
            resolve(products3)
        })

    },
    // Product 3 Ends

    // Product 4 Starts
    getAllProducts4: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products4 = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "HomeDeco" }).toArray();
            resolve(products4)
        })

    },
    // Product 4 Ends

    // Product 5 Starts
    getAllProducts5: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products5 = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "Dressing" }).toArray();
            resolve(products5)
        })

    },
    // Product 5 Ends

    // Product 6 Starts
    getAllProducts6: (callback) => {

        return new Promise(async (resolve, reject) => {
            let products6 = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": "Tables" }).toArray();
            resolve(products6)
        })

    },
    // Product 6 Ends

    DetailProducts: (proId) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:new objectId(proId)}).toArray();
            console.log(products)
            resolve(products)
        })

    },

    SimiliarProducts: (Category) => {

        return new Promise(async (resolve, reject) => {
            let SimiliarProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": Category }).toArray();
            resolve(SimiliarProducts)
        })

    },
    
}