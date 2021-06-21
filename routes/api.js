'use strict';
const uniqID      = require('uniqid');
const fs          = require('fs');

const IssueObj = function(ID, TITLE, TEXT, CREATED_ON, CREATED_BY, ASSIGNED_TO){
  return {
    _id: ID,
    issue_title: TITLE,
    issue_text: TEXT,
    created_on: CREATED_ON,
    updated_on: CREATED_ON,
    created_by: CREATED_BY,
    assigned_to: ASSIGNED_TO,
    open: true,
    status_text: ""
  }
};


var issueData = [];



module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
      let open = req.query.open;
      let assigned_to = req.query.assigned_to;
      //console.log(project);
      //console.log("Open?" + open + " | " + typeof open);
      //console.log("Assigned_to | " + assigned_to + " | " + typeof assigned_to);
      if(!fs.existsSync("testData/"+project+".json")){res.json({"error": 'That File does not exist'});}
      
      //get ALL the data from that File
      let appData =  JSON.parse(fs.readFileSync("testData/"+project+'.json', {encoding:'utf8', flag:'r'}));
      
      //start finding a return value
      
      //let returnVal ;
      
      if(open == "true") appData = appData.filter(function(_issue){return _issue.open == true;
      });
      else if(open == "false")appData = appData.filter(function(_issue){return _issue.open == false;
      });
      
      if(typeof assigned_to == typeof undefined){ 
        //console.log ("not looking for a user");
        }
      else if(typeof assigned_to == typeof "string"){
        //console.log("looking for user " + assigned_to);
        appData = appData.filter(function(_issue){ return _issue.assigned_to == assigned_to;}
      )};
      
      
      //appData = JSON.parse(appData);
      res.json(appData);
    })
    .post(function (req, res){
      let project = req.params.project;
      //console.log("POST: "+ project);
      
      
      let data = req.body;
      //console.log(data);
      
      if(data.issue_title == '' ||
         data.issue_text  == '' ||
         data.created_by  == ''
        )
        {
          let message = {error: 'required field(s) missing'};
          //console.log(message);
          //throw new Error("required field(s) missing");
          res.json(message);
        }

      let issue = new IssueObj(uniqID(), data.issue_title, data.issue_text, new Date(), data.created_by, data.assigned_to);
      //console.log(issue);
      if(!fs.existsSync("testData/"+project+".json")){fs.writeFileSync("testData/"+project +".json");}
      let appData = fs.readFileSync("testData/"+project+'.json', {encoding:'utf8', flag:'r'});
      let retVal =[];
      //console.log(issue);
      //console.log(appData.length);
      //console.log(appData);
      //console.log("honk");
      if(appData != "undefined")
      {
        //console.log("Parsing Data and adding new Data");
        retVal = JSON.parse(appData);
        //console.log(retVal);
        if(!Array.isArray(retVal)) retVal = [retVal, issue];
        else {retVal.push(issue);}
        //console.log(retVal);
        //retVal.push(issue);     
      }
      else
      {
         //console.log("Starting new File");
         retVal = issue;
      }
      fs.writeFileSync("testData/"+project + ".json", JSON.stringify(retVal, null, 4));
      //issueData.push(issue);
      res.json(issue);
      
      })
    .put(function (req, res){
      /*
      let project = req.params.project;
      console.log("PUT: "+project);
      let data = req.body;
      //console.log(data);
      let appData =  JSON.parse(fs.readFileSync(project+'.json', {encoding:'utf8', flag:'r'}));
      console.log("looking for Item");
      let updatedIssue = appData.findAndUpdate(issue => {
        if(issue._id == data._id)
        {
          //Update the issue then save it
          
          issue.issue_title = data.issue_title;
          issue.issue_text  = data.issue_text;
          issue.created_by  = data.created_by;
          issue.assigned_to = data.assigned_to;
          issue.status_text = data.status_text;
          if (!data.open) issue.open = false;
          console.log(issue);
          return issue;
        }
      });
      console.log(updatedIssue);
      if(updatedIssue == undefined){
        res.send("invalid unit");
        };
      
      fs.writeFileSync(project + ".json", JSON.stringify(appData, null, 4), function(err){
        if (err) {console.log(err); return err;}
        console.log('Appending success');
      });
      res.json({  "result": 'successfully updated', '_id': data._id });
        */
      
    })    
    .delete(function (req, res){
      let project = req.params.project;
      console.log("DELETE : "+project);
    });
    
};

