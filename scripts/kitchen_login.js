$(document).ready(function(){
    console.log("LOGIN");
    document.getElementById("login").addEventListener("click", function(){
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        
        $.ajax({
            url:"/kitchenlogin",
            type:"post",
            data:{
                username:username,
                password:password,
                position:"kitchen"
            },
            success:function(resp){
                if(resp.status == "success"){
                    location.href = "/kitchen";
                } else {
                    alert("INCORRECT USERNAME AND PASSWORD COMBO");
                }
            }
        })
    })
})
