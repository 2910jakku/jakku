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
var dbURL = process.env.DATABASE_URL || "postgres://postgres:sukhman20@localhost:5432/webpro";



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

app.get("/management", function(req, resp){
    resp.sendFile(pF+"/management.html")
});

app.get("/adminlogin", function(req, resp){
    resp.sendFile(pF+"/admin_login.html");
});


app.post("/adminLogin", function(req, resp){
    
    var password = req.body.password;
    var username = req.body.username;
    
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg:" CONNECTION FAILED"
            }
            resp.send(obj);
        }
        client.query("SELECT username, id FROM employee WHERE username = $1 and password = $2",
                    [ username, password], function(err, result){
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

app.post("/order",function(req,resp){
   if(req.body.type == "read menu"){
       var query = "select * from food where available = true";
       var result = runQuery(query,function(result){
           resp.send(result);
       });
   } 
    if(req.body.type == "submit order"){
        var order_item = req.body.order_item;
        var order_quantity = req.body.order_quantity;
        var order_id;
        
        var query = "INSERT INTO orders (order_status) VALUES (0) RETURNING id";
        runQuery(query,function(result){
            order_id = result[0].id;
            for(var i=0;i<order_item.length;i++){
                var item = order_item[i];
                var quantity = order_quantity[i];

                var query2 = "INSERT INTO order_details (order_number,food_number,quantity,status) VALUES ("+order_id+","+item+","+quantity+","+"0"+")";
                console.log(query2);
                runQuery(query2,function(result){

                });
            }
        });
        
        
    }
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