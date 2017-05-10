$(document).ready(function(){
    $.ajax({
        url:"/board",
        type:"post",
        data:{
            type:"read order status"
        },
        success:function(resp){
            
        }
    });
});