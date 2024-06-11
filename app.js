
require('dotenv').config();


const express=require("express");
const app = express();
const mongoose=require('mongoose');
const path=require("path");
const port = 8000;
const ejsMate=require("ejs-mate");
const methodOverride = require('method-override');
const passport=require("passport");
const localStrategy=require("passport-local");
const session=require("express-session");
const User=require('./models/User.js');
const flash = require('connect-flash');
const userRouter=require('./routes/user.js');
const customerRouter=require('./routes/customer.js');
const {isLoggedIn }=require("./middleware.js")
const { v4: uuidv4 } = require('uuid');
const  Account=require("./models/Account.js")
const loans=require("./models/loans.js");
const Transactions=require("./models/Transactions.js");
const { config } = require("dotenv");
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
        
    }catch(e){
        console.log(e);
    }
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const dbUrl = 'mongodb://127.0.0.1:27017/bank-management';
main().then(() => {
    console.log("Connnected to DB");
})
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl);
}

const sessionOptions = {
    // store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    let now = new Date();
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
   
    
    next();
})

app.get("/",(req,res)=>{
    res.render("./pages/entry.ejs");
})
app.get("/employeedashboard",isLoggedIn ,async(req,res)=>{
    if(isLoggedIn){
    let reqloans=await loans.find({}).populate("user"); 
    res.render("./pages/home.ejs",{loans:reqloans});}
    else{
        res.render("./pages/auth.ejs");
    }
});
app.get("/auth",(req,res)=>{
    res.render("./pages/auth.ejs");
})
// app.get("/auth",(req,res)=>{
//     res.render("./pages/auth.ejs");
// })
app.get("/employee/view",isLoggedIn ,async (req,res)=>{
    let allAccounts=await User.find({person:"Customer"});
    res.render("./pages/Accounts.ejs",{allAccounts});
})

app.use("/auth/Employee",userRouter);
app.use("/auth/Customer",customerRouter);

app.get("/customerdashboard", async (req, res) => {
    try {
        const userId = req.user._id;
        const currUser = await User.findById(userId)
            .populate('Account')
            .populate({
                path: 'Transactions',
                options: { sort: { createdAt: -1 } } // Sort transactions by creation date in descending order
            });


        if (!currUser) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let monthlyExpenditure = 0;
        currUser.Transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.createdAt);
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear ) {
                monthlyExpenditure += transaction.amount;
            }
        });
        
        res.render("./pages/CustomerDashboard", { currUser, monthlyExpenditure });
    } catch (err) {
        console.error(err);
        req.flash("error","You must login to access dashboard")
        
    }
});
app.get("/view/:id",isLoggedIn ,(req,res)=>{
    res.render("./pages/showAccount.ejs");
})
app.get("/customer/info/:id",isLoggedIn ,async (req,res)=>{
    let  {id}=req.params;
    let info=await User.findById(id).populate("Account");
    res.render("./pages/customerinfo.ejs",{info});

})
app.get("/c/:id/openaccount",async (req,res)=>{
    let  {id}=req.params;
    let info=await User.findById(id).populate("Account");
    res.render("./pages/openaccount.ejs",{info});
    
})
app.post("/c/:id/openaccount",async(req,res)=>{
    let  {id}=req.params;
    let {AccountType,Balance}=req.body;
    function generateBankAccountUUID() {
        const accountUUID = uuidv4();
        const formattedUUID = accountUUID.replace(/-/g, '');
        return formattedUUID;
      }
    const AccountNumber=generateBankAccountUUID().toUpperCase();
    const DateCreated=new Date().toLocaleString();
    const newAccount=new Account({AccountNumber:AccountNumber,AccountType:AccountType,DateCreated:DateCreated,Balance:Balance});
    const savedAccount=await newAccount.save();

    let info=await User.findById(id).populate("Account");
    info.Account=savedAccount._id;
    const saved=await info.save();
    try{
        body=`Dear Customer, your account has been successfully opened with an initial deposit of ${Balance} in our bank. Thank you for banking with us!`;
        sendSMS(body,info.phone);
    }
    catch(e){
        console.log(e);
    }
   
    res.redirect(`/customer/info/${id}`);
})



app.get("/loancalculator",(req,res)=>{
    res.render("./pages/loancalculator.ejs");
})

app.post("/customer/dashboard",(req,res)=>{
    res.render("CustomerDashboard.ejs");
})
app.get('/info/:id',async(req,res)=>{
    let {id}=req.params;
    console.log("Coming")
    let info=await User.findById(id).populate("Account");

    res.render("./pages/customerAccInfo.ejs",{info});
})

app.get("/c/transfer/:id",async(req,res)=>{
    try {
        const userId = req.params.id;
        const currUser = await User.findById(userId);
        if (!currUser) {
            throw new Error('User not found');
        }
        res.render("./pages/transfermoney.ejs", { currUser });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
        
    }
})


app.post("/c/transfer/:id", async (req, res) => {
    let { id } = req.params;
    let { to_account,type, amount } = req.body;
    amount = parseFloat(amount);

    try {
        // Find the user's account info
        let userInfo = await User.findById(id).populate("Account");
        if (!userInfo) {
            throw new Error('User not found');
        }

        let from_account = userInfo.Account._id;

        let toAccountInfo = await Account.findOne({ AccountNumber: to_account });
        if (!toAccountInfo) {
            throw new Error('Recipient account not found');
        }

        let to_account_id = toAccountInfo._id.toString(); // Convert to string
        let from_account_id = from_account.toString(); // Convert to string

        if(to_account_id === from_account_id){
            req.flash("error", "Invalid Account");
            return res.redirect(`/c/transfer/${id}`);
        }

        let recipientUser = await User.findOne({ Account: to_account_id });
        if (!recipientUser) {
            throw new Error('Recipient user not found');
        }

        const transaction_id = uuidv4().replace(/-/g, '');
        let newTransaction = new Transactions({
            transaction_id,
            from_account,
            to_account: to_account_id,
            type,
            amount
        });

        let savedTransaction = await newTransaction.save();

        userInfo.Account.Balance -= amount;
        toAccountInfo.Balance += amount;

        userInfo.Transactions.push(savedTransaction._id);
        recipientUser.Transactions.push(savedTransaction._id);

        console.log(toAccountInfo);
        console.log(userInfo);

        await userInfo.Account.save();
        await toAccountInfo.save();
        await userInfo.save();
        await recipientUser.save();

        // Create a date object and format it
        let transactionDate = new Date();
        let formattedDate = transactionDate.toLocaleDateString();
        let formattedTime = transactionDate.toLocaleTimeString();

        try {
            let body = `Dear Customer, ₹${amount} has been debited from your account XXXX1234 on ${formattedDate} at ${formattedTime}. Available Balance: ₹${userInfo.Account.Balance}. Thank you for banking with us!`;
            sendSMS(body, userInfo.phone);
        } catch (e) {
            console.log(e);
        }

        try {
            let body = `Dear Customer, ₹${amount} has been credited to your account XXXX1234 on ${formattedDate} at ${formattedTime}. Available Balance: ₹${toAccountInfo.Balance}. Thank you for banking with us!`;
            sendSMS(body, recipientUser.phone);
        } catch (e) {
            console.log(e);
        }

        res.redirect("/customerdashboard");
    } catch (e) {
        req.flash("error","Invalid Account");
            res.redirect(`/c/transfer/${id}`);
    }
});

app.get("/homeloan",(req,res)=>{
    res.render("./pages/home-loan-calculator.ejs");
})
app.get("/loans",isLoggedIn,async(req,res)=>{
    try{
        const userId = req.user._id;
        const currUser = await User.findById(userId)
            .populate('Account')
            .populate({
                path: 'loans',
            });
            if (!currUser) {
                console.log('User not found');
                return req.flash('error',"User not found");
               
            }
            res.render("./pages/loans.ejs",{currUser});
        
        
    }
    catch(e){
        console.log(e);
    }
})

app.get("/requestloan",(req,res)=>{
    res.render("./pages/loan.ejs");
})

// app.post("/requestloan",async(req,res)=>{
//     let {loantype,amount,tenure}=req.body;
//     amount=parseFloat(amount);
//     tenure=parseFloat(tenure);
      
//     let loan_id=uuidv4().replace(/-/g, '');
    
//     let newLoan=new loans({loan_id,loantype,amount,tenure});
//     newLoan.save();
//     let {id}=req.user._id;
//     let userInfo=await User.findById(id);
//     userInfo.loans.push(newLoan._id);
//     userInfo.save();

//     res.redirect("/loans");
// })
app.post("/requestloan", async (req, res) => {
    try {
        const { loantype, amount, tenure } = req.body;
        const loan_id = uuidv4().replace(/-/g, '');
        const newLoan = new loans({
            loan_id,
            loantype,
            amount: parseFloat(amount),
            tenure: parseFloat(tenure),
            user: req.user._id
        });
        
        const savedLoan = await newLoan.save();
        const userId = req.user._id;
        const userInfo = await User.findById(userId);

        if (!userInfo) {
            req.flash("error", "User not found");
            return res.redirect("/requestloan");
        }

        userInfo.loans.push(savedLoan._id);
        await userInfo.save();

        req.flash("success", "Loan request submitted successfully");
        res.redirect("/loans");
    } catch (error) {
        // console.error(error);
        req.flash("error", "Failed to request loan");
        res.redirect("/requestloan");
    }
});

app.post('/approval', async (req, res) => {
    try {
        let { loan_id, isApproved } = req.body;
        let loan = await loans.findOne({ loan_id: loan_id }).populate("user");
        loan.isApproved = true;
        await loan.save(); // Await the save operation
        
        let user = await User.findById(loan.user._id).populate("Account");
        user.Account.Balance += loan.amount;
        await user.Account.save(); // Await the save operation for the account

        let body = `Dear Customer, your loan of ₹${loan.amount} has been approved. Thank you for banking with us!`;
        try {
            sendSMS(body, user.phone);
        } catch (e) {
            console.log(e);
        }

        res.redirect("/employeedashboard");
    } catch (e) {
        req.flash("error", "Failed to load");
        res.redirect("/employeedashboard");
    }
});
app.get("/fixeddeposit",(req,res)=>{
    res.render("./pages/FixedDepositCalculator.ejs");
})

app.get("/close",(req,res)=>{
    res.render("./pages/closeAccount.ejs");
})
let otp=0;
app.post("/close",async(req,res)=>{
    let {username}=req.body;
    let userInfo=req.user._id;
    let info=await User.findById(userInfo);
    if(info.username==username){
        otp=0;
        otp=Math.floor(Math.random()*10000)+1000;
        try{
        sendSMS(`Your otp is ${otp}`,info.phone);}
        catch(e){
            console.log(e);
        }
        res.redirect("/otp");

    }
    else{
        res.redirect("/close");
        req.flash("error","Invalid Username");
    }
})
app.get("/otp",(req,res)=>{
    res.render("./pages/verify.ejs");
})
app.post("/otp",async(req,res)=>{
    
    let {otp_v}=req.body;
    let userInfo=req.user._id;
    let info=await User.findById(userInfo);
    
    if(otp_v==otp){
        let del=await User.deleteMany({_id:req.user._id});
        
        res.redirect("/auth");
        
    }
    else{
        res.redirect("/otp");
        req.flash("error","Invalid OTP");
    }
})

app.get("/approvedloans",isLoggedIn,async (req,res)=>{
    let reqloans=await loans.find({}).populate("user");
    res.render("./pages/approvedloans.ejs",{loans:reqloans});
})

app.listen(port,()=>{
    console.log(`server:${port}`);
});

