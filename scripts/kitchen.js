var socket;
$(document).ready(function(){
    var display = document.getElementById("display");
    var order_list_table = document.getElementById("order_list_table");
    initSockets();
    socketHandle();
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

function socketHandle(){
    socket.on("update order detail",function(obj){
        console.log(obj);
        var node = document.getElementById(obj.order_detail_id);
        $(node).remove();
    });
    
    socket.on("add order details",function(result){
       console.log(result);
        loadOrders(result);
    });
}

function loadOrders(resp){
    xdiv = document.createElement("div");
    display.appendChild(xdiv);
    for(var i=0;i<resp.length;i++){
        // create table and button to append data into page
        
        nDBtn = document.createElement("button");
        nDBtn.innerHTML = "done";
        nDBtn.id = resp[i].id;
        ndiv = document.createElement("tr");
        ndiv.id = resp[i].id;
        ndiv.innerHTML = "<td>"+resp[i].order_number+"</td><td>"+resp[i].id+"</td><td>"+resp[i].name+"</td><td>"+resp[i].quantity+"</td><td>"+resp[i].status+"</td>";
        ndiv.appendChild(nDBtn);
        
        // once the "done" button clicked emit the oreder detail id and update db in server
        nDBtn.addEventListener("click",function(){
            console.log(this.id);
            //console.log(resp[this.id].order_number);
            var obj = {
                order_detail_id:this.id
                //order_number:order_id
            };
            socket.emit("order detail done",obj);
        });
        order_list_table.appendChild(ndiv);
    }
}