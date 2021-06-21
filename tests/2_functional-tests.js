const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const uniqID      = require('uniqid');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    test("Post Request with Fields Filled Out", function(){
      chai
        .request(server)
        .post("/api/issues/functionalTests")
        .type('form')
        .send({
            _id: uniqID(),
            issue_title: "Fix error in posting data",
            issue_text: "When we post data it has an error.",
            created_on: "2021-06-21T04:44:26.930Z",
            updated_on: "2021-06-21T04:44:26.930Z",
            created_by: "Joe",
            assigned_to: "Joe",
            open: true,
            status_text: ""
          })
          .end(function(err,res){
            
          });
      });


    test("Missing required Fields", function(){
      chai
        .request(server)
        .post("/api/issues/functionalTests")
        .type('form')
        .send({
            _id: uniqID(),
            issue_title: "",    //Required Field
            issue_text: "",     //Required Field
            created_on: "2021-06-21T04:44:26.930Z",
            updated_on: "2021-06-21T04:44:26.930Z",
            created_by: "",     //Required Field
            assigned_to: "Joe",
            open: true,
            status_text: ""
          })
        .end(function(err,res){
          //console.log(res.text);
          let errMessage = {error: 'required field(s) missing'}
          let resMessage = JSON.parse(res.text);
          assert.deepEqual(resMessage, errMessage, "The Error messages do not match");
        });
      });

      
    test("GET to see all issues", function(){
      chai
        .request(server)
        .get("/api/issues/functionalTests")
        .end(function(err,res){
          //console.log("Ooga Booga");
          //console.log(res.text);

        });
      });
});
/*
suite('Functional Tests', function() {
  test("10L GET conversion", function(){
    chai
      .request(server)
      .get("/api/convert/?input=10L")
      .end(function(err, res){
        //console.log(res);
        let baseData =
        {
          initNum: 10,
          initUnit: 'L',
          returnNum: 2.64172,
          returnUnit: 'gal',
          string: '10 Liters converts to 2.64172 gallons'
        }
        let compData = JSON.parse(res.text);
        assert.deepEqual(baseData, compData, "10 Liters is not converting to 2.6 Gallons");
      });
  });
  */