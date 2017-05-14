$(document).ready(function(){
    console.log("jquey is ready!");
    
    document.getElementById("login").addEventListener("click", function(){
        var password = document.getElementById("password").value;
        var username = document.getElementById("username").value;
       
        $.ajax({
            url:"/adminLogin",
            type:"post",
            data:{
                password:password,
                username:username
            },
            success:function(resp){
                if(resp.status == "success"){
                    location.href = "/management";
                }
            }
        })
    })
})