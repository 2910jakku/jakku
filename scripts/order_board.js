var socket;
$(document).ready(function(){
    var display = document.getElementById("display");
    var status_board = document.getElementById("status_board");
    initSockets();
    socketHandle();
    $.ajax({
        url:"/board",
        type:"post",
        data:{
            type:"read order status"
        },
        success:function(resp){
            console.log(resp);
            loadOrderDetails(resp);
            
        }
    });
});

function initSockets(){
    socket = io();
}

// socket actions
function socketHandle(){
    // when order stats change
    socket.on("update board",function(order_id){
        var node = document.getElementById(order_id).childNodes;
        console.log(node);
        console.log(order_id);
        node[1].innerHTML = "1";
    });
    
    // new order placed
    socket.on("add order",function(result){
        console.log(result)
       loadOrderDetails(result);
    });
}

// load order details from db
function loadOrderDetails(resp){
    for(var i=0;i<resp.length;i++){
        var time = resp[i].order_date.replace(/T/, ' ').replace(/\..+/, '');
        var order_status;
        if (resp[i].order_status == 1){
            order_status = "Done";
        }else if(resp[i].order_status == 0){
            order_status = "Preparing";
        }
        
        ndiv = document.createElement("tr");
        ndiv.id = resp[i].id;
        ndiv.innerHTML = "<td>"+resp[i].id+"</td><td>"+order_status+"</td><td>"+time+"</td>";
        status_board.appendChild(ndiv);            
    }
}
