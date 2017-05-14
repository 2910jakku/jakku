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

function socketHandle(){
    socket.on("update board",function(order_id){
        var node = document.getElementById(order_id).childNodes;
        console.log(node);
        console.log(order_id);
        node[1].innerHTML = "1";
    });
    
    socket.on("add order",function(result){
        console.log(result)
       loadOrderDetails(result);
    });
}

function loadOrderDetails(resp){
    for(var i=0;i<resp.length;i++){
        var time = resp[i].order_date.replace(/T/, ' ').replace(/\..+/, '');
        ndiv = document.createElement("tr");
        ndiv.id = resp[i].id;
        ndiv.innerHTML = "<td>"+resp[i].id+"</td><td>"+resp[i].order_status+"</td><td>"+time+"</td>";
        status_board.appendChild(ndiv);            
    }
}
