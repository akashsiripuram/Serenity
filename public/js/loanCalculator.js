let p=document.getElementById("loan-amount");
let n=document.getElementById("tenure");
let r=document.getElementById("intrest-rate");
let btn=document.getElementById("cal-loan");

function calculate(p,n,r){
    console.log(p);
    let res=p*r*(Math.pow((1+r),n)/(Math.pow((1+r),n-1)-1));
    return res;
}

document.addEventListener("onclick",()=>{
    let res=calculate(p,n,r);
    let h=document.createElement("h3");
    h.innerText=`The EMI per month is ${res}/month`;

});