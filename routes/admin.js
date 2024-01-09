var express = require('express');
var router = express.Router();
var productHelpers = require('../Helpers/product-helpers')
var userHelpers = require('../Helpers/user-helpers')
const Handlebars = require('handlebars');

Handlebars.registerHelper('isEqual', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

const verifyLogin = (req, res, next) => {

  if (req.session.adminloggedIn) {
    next()
  } else {
    //res.redirect('/admin/login')
    next()
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  let admin = req.session.admin
  console.log("Admin : " + admin);
  res.render('admin/home', { admin, admins: true })

});

router.get('/product-panel', verifyLogin, function (req, res, next) {

  res.render('admin/product-panel', { admins: true })

});

// Common Functions For Products

router.get('/product-panel/product/add-product', verifyLogin, function (req, res, next) {

  res.render('admin/Products/add-product', { admins: true })
});

router.post('/product-panel/product/add-product', verifyLogin, (req, res) => {

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;

    image.mv('./public/product-images/' + id + '1' + '.jpg', (err, done) => {
      if (!err) {
        let image2 = req.files.image2;
        image2.mv('./public/product-images/' + id + '2' + '.jpg', (err, done) => {
          if (!err) {
            res.redirect('/admin/product-panel');
          } else {
            console.log("ERROR" + err);
          }
        })
      } else {
        console.log("ERROR" + err);
      }
    })
  })
})

router.get('/product-panel/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/product-panel/')
  })
})

router.get('/product-panel/edit-product/:id', verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log("Details", product);
  res.render('admin/Products/edit-product', { product, admins: true })
})
router.post('/product-panel/edit-product/:id', verifyLogin, (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {

    res.redirect('/admin/product-panel/')

    console.log(req.params.id);
    let id = req.params.id;

    if (req.files && req.files.image == null) {

      if (req.files.image) {
        let image = req.files.image;
        image.mv('./public/product-images/' + id + '1' + '.jpg', (err, done) => {
          if (err) {
            console.log("ERROR" + err);
          } else {

          }
        })
      }
    } else {
      console.error("Image 1 Wasn't uploaded");
    }

    if (req.files && req.files.image == null) {

      if (req.files.image2) {
        let image2 = req.files.image2;
        image2.mv('./public/product-images/' + id + '2' + '.jpg', (err, done) => {
          if (!err) {

          } else {
            console.log("ERROR" + err);
          }
        })
      }

    } else {
      console.error("Image 2 Wasn't uploaded");
    }


  })
})
// End 

router.get('/coupons', (req, res) => {
  userHelpers.getCoupons().then((coupons) => {
    res.render('admin/view-coupons', { admins: true, coupons })
  })

})

router.get('/add-coupons', verifyLogin, function (req, res, next) {

  res.render('admin/add-coupons', { admins: true })
});

router.post('/add-coupons', verifyLogin, (req, res) => {

  userHelpers.addCoupons(req.body, (id) => {
    res.redirect('/admin/coupons');
  })

})

router.get('/edit-coupons/:id', verifyLogin, async (req, res) => {
  let coupons = await userHelpers.getCouponDetails(req.params.id)
  console.log("Details", coupons);
  res.render('admin/edit-coupons', { coupons, admins: true })
})

router.post('/edit-coupons/:id', verifyLogin, (req, res) => {
  userHelpers.updateCoupons(req.params.id, req.body).then(() => {
    res.redirect('/admin/coupons', { admins: true })

  })
})
router.get('/delete-coupons/:id', (req, res) => {
  let proId = req.params.id
  userHelpers.deleteCoupons(proId).then((response) => {
    res.redirect('/admin/coupons', { admins: true })
  })
})

router.get('/orders', verifyLogin, async (req, res) => {

  let orders = await userHelpers.getAllOrders();

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
  

  res.render('admin/orders', { admins: true, footer: true, cancelOrders, shippedOrders ,placedOrders ,deliveredOrders});
})

router.get('/view-products/:id', verifyLogin, async (req, res) => {

  let products = await userHelpers.getAllOrderProducts();
  res.render('admin/view-products', { admins: true, products, footer: true });

})
router.get('/edit-order/:id', verifyLogin, async (req, res) => {
  let order = await userHelpers.getOrderDetails(req.params.id)
  console.log("Details", order);
  res.render('admin/edit-order', { order, admins: true })
})

router.post('/edit-order/:id', verifyLogin, (req, res) => {
  userHelpers.updateOrder(req.params.id, req.body).then(() => {
    res.redirect('/admin/orders')
  })
})

// router.get('/Advance-edit-order/:id', verifyLogin, async (req, res) => {
//   let order = await userHelpers.getOrderDetails(req.params.id)
//   console.log("Details", order);
//   res.render('admin/edit-order', { order, admins: true })
// })

// router.post('/Advance-edit-order/:id', verifyLogin, (req, res) => {
//   userHelpers.updateOrder(req.params.id, req.body).then(() => {
//     res.redirect('/admin/orders')
//   })
// })

router.get('/delete-order/:id', (req, res) => {
  let proId = req.params.id
  userHelpers.deleteOrders(proId).then((response) => {
    res.redirect('/admin/orders')
  })
})

router.get('/all-users', verifyLogin, function (req, res, next) {
  userHelpers.getAllUsers().then((Users) => {

    res.render('admin/all-users', { admins: true, Users })

  })

});


// Product 1(CHAIR)
router.get('/product-panel/product', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/Products/view-products', { admins: true, products })
  })
});
// End Product 1



// Product 2(BED)
router.get('/product-panel/product2', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts2().then((products) => {

    res.render('admin/Products/view-products2', { admins: true, products })
  })
});
// End Product 2

// Product 3(Furniture)
router.get('/product-panel/product3', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts3().then((products) => {

    res.render('admin/Products/view-products3', { admins: true, products })
  })
});
// End Product 3

// Product 4(Home Deco)
router.get('/product-panel/product4', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts4().then((products) => {
    console.log(products);
    res.render('admin/Products/view-products4', { admins: true, products })
  })
});
// End Product 4

// Product 5(Dressing)
router.get('/product-panel/product5', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts5().then((products) => {

    res.render('admin/Products/view-products5', { admins: true, products })
  })
});
// End Product 3

// Product 6(Tables)
router.get('/product-panel/product6', verifyLogin, function (req, res, next) {
  productHelpers.getAllProducts6().then((products) => {

    res.render('admin/Products/view-products6', { admins: true, products })
  })
});
// End Product 6

router.get('/signup', verifyLogin, (req, res, next) => {

  res.render('admin/signup');
});
router.post('/signup', verifyLogin, (req, res) => {

  userHelpers.doSignupAdmin(req.body).then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.adminloggedIn = true;
    res.redirect('/admin');
  })
});

router.get('/login', (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { "loginErr": req.session.loginErr, admins: true })
    req.session.loginErr = false;
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLoginAdmin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true;
      req.session.admin = response.admin;
      res.redirect('/admin');

    } else {
      req.session.loginErr = true;
      res.redirect('/admin/login');
    }
  })
});
router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
