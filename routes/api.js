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
      //console.log("GET: "+project);
      //console.log(project);
      let open = req.query.open;
      let assigned_to = req.query.assigned_to;
      //console.log(issues);
      console.log("banananana");
      if(!fs.existsSync(project+".json")){res.json({"error": 'That File does not exist'});}
      
      let appData =  JSON.parse(fs.readFileSync(project+'.json', {encoding:'utf8', flag:'r'}));
      console.log(appData);
      
      //appData = JSON.parse(appData);
      res.json(appData);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      console.log("POST: "+project);
      
      let data = req.body;
      let issue = new IssueObj(uniqID(), data.issue_title, data.issue_text, new Date(), data.created_by, data.assigned_to);

      console.log("Attempting to Parse");
      let appData =  JSON.parse(fs.readFileSync(project+'.json', {encoding:'utf8', flag:'r'}));
      
      let tempSaveData = appData;
      tempSaveData.push(issue);
      console.log(tempSaveData);
      fs.writeFileSync(project + ".json", JSON.stringify(tempSaveData, null, 4), function(err){
        if (err) {console.log(err); return err;}
        console.log('Appending success');
      });
      res.json(issue);
      })
    
    .put(function (req, res){
      let project = req.params.project;
      console.log("PUT: "+project);
      let data = req.body;
      console.log(data);
      let appData =  JSON.parse(fs.readFileSync(project+'.json', {encoding:'utf8', flag:'r'}));
      console.log("looking for Item");
      let updatedIssue = appData.find(issue => {
        if(issue._id == data._id)
        {
          //Update the issue then save it
          console.log("FOUND THE ITEM");
          
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
      
    })    
    .delete(function (req, res){
      let project = req.params.project;
      console.log("DELETE : "+project);
    });
    
};

