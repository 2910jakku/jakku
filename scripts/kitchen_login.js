$(document).ready(function(){
    document.getElementById("login").addEventListener("click", function(){
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        
        $.ajax({
            url:"/kitchenlogin",
            type:"post",
            data:{
                username:username,
                password:password
            },
            success:function(resp){
                if(resp.status == "success"){
                    location.href = "/kitchen";
                } else {
                    alert("INCORRECT EMAIL PASSWORD COMBO");
                }
            }
        })
    })
})