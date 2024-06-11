const accountSid=process.env.ACCOUNT_SID;
const authToken=process.env.AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const sendSMS=async(body,number)=>{
    let MsgOptions={
        from:"+17372507740",
        to:"+91"+number,
        body:body
    }
    try{
        const message=await client.messages.create(MsgOptions);
        console.log(message);
    }catch(e){
        console.log(e);
    }
}

const User= require("../models/User");


module.exports.renderSignUp = (req, res) => {
    res.render("../views/users/EmployeeRegister.ejs");
};


module.exports.signup = async (req, res, next) => {
    try {
        
        // console.log(req.body);
        // if (person === 'Employee') {

            const { username, email, password, firstname, lastname, sonof, dateofbirth, address, phone,person } = req.body;
            
            // Check for missing contact field
            if (!phone) {
                req.flash('error', 'Contact number is required');
                return res.redirect('/auth/Employee/register');
            }

            const name = `${firstname} ${lastname}`;
            const newUser = new User({ username, email, name, sonof, address, dateofbirth, phone, person });

            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.session.logintime=new Date();
                req.flash('success', "Welcome to Bank Management System");
                res.redirect('/');
            });
        // }
    } catch (e) {
        console.log('error', e.message);
        req.flash('error', e.message);
        res.redirect('/auth/Employee/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
  
        
             res.render("../views/users/EmployeeLogin.ejs");
    }
module.exports.renderCustomerLoginForm = (req, res) => {
  
        
        res.render("../views/users/CustomerLogin.ejs");
}

module.exports.renderCreateCustomer=(req,res)=>{
    res.render("../views/users/CustomerRegistration.ejs");
}

module.exports.create=async(req,res)=>{
    try {
        const existingIDs = ['AA1111','XY1234'];
const getRandomLetters = (length = 1) => Array(length).fill().map(e => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
const getRandomDigits = (length = 1) => Array(length).fill().map(e => Math.floor(Math.random() * 10)).join('');
const generateUniqueID = () => {
  let id = getRandomLetters(2) + getRandomDigits(4);
  while (existingIDs.includes(id)) id = getRandomLetters(2) + getRandomDigits(4);
  return id;
};
const username = generateUniqueID();
// console.log(username);
        
        
        
        let {  email, password ,name,sonof,dateofbirth,address,phone} = req.body;
        
        let person="Customer";
        const newUser = new User({username, email, name,sonof,address,phone,dateofbirth,person});
        
        const registeredUser = await User.register(newUser, password);
        // console.log("knbiub",registeredUser);
        let body=`Your Login credential are username :${username} and password :${password}\nPlease d not share your login credentials`;
        try{sendSMS(body,phone);}catch(e){console.log(e.message);}
        req.flash('success', "User created successfully");
        res.redirect("/employeedashboard");
        
        
    }
    catch (e) {
        console.log('error', e.message);
        res.redirect('/auth/Employee/createcustomer');
    }
}

module.exports.login = async (req, res) => {
    
    let user=await User.findOne({username: req.body.username});
    
    req.flash("success", "Welcome to Bank Management Systems");
    req.session.logintime=new Date();
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect("/employeedashboard");
    
    
    

};
module.exports.Customerlogin = async (req, res) => {
    req.flash("success", "Welcome to Bank Management Systems");
    req.session.logintime=new Date();
    let redirectUrl = res.locals.redirectUrl || "/";
    res.redirect("/customerdashboard");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
        
        req.flash("success", "you are now logged out");
        res.redirect("/");

    });
};

