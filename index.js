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
var dbURL = process.env.DATABASE_URL || "postgres://postgres:1994Daniel@localhost:5432/jakku_fastfood";


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

app.use("/css",express.static("css"));

//root folder
app.get("/", function(req, resp){
    resp.sendFile(pF+"/order.html");
});

app.get("/board",function(req,resp){
   resp.sendFile(pF+"/order_board.html"); 
});

app.get("/kitchen",function(req,resp){
    console.log(req.session.position);
    if(req.session.username && req.session.position=="kitchen"){
        resp.sendFile(pF+"/kitchen.html");  
    }else{
        resp.sendFile(pF+"/kitchen_login.html");
    }
   
});

app.get("/management", function(req, resp){
    console.log(req.session.position);
    if(req.session.username && req.session.position=="admin"){
        resp.sendFile(pF+"/management.html")
    }else{
        resp.sendFile(pF+"/admin_login.html");
    }
});


app.post("/adminLogin", function(req, resp){
    
    var password = req.body.password;
    var username = req.body.username;
    var position = req.body.position;
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg:" CONNECTION FAILED"
            }
            resp.send(obj);
        }
        client.query("SELECT username, id,position FROM employee WHERE username = $1 and password = $2 and position = $3",
                    [ username, password, position], function(err, result){
            done();
            if(err){
                console.log(err);
            var obj = {
                status: "fail",
                msg:" CONNECTION FAILED"
            }
            }
            if(result.rows.length >0){
                req.session.id = result.rows[0].id;
                req.session.username = result.rows[0].username;
                req.session.position = result.rows[0].position;
                var obj = {
                    status: "success"
                }
                resp.send(obj);
            }else{
                resp.end("USERNAME AND PASSWORD NOT FOUND");
            }
            
            
        })
    });
});


app.get("/kitchenlogin", function(req, resp){
    resp.sendFile(pF+"/kitchen_login.html");
});
/*-----------------------------KITCHEN LOGIN---------------------------*/
//kitchen login
app.post("/kitchenlogin", function(req, resp){
    var username = req.body.username;
    var password = req.body.password;
    var position = req.body.position;
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            resp.end("FAIL");
        }
        
        client.query("SELECT username, id, position FROM employee WHERE username = $1 AND password = $2 and position = $3", [username, password,position], function(err, result){
            done();
            if(err){
                console.log(err);
                resp.end("FAIL");
            }
            
            if(result.rows.length > 0){
                req.session.username = result.rows[0].username;
                req.session.id = result.rows[0].id;
                req.session.position = result.rows[0].position;
                console.log(result.rows[0]);
                var obj = {
                    status:"success"
                }
                
                resp.send(obj);
            } else {
                resp.end("FAIL");
            }
        })
    });
});
/*-----------------------------KITCHEN LOGIN ENDS---------------------------*/

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
    socket.on("start cook",function(){
       query = "SELECT order_details.id,order_details.order_number,food.name,order_details.quantity,order_details.status from order_details LEFT JOIN food ON order_details.food_number = food.id WHERE status = 0 ORDER BY order_details.order_number ASC";
        runQuery(query,function(result){
            console.log("hey");
            cooking = true;
            var i=0;
            
            var interval = setInterval(function(){
                if(i < result.length && cooking){
                    var obj = result[i];
                    console.log(obj);
                    //------//
                    
                    var order_detail_id = obj.id;
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
                        obj.order_detail_id = obj.id;
                        socket.emit("update order detail",obj);
                    });
                    
                    //----//
                    console.log(i);
                    i++;
                }else{
                    clearInterval(interval);
                    
                }
            },5000);
            
           
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