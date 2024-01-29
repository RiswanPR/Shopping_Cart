const { resolve } = require('express-hbs/lib/resolver');
var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { Collection } = require('mongo');
const Razorpay = require('razorpay');
const { error } = require('jquery');
var instance = new Razorpay({
    key_id: 'rzp_test_1BNo3QWTFv1lZD',
    key_secret: 'U96xsmoOABcPB9p4SsTqejTI',
  });

module.exports = {
    // doSignup: (userData) => {
    //     return new Promise(async (resolve, reject) => {

    //        console.log("UserName : ",userData.Username);
    //        let Username = await db.get().collection(collection.USER_COLLECTION).findOne({ Username: new ObjectId(userData.Username) })
    //        let Email = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: new ObjectId(userData.Email) })
    //        let PhoneNumber = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone_Number: new ObjectId(userData.Phone_Number) })
    //         if (Username){
    //             let Err = "Username Already Exists"
    //             resolve(Err)
    //         }else if (Email){
    //             let Err = "Email Already Exists"
    //             resolve(Err)
    //         }else if (PhoneNumber){
    //             let Err = "Phone Number Already Exists"
    //             resolve(Err)
    //         }else{

    //         userData.Password = await bcrypt.hash(userData.Password, 10)
    //         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
    //             resolve(data.insertedId)
    //         })

    //         }
    //     });

    // },


    doSignup: async (userData) => {
        try {
            console.log("UserName : ", userData.Username);

            // Check if Username already exists
            let usernameExists = await db.get().collection(collection.USER_COLLECTION).findOne({ Username: userData.Username });
            if (usernameExists) {
                return "Username Already Exists";
            }

            // Check if Email already exists
            let emailExists = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
            if (emailExists) {
                return "Email Already Exists";
            }

            // Check if Phone Number already exists
            let phoneNumberExists = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone_Number: userData.Phone_Number });
            if (phoneNumberExists) {
                return "Phone Number Already Exists";
            }

            // Hash the password
            userData.Password = await bcrypt.hash(userData.Password, 10);

            // Insert the user data
            let result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

            return result.insertedId;
        } catch (error) {
            console.error("Error in doSignup:", error);
            throw error; // Rethrow the error for proper error handling in the calling code
        }
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Username: userData.Username })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("Login Successful");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed");
                resolve({ status: false })

            }
        });
    },
    getAllUsers: (callback) => {

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(user)
        })

    },

    doSignupAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.insertedId)
            })
        });

    },
    doLoginAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Username: adminData.Username })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log("Login Successful");
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed");
                resolve({ status: false })

            }
        });
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: new ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: new ObjectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: new ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })

    },

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                },


            ]).toArray();
            console.log(cartItems);
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });

                if (cart && cart.products && cart.products.length > 0) {
                    for (let i = 0; i < cart.products.length; i++) {
                        count += cart.products[i].quantity;
                    }
                }

                console.log("Count: " + count);
                resolve(count);
            } catch (error) {
                console.error("Error in getCartCount:", error);
                reject(error);
            }
        });
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {

            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new ObjectId(details.cart) },
                        {
                            $pull: { products: { item: new ObjectId(details.product) } }
                        }
                    ).then((response) => {

                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: new ObjectId(details.cart), 'products.item': new ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {

                        resolve(true)
                    })
            }


        })
    },
    Delete_Product: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {


            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: new ObjectId(details.cart) },
                    {
                        $pull: { products: { item: new ObjectId(details.product) } }
                    }
                ).then((response) => {

                    resolve({ removeProduct: true })
                })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    // Your aggregation stages...
                    // (Omitted for brevity)
                    {
                        $match: { user: new ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: [
                                        { $toInt: '$quantity' },
                                        { $toInt: '$product.Price' }
                                    ]
                                }
                            }
                        }
                    }
                ]).toArray();

                if (cartItems.length > 0) {
                    // Extract total from the result
                    let total = cartItems[0].total;
                    resolve(total); // Resolve the total
                } else {
                    resolve(0); // Resolve 0 if there are no items in the cart
                }
            } catch (error) {
                reject(error); // Reject with the error if something goes wrong
            }
        });
    },
    placeOrder: (order, products, Total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, Total);
            let status = order.PaymentMethod === 'COD' ? 'Placed' : 'pending';
            var today = new Date();
            var DeliverDate = new Date();

            // Current Date
            var dd = today.getDate()
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            today = dd + '-' + mm + '-' + yyyy;

            // Deliver Sample Date
            var dd2 = DeliverDate.getDate() + 10
            var mm2 = DeliverDate.getMonth() + 1;
            var yyyy2 = DeliverDate.getFullYear();
            DeliverDate = dd2 + '-' + mm2 + '-' + yyyy2;

            let orderObj = {
                DelivaryDetails: {
                    FName: order.Fname,
                    Lname: order.Lname,
                    Phone_Number: order.Phone_Number,
                    Address: order.Address,
                    Town: order.Town,
                    District: order.District,
                    ZipCode: order.ZipCode,
                },
                userId: new ObjectId(order.userId),
                PaymentMethod: order.PaymentMethod,
                products: products,
                status: status,
                date: today,
                DeliverDate: DeliverDate,
                total: Total,
            }
            console.log(orderObj);

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                if (response.insertedId) {
                 //   db.get().collection(collection.CART_COLLECTION).deleteOne({ user: new ObjectId(order.userId)});
                    resolve(response.insertedId);
                } else {
                    reject(new Error("Order insertion failed: No response.insertedId"));
                }
                // resolve(response.ops[0]._id)
            })
        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: new ObjectId(userId) });
            console.log(cart);

            resolve(cart.products)
        })
    },

    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find({
                    userId: new ObjectId(userId)
                }).toArray();

            console.log("orders length ", orders.length);
            if (orders.length == 0) {
                let NoOrders = userId;
                resolve(NoOrders);
            } else {
                resolve(orders);
            }
        });
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let OrderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {

                    $match: { _id: new ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                },


            ]).toArray();
            resolve(OrderItems);
        })
    },
    CouponCheck: (CouponCode, userId) => {
        return new Promise(async (resolve, reject) => {
            let offer = 0;
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({Coupon_Code: CouponCode})

          //  let 
            if (coupon) {
                console.log("Coupon : ", coupon);
                offer = coupon.Price;

                CouponActivation = {
                    VerifiedId: userId,
                    CouponVerify: coupon._id
                }
                let CouponId = coupon._id;
                let UserExistence = await db.get().collection(collection.COUPON_COLLECTION).findOne({VerifiedId: userId, CouponVerify : new ObjectId(CouponId)  })
                if (UserExistence) {
                    console.log("Already Activated");
                } else {
                    db.get().collection(collection.COUPON_COLLECTION).insertOne(CouponActivation)
                }

                resolve(offer)
            } else {
                console.error('Coupon not found with the given CouponCode');
                offer = 1;
                console.log(coupon);
                resolve(offer)
            }
        })
    },

    getCoupons: (callback) => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find({ "Verify": "Succuess" }).toArray();
            resolve(coupons)
        })

    },

    couponprice : (coupon, callback) => {
        
        return new Promise(async(resolve, reject) =>{
            let couponPrice = coupon.Price;
            console.log(couponPrice);
            let couponExists = db.get().collection(collection.COUPON_COLLECTION).findOne({Price: couponPrice})
            console.log(couponExists);
            if (couponExists instanceof Promise){
                var error = "ERROR";
                console.log("ERROR: " + error);
                resolve (error)
            }else{
                var Succuess = "SUCCESS";
                console.log("Succuess: " + Succuess);
                resolve (Succuess)
            }
        })
       
    },
    addCoupons : (coupon, callback) => {
        
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((data) => {
                console.log(data);
                callback(data.insertedId)
            })
       
    },

    getCouponDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: new ObjectId(proId) }).then((coupons) => {
                resolve(coupons)
            })
        })
    },
    updateCoupons: (proId, couponDetails) => {
        return new Promise((resolve, reject) => {
            console.log(couponDetails),
                db.get().collection(collection.COUPON_COLLECTION)
                    .updateOne({ _id: new ObjectId(proId) }, {

                        $set: {
                            Name: couponDetails.Name,
                            Price: couponDetails.Price,
                            Coupon_Code: couponDetails.Coupon_Code,
                        }
                    }).then((response) => {
                        resolve()
                    })
        })
    },

    deleteCoupons: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },


    getUserAuthentication: (CheckUserId,CouponId) => {
        return new Promise(async (resolve, reject) => {
            let User = await db.get().collection(collection.COUPON_COLLECTION).findOne({ VerifiedId: CheckUserId , CouponVerify: CouponId})
            console.log(User);
            resolve(User);
        })
    },

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find().toArray();

            resolve(orders);
        });
    },

    getAllOrderProducts: () => {
        return new Promise(async (resolve, reject) => {
            let OrderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
                    }
                },


            ]).toArray();
            resolve(OrderItems);
        })
    },

    deleteOrders: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: new ObjectId(proId) }).then((response) => {
                resolve(response)
            })
        })
    },

    updateCoupons: (proId, couponDetails) => {
        return new Promise((resolve, reject) => {
            console.log(couponDetails),
                db.get().collection(collection.COUPON_COLLECTION)
                    .updateOne({ _id: new ObjectId(proId) }, {

                        $set: {
                            Name: couponDetails.Name,
                            Price: couponDetails.Price,
                            Coupon_Code: couponDetails.Coupon_Code,
                        }
                    }).then((response) => {
                        resolve()
                    })
        })
    },

    getOrderDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: new ObjectId(proId) }).then((Order) => {
                resolve(Order)
            })
        })
    },
    updateOrder: (proId, OrderDetails) => {
        return new Promise((resolve, reject) => {
            console.log(OrderDetails),
                db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({ _id: new ObjectId(proId) }, {
                        $set: {
                            status: OrderDetails.status,
                            DeliverDate: OrderDetails.DeliverDate,
                        }
                    }).then((response) => {
                        resolve()
                    })
        })
    },
    CancelOrder: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: new ObjectId(proId) }, {
                    $set: {
                        status: "Cancelled"
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },

    generateRazorpay:(orderId,total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
              };
              instance.orders.create(options, function(err, order) {
                if (err) {
                    console.log("Error", err);
                }else{
                    
                }
              });
        })  
    },
    FindCouponById:(Coupon_Code)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ Coupon_Code : Coupon_Code}).then((CouponData) => {
                let CouponId = CouponData._id;               
                resolve(CouponId);
            })
        })
    },
}