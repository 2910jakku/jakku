var socket;

$(document).ready(function(){
    var display = document.getElementById("display");
    var order_list_table = document.getElementById("order_list_table");
    var cookBtn = document.getElementById("cookBtn");
    var stopCookBtn = document.getElementById("stopCookBtn");
    
    // initialize the socket
    initSockets();
    
    // handle socket actions
    socketHandle();
    
    // handle cook button click
    cookBtn.addEventListener("click",function(){
        socket.emit("start cook");
    });
    
    // handle stop cook button click
    stopCookBtn.addEventListener("click",function(){
        socket.emit("stop cook");
    });
    // load the order details when document ready
    $.ajax({
        url:"/kitchen",
        type:"post",
        data:{
            type:"read order detail"
        },
        success:function(resp){
            console.log(resp);
            loadOrders(resp);
        }
    });
});

function initSockets(){
    socket = io();
}

// handle response from server socket
function socketHandle(){
    socket.on("update order detail",function(obj){
        console.log(obj);
        var node = document.getElementById(obj.order_detail_id);
        $(node).remove();
    });
    
    socket.on("cooked order detail",function(obj){
        var node = document.getElementById(obj.order_detail_id);
        var childNodes = node.childNodes; 
        console.log(childNodes);
        childNodes[5].style.display = "block";
    });
    
    socket.on("add order details",function(result){
       console.log(result);
        loadOrders(result);
    });
    
    socket.on("reload page",function(result){
        location.reload();
    })
}

// load order details from database
function loadOrders(resp){
    xdiv = document.createElement("div");
    display.appendChild(xdiv);
    for(var i=0;i<resp.length;i++){
        // create table and button to append data into page
        
        nDBtn = document.createElement("button");
        nDBtn.innerHTML = "pack";
        nDBtn.id = resp[i].id;
        nDBtn.style.display = "none";
        ndiv = document.createElement("tr");
        ndiv.id = resp[i].id;
        ndiv.innerHTML = "<td>"+resp[i].order_number+"</td><td>"+resp[i].id+"</td><td>"+resp[i].name+"</td><td>"+resp[i].quantity+"</td><td>"+resp[i].status+"</td>";
        ndiv.appendChild(nDBtn);
        
        // once the "done" button clicked emit the oreder detail id and update db in server
        nDBtn.addEventListener("click",function(){
            console.log(this.id);
            var obj = {
                order_detail_id:this.id
            };
            socket.emit("order detail done",obj);
        });
        order_list_table.appendChild(ndiv);
    }
}