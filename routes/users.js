const express = require("express")
var router = express.Router();
var productHelpers = require('../Helpers/product-helpers')
var userHelpers = require('../Helpers/user-helpers')
let coupon = 0;

const verifyLogin = (req, res, next) => {

  if (req.session.userloggedIn) {
    next()
  } else {
    res.redirect('/login')
    //next()   
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {

  let user = req.session.user
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id,)
  }
  console.log("User : " + user);
  res.render('user/home', { user, footer: true, cartCount });

});

router.get('/shop', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(user._id)
  }
  productHelpers.getProducts().then((products) => {

    res.render('user/shop', { products, user, cartCount, shop: true, shopMain: true, footer: true });

  })

});

router.get('/shop-chairs', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(user._id)
  }
  productHelpers.getAllProducts().then((products) => {

    res.render('user/shop_Chair', { products, user, footer: true, cartCount, shop: true, shopChairs: true });

  })

});

router.get('/shop-beds', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts2().then((products) => {

    res.render('user/shop_bed', { products, user, footer: true, cartCount, shop: true, shopBeds: true });

  })

});

router.get('/shop-furnitures', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts3().then((products) => {

    res.render('user/shop_Furniture', { products, user, footer: true, cartCount, shop: true, shopFurnitures: true });

  })

});

router.get('/shop-home-deco', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts4().then((products) => {

    res.render('user/shop_homeDeco', { products, user, footer: true, cartCount, shop: true, shopDeco: true });

  })

});

router.get('/shop-dressing', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts5().then((products) => {

    res.render('user/shop_Dressing', { products, user, footer: true, cartCount, shop: true, shopDressing: true });

  })

});

router.get('/shop-tables', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts6().then((products) => {

    res.render('user/shop_Tables', { products, user, footer: true, cartCount, shop: true, shopTables: true });

  })

});


router.get('/cart', verifyLogin, async (req, res, next) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let cartCount = null;
  let user = req.session.user;
  let Subtotal = await userHelpers.getTotalAmount(user._id)
  let charge = 0;
  let total = 0;
  let couponValidate = 0
  let couponSuccess
  let couponFailure

  if (Subtotal <= 199) {
    charge = 49
  }

  total = charge + Subtotal

  if (coupon == 1) {
    couponFailure = true;
  } else if (coupon == 0) {
    console.log("No Actions Received");
  } else if (coupon >= 10) {
    console.log("User Id : ", req.session.user._id);
    let UserAuthentication = await userHelpers.getUserAuthentication(req.session.user._id);
    console.log("User Athentication : ", UserAuthentication);
    if (UserAuthentication) {
      couponSuccess = true
      couponValidate = total - 1000
      if (couponValidate >= coupon) {
        total = total - coupon

      } else {
        couponSuccess = false
        couponFailure = true;
      }

    } else {
      coupon = 0;
    }

  } else {
    console.log("Something Failed", coupon);
  }

  if (user) {
    cartCount = await userHelpers.getCartCount(user._id);
  }

  if (couponSuccess) {
    res.render('user/cart', { footer: true, user, products, cartCount, total, Subtotal, charge, coupon, couponSuccess });
  } else if (couponFailure) {
    let err = "Coupon Is Invalid Or Not Eligible";
    res.render('user/cart', { footer: true, user, products, cartCount, total, Subtotal, charge, couponSuccess, couponFailure, err });
  } else {
    res.render('user/cart', { footer: true, user, products, cartCount, total, Subtotal, charge, couponSuccess, couponFailure });
  }

});

router.post('/cart', verifyLogin, async (req, res) => {

  let couponCheck = req.body.coupon
  couponCheck.toString()
  user = req.session.user

  coupon = await userHelpers.CouponCheck(couponCheck, user._id)
  res.redirect('/cart')
})

router.get('/add-to-cart/:id', verifyLogin, (req, res, next) => {
  console.log("Api Called");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ success: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  })
})

router.post('/Delete-Product', (req, res, next) => {
  console.log(req.body);
  userHelpers.Delete_Product(req.body).then((response) => {
    res.json(response);
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let user = req.session.user;
  let Subtotal = await userHelpers.getTotalAmount(user._id)
  let charge = 0;
  let total = 0;
  let couponSuccess
  let couponValidate = 0
  let couponFailure
  if (Subtotal <= 199) {
    charge = 49
  }
  total = charge + Subtotal

  if (coupon == 1) {
    couponFailure = true;
  } else if (coupon == 0) {
    console.log("No Actions Received");
  } else if (coupon >= 10) {
    console.log("User Id : ", req.session.user._id);
    let UserAuthentication = await userHelpers.getUserAuthentication(req.session.user._id);
    console.log("User Athentication : ", UserAuthentication);
    if (UserAuthentication) {
      couponSuccess = true
      couponValidate = total - 1000
      if (couponValidate <= coupon) {
        couponSuccess = false
        couponFailure = true;
      } else {
        total = total - coupon
      }

    } else {
      coupon = 0;
    }

  } else {
    console.log("Something Failed", coupon);
  }

  if (couponSuccess) {
    res.render('user/place_order', { footer: true, user, total, charge, Subtotal, coupon, couponSuccess });
  } else if (couponFailure) {
    let err = "Coupon Is Invalid";
    res.render('user/place_order', { footer: true, user, total, charge, Subtotal, charge, couponSuccess, couponFailure, err });
  } else {
    res.render('user/place_order', { footer: true, user, total, charge, Subtotal, charge, couponSuccess, couponFailure });
  }

  res.render('user/place_order', { footer: true, user, total, charge, Subtotal })
})

router.post('/place-order', verifyLogin, async (req, res) => {

  console.log(req.body);

  let user = req.session.user;
  let products = await userHelpers.getCartProductList(req.body.userId)

  let Subtotal = await userHelpers.getTotalAmount(req.body.userId)
  let charge = 0;
  let couponSuccess
  let couponFailure

  let totalPrice = 0;
  if (Subtotal <= 199) {
    charge = 49
  }
  totalPrice = charge + Subtotal


  if (coupon == 1) {
    couponFailure = true;
  } else if (coupon == 0) {
    console.log("No Actions Received");
  } else if (coupon >= 10) {
    couponSuccess = true
    totalPrice = totalPrice - coupon
  } else {
    console.log("Something Failed", coupon);
  }


  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true })
  })

})

router.get('/Order-Checkout', verifyLogin, (req, res) => {
  let user = req.session.user;
  res.render('user/checkout', { user });
})

router.get('/orders', verifyLogin, async (req, res) => {
  let user = req.session.user;
  let orders = await userHelpers.getUserOrder(user._id);

  if (orders == user._id) {
    let ordersErr = true
    res.render('user/orders', { user, ordersErr, footer: true });
  } else {
    let len = orders.length;
  let cancelOrders = [];
  let placedOrders = [];
  let shippedOrders = [];
  let deliveredOrders = [];

  // Cancelled Orders
  for (let i = 0; i < len; i++) {
    if (orders[i] && orders[i].status === "Cancelled") {
      cancelOrders.push(orders[i]);
    }
  }

  // Placed Orders
  for (let b = 0; b < len; b++) {
    if (orders[b] && orders[b].status === "Placed") {
      placedOrders.push(orders[b]);
    }
  }

   // Shipped Orders
   for (let c = 0; c < len; c++) {
    if (orders[c] && orders[c].status === "Shipped") {
      shippedOrders.push(orders[c]);
    }
  }

     // Delivered Orders
     for (let d = 0; d < len; d++) {
      if (orders[d] && orders[d].status === "Delivered") {
        deliveredOrders.push(orders[d]);
      }
    }
    res.render('user/orders', { user, orders, footer: true,cancelOrders, shippedOrders ,placedOrders ,deliveredOrders });
  }

})

router.get('/view-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  let user = req.session.user;
  res.render('user/view-products', { user, products, footer: true });

})

router.get('/view-Detailed-products/:id', async (req, res) => {
  let products = await productHelpers.DetailProducts(req.params.id);
  let SimiliarProducts = await productHelpers.SimiliarProducts(products[0].Category)
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  console.log("Similar Products : ", products[0].Category);
  res.render('user/view-Detailed-products', { user, products, SimiliarProducts, cartCount });

})

router.get('/cancel/:id', async (req, res) => {
  userHelpers.CancelOrder(req.params.id).then(() => {
    res.redirect('/orders')
  })
})


router.get('/signup', async (req, res) => {
  res.render('user/signup');
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    if (typeof response === 'string') {
      // If response is a string, it means an error occurred      
      res.render('user/signup', { error: response }); // Render the signup page with the error message

    } else {
      // No error, proceed with user session setup
      req.session.user = response;
      req.session.userloggedIn = true;
      res.redirect('/');
    }
  }).catch((error) => {
    console.error("Error in signup:", error);
    res.status(500).send("Internal Server Error"); // Handle unexpected errors with a 500 status
  });
});


router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login', { loginErr: req.session.userLoginErr })
    req.session.userLoginErr = false;
  }

})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userloggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = true
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  req.session.destroy()
  res.redirect('/')
})



module.exports = router;