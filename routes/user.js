const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
    .route("/register")
    .get(userController.renderSignUp)
    .post(wrapAsync(userController.signup))

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/auth/Employee/login", failureFlash: true }), userController.login)

router
.route("/createcustomer")
.get(userController.renderCreateCustomer)
.post(wrapAsync(userController.create))
router.get("/logout", userController.logout);

module.exports = router;