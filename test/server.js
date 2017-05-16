var assert = require("assert");
var request = require("request");
var url = "http://localhost:10000/";
describe("Main Page",function(){
    describe("GET/",function(){
       it("return status code 200",function(done){
           request.get(url,function(err,resp,body){
              assert.equal(200,resp.statusCode);
               done();
           });
       });
    });
    describe("")
})
