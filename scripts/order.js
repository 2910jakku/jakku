var menu = document.getElementById("menu");
var order_list = document.getElementById("order_list");
var placeButton = document.getElementById("placeButton");
var order_item = [];
var order_quantity = [];

$(document).ready(function(){
    addEvent();
    placeButton.addEventListener("click",function(){
        console.log("clicked");
        $.ajax({
            url:"/order",
            type:"post",
            data:{
                type:"submit order",
                order_item:order_item,
                order_quantity:order_quantity
            },
            success:function(resp){
                console.log(resp);
            }
        });
    });
});
    

function documentReady(callback){
    $.ajax({
        url:"/order",
        type:"post",
        data:{
            type:"read menu"
        },
       success:function(resp){
           console.log(resp);
           for(var i=0;i<resp.length;i++){
                ndiv = document.createElement("div");
                ndiv.innerHTML = "<div id='itemName'> Name: " + resp[i].name; + "</div>";
                ndiv.innerHTML += "<div id='itemPrice'> Price: $" + resp[i].price; + "</div>";
                ndiv.innerHTML += "<div> Quantity: <input type='text' value = '1' id='itemQuantity' placeholder ='enter number'></div>";
                ndiv.innerHTML += "<button type='button' class='addBtn'>add</button>";
               
                ndiv.id = "menu_item"+i;
                menu.appendChild(ndiv);
           }
           
           callback(resp);
       }
   });
}

function addEvent(){
    documentReady(function(food_list){
        var addBtn = document.getElementsByClassName("addBtn");
        console.log(addBtn);
        for(var i=0;i<addBtn.length;i++){
            addBtn[i].addEventListener("click",function(){

                var parent_div_id = this.parentNode.id;
                var id = parseInt(parent_div_id[parent_div_id.length-1]);

                var quantity = $("#"+parent_div_id+" #itemQuantity").val();
                console.log(quantity);
                var item_name = food_list[id].name;

                order_list.innerHTML += "<div>Name: "+item_name+ " Quantity: " +quantity+"</div>";

                order_item.push(item_name);
                order_quantity.push(quantity);
            });
        }
        
    });
    
}
