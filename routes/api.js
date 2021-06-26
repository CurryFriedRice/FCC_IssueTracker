'use strict';
const uniqID      = require('uniqid');
const fs          = require('fs');

require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mySecret = process.env['MONGO_URI'];

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });


//Expression ? True : False
let Project;
let Issue;

const issueObj = function(formData){
    //console.log(formData);
    return {
      _id:  typeof formData._id == typeof undefined ? uniqID() : formData._id,         //Required FieldR
      issue_title: formData.issue_title,  //Required Field
      issue_text: formData.issue_text,
      created_on: typeof formData.created_on != typeof undefined ? formData.created_on : new Date(),
      updated_on: typeof formData.updated_on != typeof undefined ? formData.updated_on: new Date(),
      created_by: formData.created_by,//typeof formData.created_by != undefined ? formData.created_by : "",
      assigned_to: typeof formData.assigned_to == typeof "string" ?formData.assigned_to : "",
      open: formData.open == false ? false : true,
      status_text: typeof formData.status_text == typeof "string" ? formData.status_text : ""
      }
    }

const projectSchema = new Schema({
  projectID : {type: String, required: true} ,
  issues: []
});
Project = mongoose.model("Project", projectSchema);

const createAndSaveIssue = function(projectName, formData, done) 
{
  //console.log("hello there");
  let NewIssue = new issueObj(formData);
  //console.log(NewIssue);

  Project.find({projectID: projectName }, function(err, project){
      
      if(project.length == 0) 
      { 
        //console.log(projectName + " : Does not exist");
        //console.log(err);
        var NewProject = new Project({
            projectID: projectName,
            issues: [NewIssue]
        });
        NewProject.save();
          //done(null, NewIssue);
        //});
      }
      else
      {  
        var foundProject = project[0];
        //console.log(foundProject);
        foundProject.issues.push(NewIssue);
        foundProject.save();
        //console.log(project);
        //console.log(project[0]["issues"].push(NewIssue));
        //console.log(JSON.parse(project[0]["issues"]));
        
      }
  });
    done(null, NewIssue);

    //return NewIssue;
    
} 

const findIssueByParameter = function(_projectID, queryData, done) {
  let keys = Object.keys(queryData);
  Project.find({projectID : _projectID}, function(err, project){
    if(err) return console.err(err);
    //console.log(project);
    //so i have the array of issues here... So now I should just filter through them all
    let issueList = project[0]['issues'];
    //console.log(issueList);
    let returnIssues;
    returnIssues = issueList.filter(function(issue){
      //console.log(issue);
      let isMatching = true;
      //console.log("=== Looking for Match ===" + isMatching);
      keys.forEach(function(key){
          //isMatching = issue[key];
          //console.log(key +" | "+ typeof queryData[key] + " | " +typeof  issue[key] + " | " + (typeof issue[key] ==  typeof queryData[key]));
          
          if(typeof issue[key] == typeof undefined) {console.log("Key not Found");}
          else if(issue[key].toString() != queryData[key].toString()){
            //console.log("Values are not matching");
            //console.log(issue[key].toString() != queryData[key].toString());
            isMatching = false;
          }else
          {
            //console.log("Value Exists and Matches Data");
            //console.log(key + " | "+ queryData[key].toString() + " | " + issue[key].toString() + " | " + (issue[key].toString() ==  queryData[key].toString()));
          }
          //isMatching = (typeof issue[key] != typeof undefined);
      });
      //console.log(isMatching);
      if(isMatching) return issue;

    });
    /*
    console.log (keys);
    console.log (queryData);
    console.log (issueList);
    console.log (returnIssues);
    console.log(returnIssues.length);
    */
    done(null, returnIssues);
    //done(null, people);
  });
}

//Expression ? True : False

//What will be run with PUT
const updateIssue = function(_projectID, updateData, done){
  
  //Just right out he gate if there's no ID to check return missing ID
  //console.log(updateData);
  //console.log(updateData['_id']);\
  
  if(typeof updateData['_id'] === typeof undefined){ 
    //console.log("missing ID");
    return done(null, { error: 'missing _id' });
    }
 
    let keys = Object.keys(updateData).filter(function(value){
        if(updateData[value] != '') return value; 
    });

    if (keys.length == 1) {
      //console.log("error No uppdate Fields");
      //console.log(keys);
      return done(null, { error: 'no update field(s) sent', '_id': updateData['_id']});
      }
    
   let filter = 
    {
      projectID: _projectID,
      //issues: {"issues.$.id" : updateData['_id']} 
      issues: { $elemMatch: { _id : updateData['_id'] } }
    }
    let updatedKeys = {};
    keys.forEach(function(key){
      let keyString = "issues.$."+key;
      updatedKeys[keyString] = updateData[key];
    });
    //console.log(keys);
    //console.log(updatedKeys);
    updatedKeys['issues.$.updated_on'] = new Date();
    let updateVal = 
    {
      $set : updatedKeys
      //{"issues.$.issue_title": "WEABRO", "issues.$.issue_text": "ANIME", "issues.$.assigned_to": "MANLYBADASSHERO"}
    }
    
    //console.log("Honk");
    Project.findOneAndUpdate(filter,updateVal, function(err, foundItem){
      //console.log('founditem');
      //console.log(foundItem);
      if(foundItem == null) {done(null, { error: 'could not update', '_id': updateData['_id'] })}
      else done(null,{  result: 'successfully updated', '_id': updateData['_id'] } );
      });
  
 
}
  
const deleteIssue = function(_projectID, issueID, done){
  //console.log("potato");
  if(typeof issueID == typeof undefined){
    return done(null, {error: 'missing _id'});
  }


    try{
      //console.log("Attempting to remove object");
      //Project.remove({"issues._id": issueID});
      let filter = 
      {
        projectID: _projectID,
        issues: { $elemMatch: { _id : issueID } }
      }
      
      Project.findOne(filter, function(err, foundItem){
        if (foundItem == null) {
          //console.error("ERROR ITEM IS NULL");
          return done(null, {error: 'could not delete', '_id': issueID});
        }
        else{
          //console.log('FIND with Filter');
          //console.log("got through the filter, attempting to pull object");
        Project.findOneAndUpdate({ projectID: _projectID},{$pull: {issues: {"_id":issueID}}} , function(err,foundItem){
          //console.log('founditem');
          //console.log(foundItem);
          return done(null, {result: 'successfully deleted', '_id': issueID});
        });
        
        }});
    }catch(e){ 
      //return done(null, {error: 'could not delete', '_id': issueID});
    }
}
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let parameters = req.query;
      findIssueByParameter(project, parameters, function(err, data){
        //console.log(data);
        if(err) console.log(err);
        return res.json(data);
      });
      //res.json(parameters);
    })

    .post(function (req, res){
      let project = req.params.project;
      //console.log("POST: "+ project);  

      let data = req.body;
      //console.log(data);
      
      
      //Check for valid data    
      if(
        typeof data.issue_title == typeof undefined || //data.issue_title == undefined ||
        typeof data.issue_text  == typeof undefined ||
        typeof data.created_by  == typeof undefined
        )
        {
          let message = {error: 'required field(s) missing'};
          //console.log(message);
          //throw new Error(message);
          return res.json(message);
        }

        
        createAndSaveIssue(project, data, function(err, issueData){
          if(err) console.error(err);
          return res.json(issueData);
        });
      
    })
    .put(function (req, res){
      let project = req.params.project;
      //console.log("PUT : " + project);
     // console.log(req.body);
     // console.log(req.query);
      updateIssue(project, req.body, function(err, data){
        if(err) res.json(err);
        res.json(data);
      });
    })    
    .delete(function (req, res){
      let project = req.params.project;
      //console.log("DELETE : "+ project);
      //console.log('ISSUE ID'+ req.body);
      //console.log(req.body);
      deleteIssue(project, req.body['_id'], function(err, result){
        if(err) console.error(err);
        res.json(result);
      });
    });
    
};

