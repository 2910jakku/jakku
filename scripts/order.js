var menu = document.getElementById("menu");
var order_list = document.getElementById("order_list");
var placeButton = document.getElementById("placeButton");
var statusButton = document.getElementById("statusButton");
var order_item_id = [];
var order_quantity = [];
var socket;

// when page loaded
$(document).ready(function(){
    clearOrderList();
    addEvent();
    initSocket();
    socketHandle();
});
    
// send request to get the menu 
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
                ndiv.innerHTML = "<div><img src='"+resp[i].url+"'></div>";
                ndiv.innerHTML = "<div id='itemName'> Name: " + resp[i].name; + "</div>";
                ndiv.innerHTML += "<div id='itemPrice'> Price: $" + resp[i].price; + "</div>";
                ndiv.innerHTML += "<div id='itemQuantity'> Quantity: <input type='text' value = '1' id='itemQuantity' placeholder ='enter number'></div>";
                ndiv.innerHTML += "<button type='button' class='addBtn'>add</button>";
               
                ndiv.id = "food_item"+resp[i].id;
                menu.appendChild(ndiv);
           }
           
           callback(resp);
       }
   });
}

// add event listener to all buttons
function addEvent(){
    documentReady(function(food_list){
        // "add" button to add item to a list
        var addBtn = document.getElementsByClassName("addBtn");
        console.log(addBtn);
        for(var i=0;i<addBtn.length;i++){
            addBtn[i].addEventListener("click",function(){

                var parent_div_id = this.parentNode.id;
                var item_id = parseInt(parent_div_id[parent_div_id.length-1]);

                var quantity = $("#"+parent_div_id+" #itemQuantity")[1].value;
                console.log(item_id);
                console.log(parent_div_id);
                var item_name;
                
                // search item name in the food list
                for(var i=0;i<food_list.length;i++){
                    if(food_list[i].id == item_id){
                        item_name = food_list[i].name;
                    }
                }

                order_list.innerHTML += "<div>Name: "+item_name+ " Quantity: " +quantity +"</div>";

                order_item_id.push(item_id);
                order_quantity.push(quantity);
            });
        }
        
    });
    
    // "place order" button action
    placeButton.addEventListener("click",function(){
        console.log("clicked");
        if(order_item_id.length < 1){
            alert("please add items before place order");
        }else{
            $.ajax({
                url:"/order",
                type:"post",
                data:{
                    type:"submit order",
                    order_item_id:order_item_id,
                    order_quantity:order_quantity
                },
                success:function(resp){
                    console.log(resp);
                    if(resp.status == "order successfully placed"){
                        alert("Your order is placed. Your order is #" + resp.order_id +". You can check your order by clicking 'view order status' button");
                        location.reload();
                    }else{
                        alert(resp.status);
                    }
                }
            });
        }
        
    });
    
    // "view status" button to view order status
    statusButton.addEventListener("click",function(){
        location.href = "/board";
    });
}

function initSocket(){
    socket = io();
}
// socket handle
function socketHandle(){
    socket.on("reload page",function(){
        location.reload();
    });
}

// clear the item list of the order
function clearOrderList(){
    order_item_id = [];
    order_quantity = [];
}