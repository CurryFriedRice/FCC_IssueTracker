const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const uniqID      = require('uniqid');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let uID =  uniqID();
  let formData = {  //The reason why this is made out here is so we can reference it and PUT it later
        _id: uID,
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_on: "2017-01-08T06:35:14.240Z",
        updated_on: "2017-01-08T06:35:14.240Z",
        created_by: "Joe",
        assigned_to: "Joe",
        open: true,
        status_text: "In QA"
    }

  suite("Post Request Tests", function (){
    test("Create an issue with every field", function(done){
      chai
      .request(server)
      .post("/api/issues/functionalTests")
      .type('form')
      .send(formData)
      .end(function (err, res){
        //console.log();
        assert.deepEqual(JSON.parse(res.text), formData, "Form Data does not match");
        done();
      });
    });

    test("Create an issue with only required fields", function(done){
      let requiredFieldsOnly = {  
        //"_id": "5871dda29faedc3491ff93bb",
        "issue_title": "Potato Salad",
        "issue_text": "Needs Onion, Potato, Mayonaise, Egg Whites",
        //"created_on": "2017-01-08T06:35:14.240Z",
        //"updated_on": "2017-01-08T06:35:14.240Z",
        "created_by": "STEVEN",
        //"assigned_to": "Joe",
        //"open": true,
        //"status_text": "In QA"
    }
      chai
      .request(server)
      .post("/api/issues/functionalTests")
      .type('form')
      .send(formData)
      .end(function(err, res){
        let postData = JSON.parse(res.text);
        assert.equal(postData['issue_title'], formData['issue_title'], "Issue title does not match");
        assert.equal(postData['issue_text'], formData['issue_text'], "Issue Text Does not match");
        assert.equal(postData['created_by'], formData['created_by'], "Created By does not match");
      done();
      });
    });

    test("Create an issue with missing required fields", function(done){
    let missingFields = {  
        //"_id": "5871dda29faedc3491ff93bb",
        //"issue_title": "Potato Salad",
        "issue_text": "Needs Onion, Potato, Mayonaise, Egg Whites",
        //"created_on": "2017-01-08T06:35:14.240Z",
        //"updated_on": "2017-01-08T06:35:14.240Z",
        "created_by": "STEVEN",
        //"assigned_to": "Joe",
        //"open": true,
        //"status_text": "In QA"
    }
      chai
      .request(server)
      .post("/api/issues/functionalTests")
      .type('form')
      .send(missingFields)
      .end(function(err, res){
        let postData = JSON.parse(res.text);
        assert.deepEqual(postData, {error: 'required field(s) missing'}, "There is Valid data even though there are missing fields");
        done();
        });
    });
});

    
suite("Get Request Test", function(){
    test("View issues on a project", function(done){
      chai
      .request(server)
      .get("/api/issues/functionalTests")
      .end(function(err,res){
        let getData = res.text;//JSON.parse(res.text);
        assert.isNotNull(getData,"The get request got NULL as response" );
        done();
      });
    });

    test("View issues on a project with one filter", function(done){
      chai
      .request(server)
      .get("/api/issues/functionalTests?open=true")
      .end(function(err,res){
        let getData = JSON.parse(res.text);
        //console.log(getData);
        getData.forEach(function(item){
          assert.equal(item['open'], true, "The get request could not filter true");
        });
        done();
      });
    });
    
    test("View issues on a project with multiple filters", function(done){
      chai
      .request(server)
      .get("/api/issues/functionalTests?open=true&created_by=Belmont")
      .end(function(err,res){
        let getData = JSON.parse(res.text);
        getData.forEach(function(item){
          assert.equal(item['open'], true, "The get request could not filter true");
          assert.equal(item['created_by'], "Belmont", "The get request could not filter created_by=Belmont");
        });
        done();
      });
    });
    });
    
      
    suite("Put Request Tests", function(){
      //Put only has two responses.... So that's what we're counting on
      let fail = { error: 'could not update', '_id': uID};
      let missingID = {error: 'missing _id'};
      let success = {  result: 'successfully updated', '_id':  uID};
      
      test("Update one field on an issue", function(done){
      let updatedData = 
      {
          _id: uID,
          created_by: "Belmont",
      }
      chai
      .request(server)
      .put("/api/issues/functionalTests")
      .type('form')
      .send(updatedData)
      .end(function(err,res){
        let getData = JSON.parse(res.text);
        //console.log(getData); 
          assert.deepEqual(getData, success, "Updating only one field failed");
        done();
        });
      });

      test("Update multiple fields on an issue", function(done){
        let updatedData = 
        {
            _id: formData['_id'],
            issue_text: "YOU STEAL MENS SOULS!",
            issue_title: "DIE MONSTER!",
            created_by: "Belmont",
            assigned_to: "Dracula"
        }
        chai
        .request(server)
        .put("/api/issues/functionalTests")
        .type('form')
        .send(updatedData)
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, success, "Updating only one field failed");
          done();
          });
      });
      test("Update an issue with missing _id",function(done){
        let updatedData = 
        {
            //_id: formData['_id'],
            created_by: "Belmont"
        }
        chai
        .request(server)
        .put("/api/issues/functionalTests")
        .type('form')
        .send(updatedData)
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, missingID, "Updating with Missing ID has not failed");
          done();
          });
      });
      test("Update an issue with no fields to update", function(done){
        chai
        .request(server)
        .put("/api/issues/functionalTests")
        .type('form')
        .send({})
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, missingID, "Updating with Missing fields has not failed");
          done();
          });

      });
      test("Update an issue with an invalid _id", function(done){
        let randomID = uniqID();
        chai
        .request(server)
        .put("/api/issues/functionalTests")
        .type('form')
        .send({_id: randomID})
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, {_id: randomID, error : "no update field(s) sent"}, "Updating with without a direct ID has not failed");
          done();
          });

        });
      });

    suite("Delete Request Tests", function(){
      test("Delete an issue: DELETE request to /api/issues/{project}", function(done){

        chai
        .request(server)
        .delete("/api/issues/functionalTests")
        .type('form')
        .send({_id: uID})
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, {result: 'successfully deleted', '_id': uID}, "Deleting a specific issue has failed");
          done();
          });

      });
      test("Delete an issue with an invalid _id", function(done){
        let randomID = uniqID();
        chai
        .request(server)
        .delete("/api/issues/functionalTests")
        .type('form')
        .send({_id: randomID})
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, {error: 'could not delete', '_id': randomID}, "Updating with without a direct ID has not failed");
          done();
          });
      });
      test("Delete an issue with missing _id", function(done){
      chai
        .request(server)
        .delete("/api/issues/functionalTests")
        .type('form')
        .send({})
        .end(function(err,res){
          let getData = JSON.parse(res.text);
          //console.log(getData); 
            assert.deepEqual(getData, {error: 'missing _id'}, "Updating with without a direct ID has not failed");
          done();
          });

      });
  });

   
});
