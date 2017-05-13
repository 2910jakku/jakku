// set everything up
const express = require("express");
const port = process.env.PORT || 10000;
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const pg  = require("pg");
var pF = path.resolve(__dirname,"public");
var app = express();
 
// create a new server for socket, but combine it with express functions
const server = require("http").createServer(app);

// create a socket server with the new server
var io = require("socket.io")(server);

// postgres
// database url
var dbURL = "postgres://postgres:1994Daniel@localhost:5432/jakku_fastfood";


// use body parser
app.use(bodyParser.urlencoded({
    extended:true
}));

// use sessions
app.use(session({
    secret:"ddd83",
    resave:true,
    saveUninitialized:true
}));

app.use("/scripts",express.static("build"));

//root folder
app.get("/", function(req, resp){
    resp.sendFile(pF+"/order.html");
});

app.get("/board",function(req,resp){
   resp.sendFile(pF+"/order_board.html"); 
});

app.get("/kitchen",function(req,resp){
   resp.sendFile(pF+"/kitchen.html");  
});

app.post("/order",function(req,resp){
    // read menu from db
   if(req.body.type == "read menu"){
       var query = "select * from food where available = true";
       var result = runQuery(query,function(result){
           resp.send(result);
       });
   } 
    // submit order to db
    if(req.body.type == "submit order"){
        var order_item_id = req.body.order_item_id;
        var order_quantity = req.body.order_quantity;
        var NumberRegEx = /^[1-9][0-9]{0,2}?$/;
        var valid = true;
        
        // input validation
        for(var i=0;i<order_item_id.length;i++){
            var quantity = order_quantity[i];
            // test quantity inputs is between 1-999
            if(!NumberRegEx.test(quantity)){
                var obj = {
                    status:"input quantity error"
                }
                valid = false;
                resp.send(obj);
            }else{
                // test both array match same length
                if(order_item_id.length != order_quantity.length){
                    var obj = {
                        status:"input not match"
                    }
                    valid = false;
                    resp.send(obj);
                }
            }
        }
        
        // place the order
        if(valid){
            var order_id;
            var query = "INSERT INTO orders (order_status) VALUES (0) RETURNING id,order_status,order_date";
            runQuery(query,function(result){
                order_id = result[0].id;
                for(var i=0;i<order_item_id.length;i++){
                    var item_id = order_item_id[i];
                    var quantity = order_quantity[i];

                    var query2 = "INSERT INTO order_details (order_number,food_number,quantity,status) VALUES ("+order_id+","+item_id+","+quantity+","+"0"+") RETURNING order_number , id,(select name from food where id = "+item_id+"),quantity,status";
                    console.log(query2);
                    runQuery(query2,function(result){
                        io.sockets.emit("add order details",result)
                    });
                }
                var obj = {
                    status:"order successfully placed",
                    order_id:order_id
                }
                io.sockets.emit("add order",result);
                resp.send(obj);
            });
        }
        
    }
});

app.post("/board",function(req,resp){
    if(req.body.type == "read order status"){
        query = "SELECT * FROM orders ORDER BY id ASC";
        runQuery(query,function(result){
            resp.send(result);
        })
    }
});

app.post("/kitchen",function(req,resp){
    if(req.body.type == "read order detail"){
        query = "SELECT order_details.id,order_details.order_number,food.name,order_details.quantity,order_details.status from order_details LEFT JOIN food ON order_details.food_number = food.id WHERE status = 0 ORDER BY order_details.order_number ASC";
        runQuery(query,function(result){
           resp.send(result);
        });
    }
});

// socket 
io.on("connection",function(socket){
    socket.on("order detail done",function(obj){
        var order_detail_id = obj.order_detail_id;
        console.log(order_detail_id);
        
        // database update on order_detail table 
        var query = "UPDATE order_details SET status=1 WHERE id="+order_detail_id+" RETURNING order_number";
        runQuery(query,function(result){
            order_number = result[0].order_number;
            var query2 = "SELECT * FROM order_details WHERE order_number="+order_number;
            console.log(query2);
            runQuery(query2,function(result){
                var order_status = true;
                for(var i=0;i<result.length;i++){
                    if(result[i].status==0){
                        order_status = false;
                    }
                }
                if(order_status){
                    var query3 = "UPDATE orders SET order_status = 1 WHERE id ="+order_number+" RETURNING id";
                    console.log(query3);
                    runQuery(query3,function(result){
                        console.log(result[0].id);
                        id = result[0].id;
                        io.sockets.emit("update board",id);
                    });
                }

            })
            socket.emit("update order detail",obj);
        });
        
        
    });
});

// run query
function runQuery(myQuery,callback){
    pg.connect(dbURL,function(err,client,done){
       if(err){
           console.log(err);
           return false;
       }
        client.query(myQuery,[],function(err,result){
           done();
            if(err){
                console.log(err);
                return false;
            }
            console.log(result.rows);
            callback(result.rows);
            return true;
        });
    });
}

// server listen
server.listen(port, function(err){
    if(err){
        console.log(err);
        return false;
    }
    
    console.log(port+" is running");
});