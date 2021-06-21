const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    test("Testing", function(){
      chai
        .request(server)
        .post("/api/issues/{project}", function(req,res){
            
        });
      });


});
