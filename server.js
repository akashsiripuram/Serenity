const express=require("express");
const app = express();
const session = require("express-session");
var flash = require('connect-flash');
 
app.use(flash());
const sesionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true
}

app.use(session(sesionOptions));

