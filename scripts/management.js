var SMenuBtn = document.getElementById("SMenuBtn");
var addItemBtn = document.getElementById("addItemBtn");
var IFoodName = document.getElementById("IFoodName");
var IFoodUrl = document.getElementById("IFoodUrl");
var IFoodDesp = document.getElementById("IFoodDesp");
var menuTable = document.getElementById("menuTable");

var SMenuBtn = document.getElementById("SMenuBtn");

var IFoodName = document.getElementById("IFoodName");
var IFoodDesp = document.getElementById("IFoodDesp");
var IFoodUrl = document.getElementById("IFoodUrl");
var IFoodPrice = document.getElementById("IFoodPrice");

var addItemBtn = document.getElementById("addItemBtn");

$(document).ready(function(){
    $.ajax({
        url:"/management",
        type:"post",
        data:{
            type:"read food"
        },
        success:function(resp){
            console.log(resp);
            loadFoods(resp);
        }
    });
    
    addEvent();
});

// load food inventory for manage menu
function loadFoods(resp){
    for(var i=0;i<resp.length;i++){
        // delete button
        nDBtn = document.createElement("button");
        nDBtn.innerHTML = "delete";
        nDBtn.id = resp[i].id;
        
        // on menu button
        onMenuBtn = document.createElement("button");
        if(resp[i].available == true){
            onMenuBtn.innerHTML = "Yes";
        }else{
            onMenuBtn.innerHTML = "No";
        }
        
        onMenuBtn.id = resp[i].id;
        
        var onMenu;
        if (resp[i].available == true){
            onMenuBtn.innerHTML = "Yes";
        }else if(resp[i].available == false){
            onMenuBtn.innerHTML = "No";
        }
        
        ndiv = document.createElement("tr");
        ndiv.id = resp[i].id;
        ndiv.innerHTML = "<td>"+resp[i].id+"</td><td>"+resp[i].name+"</td><td>"+resp[i].description+"</td><td>"+resp[i].price+"</td><td></td><td></td>";
        ndiv.childNodes[4].appendChild(onMenuBtn);
        ndiv.childNodes[5].appendChild(nDBtn);
        
        // delete button event listener
        nDBtn.addEventListener("click",function(){
            // confirm before delete
            var r = confirm("delete the food will delete all the order details that is related to the food");
            if (r == true) {
                $.ajax({
                    url:"/management",
                    type:"post",
                    data:{
                        type:"delete food",
                        id:this.id
                    },
                    success:function(resp){
                        console.log(resp);
                        location.reload();
                    }
                });
            } else {
                
            }
            console.log(this.id);
            var obj = {
                food_id:this.id
            };
        });
        
        // on Menu button event listener
        onMenuBtn.addEventListener("click",function(){
            var isMenu;
            if (onMenuBtn.innerHTML=="No"){
                isMenu = true;
            }else{
                isMenu = false;
            }
            $.ajax({
                url:"/management",
                type:"post",
                data:{
                    type:"change menu",
                    id: this.id,
                    available:isMenu
                },
                success:function(resp){
                    console.log(resp);
                    location.reload();
                }
            });
        })
        menuTable.appendChild(ndiv);            
    }
}

function addEvent(){
    addItemBtn.addEventListener("click",function(){
        $.ajax({
            url:"/management",
            type:"post",
            data:{
                type:"add food",
                name:IFoodName.value,
                desp:IFoodDesp.value,
                url:IFoodUrl.value,
                price:IFoodPrice.value
            },
            success:function(resp){
                console.log(resp);
            }
        })
    });
}