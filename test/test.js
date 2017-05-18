var assert = require("assert");
var request = require("request");
var url = "http://localhost:10000";
var app = require("../index.js");
var chai = require("chai");
var should = chai.should();
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe("Order page",function(){
    describe("GET /",function(){
       it("return status code 200",function(done){
           request.get(url,function(err,resp,body){
                assert.equal(200,resp.statusCode);
                done();
           });
       });
    });
    
    describe("POST /",function(){
        it("return obj that contains order_detail_id and status (valid order)",function(done){
            let data = {
                type:"submit order",
                order_item_id:1,
                order_quantity:1
            }
            chai.request(url)
                .post("/order")
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(data)
                .end((err,resp) =>{
                console.log(resp.body);
                resp.body.should.have.property("order_id");
                resp.body.should.have.property("status");
                resp.body.status.should.equal("order successfully placed");
                done();
            });
        });
    });
})