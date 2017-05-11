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
var dbURL = process.env.DATABASE_URL || "postgres://localhost:5432/jakku_project";

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

//kitchen page
app.get("/kitchen", function(req, resp){
    resp.sendFile(pF+"/kitchen.html");
});

//kitchen login page
app.get("/kitchenlogin", function(req, resp){
    resp.sendFile(pF+"/kitchen_login.html");
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

        
        // input validation
        for(var i=0;i<order_item_id.length;i++){
            var quantity = order_quantity[i];
            // test quantity inputs is between 1-999
            if(!NumberRegEx.test(quantity)){
                var obj = {
                    status:"input quantity error"
                }
                resp.send(obj);
            }
            
            // test both array match same length
            if(order_item_id.length != order_quantity.length){
                var obj = {
                    status:"input not match"
                }
                resp.send(obj);
            }
        }
        
        
        // input validation
        for(var i=0;i<order_item_id.length;i++){
            var quantity = order_quantity[i];
            // test quantity inputs is between 1-999
            if(!NumberRegEx.test(quantity)){
                var obj = {
                    status:"input quantity error"
                }
                resp.send(obj);
            }
            
            // test both array match same length
            if(order_item_id.length != order_quantity.length){
                var obj = {
                    status:"input not match"
                }
                resp.send(obj);
            }
        }
        

        // place the order
        var order_id;
        var query = "INSERT INTO orders (order_status) VALUES (0) RETURNING id";
        runQuery(query,function(result){
            order_id = result[0].id;
            for(var i=0;i<order_item_id.length;i++){
                var item_id = order_item_id[i];
                var quantity = order_quantity[i];

                var query2 = "INSERT INTO order_details (order_number,food_number,quantity,status) VALUES ("+order_id+","+item_id+","+quantity+","+"0"+")";
                console.log(query2);
                runQuery(query2,function(result){
    
                });
            }
            var obj = {
                status:"order successfully placed",
                order_id:order_id
            }
            resp.send(obj);
        });
    }
});


/*-----------------------------KITCHEN LOGIN---------------------------*/
//kitchen login
app.post("/kitchenlogin", function(req, resp){
    var username = req.body.username;
    var password = req.body.password;
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            resp.end("FAIL");
        }
        
        client.query("SELECT username, id FROM employee WHERE username = $1 AND password = $2", [username, password], function(err, result){
            done();
            if(err){
                console.log(err);
                resp.end("FAIL");
            }
            
            if(result.rows.length > 0){
                req.session.username = result.rows[0].username;
                req.session.id = result.rows[0].id;
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


app.post("/board",function(req,resp){
    
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