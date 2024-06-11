const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
    .route("/login")
    .get(userController.renderCustomerLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/auth/Customer/login", failureFlash: true }), userController.Customerlogin)
router
.get("/logout", userController.logout);
module.exports = router;