'use strict';
const uniqID      = require('uniqid');
const fs          = require('fs');

//Expression ? True : False
const IssueObj = function(ID, TITLE, TEXT, CREATED_ON, UPDATED_ON, CREATED_BY, ASSIGNED_TO, OPEN, STATUS_TEXT){
  return {
    _id: typeof ID == typeof "string" ? ID : uniqID(),
    issue_title: TITLE,
    issue_text: TEXT,
    created_on: new Date(),//EATED_ON != undefined ? CREATED_ON : new Date(),
    updated_on: new Date(),//UPDATED_ON != undefined ? UPDATED_ON : new Date(),
    created_by: CREATED_BY,
    assigned_to: typeof ASSIGNED_TO == typeof "string" ? ASSIGNED_TO : "",
    open: OPEN != false ? true : false,
    status_text: typeof STATUS_TEXT == typeof "string" ? STATUS_TEXT : ""
  }
};
//Expression ? True : False

  

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;

      if(!fs.existsSync("testData/"+project+".json", function(err, res)
      {
        console.log("trying to find invalid project " + project);
        res.json({"error": 'That File does not exist'});
      }));
      
      //get ALL the data from that File
      let appData =  JSON.parse(fs.readFileSync("testData/"+project+'.json', {encoding:'utf8', flag:'r'}));

      let qData = req.query;
      let qKeys = Object.keys(qData);

      let dataExample = new IssueObj("ID", "TITLE", "TEXT", "CREATED_ON", "UPDATED_ON", "CREATED_BY", "ASSIGNED_TO", "OPEN", "STATUS_TEXT");
      qKeys.forEach(function(key){
        if(dataExample.hasOwnProperty(key)== false) 
        {
          console.log(key + " is an invalid key, not touching list");
        }else
        {
          console.log(key + " Key Match: Now filtering");
          appData = appData.filter(function(_issue)
          {
            return _issue[key].toString() == qData[key].toString();
          });
        }
      });

      res.json(appData);
    })

    .post(function (req, res){
      let project = req.params.project;
      //console.log(req);
      //console.log(req.document);

      console.log("POST: "+ project);  
      let data = req.body;
      console.log(data);
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
          res.json(message);
        }

      let issue = new IssueObj(
                  data._id,//ID
                  data.issue_title,//TITLE
                  data.issue_text,//TEXT
                  data.created_on,//CREATED_ON
                  data.updated_on,//UPDATED_ON
                  data.created_by,//CREATED_BY
                  data.assigned_to,//ASSIGNED_TO
                  data.open,//OPEN
                  data.status_text//STATUS_TEXT
        );
      
      if(!fs.existsSync("testData/"+project+".json")){fs.writeFileSync("testData/"+project +".json");}
      let appData = fs.readFileSync("testData/"+project+'.json', {encoding:'utf8', flag:'r'});
      let retVal =[];
      
      //If there is DATA then we want to use it
      if(appData.length == 0){retVal = [issue];}
      else if(appData != "undefined")
      {   
        //So we're gonna parse the AppData
        retVal = JSON.parse(appData); //This can't actually parse anything if string length is 0;
        //If there's only ONE value generate an array
        if(!Array.isArray(retVal)) retVal = [retVal, issue];
        else {retVal.push(issue);} //If it's already an array push the new issue
      } 
      else 
      {
         retVal = [issue];
      }
      fs.writeFileSync("testData/"+project + ".json", JSON.stringify(retVal, null, 4));
      //issueData.push(issue);

      res.json(issue);
      
    })
    .put(function (req, res){
      let project = req.params.project;
      let data = req.body;
      console.log("PUT : " + project);
      console.log(data);
      //Get the Data

      if(typeof data['_id'] == typeof undefined){ 
        console.log("=== ERROR ATTEMPTING TO UPDATE WITHOUT ID ===");
        return res.json({ error: 'missing _id' });
      }
        let dKeys = Object.keys(data);
        //So what I need to do is check each field to see if it's equal to nothing
        let checkedData = {};
        dKeys.forEach(function(key){
          //console.log((data[key] != '') + " | "+ key);
          if(data[key] != '') checkedData[key] = (data[key]);
          //checkedData[key] = (data[key]); 
        });
        
        //If the only key present is the ID we'll tell them there was no proper update fields sent
        if(Object.keys(checkedData).length <= 1){ 
          console.log("=== ERROR NO NEW FIELDS TO UPDATE ===");
          return res.json({ error: 'no update field(s) sent', '_id':data._id });
        }
        else
        {
          console.log("Getting Appdata");
          //if we got this far we'll try to parse for data
          let appData =  JSON.parse(fs.readFileSync("testData/"+project+'.json', {encoding:'utf8', flag:'r'}));
          //Find the item to be updated
          appData.find(function(item){
            
            if(item['_id'] == checkedData['_id'])//If we find the item with a matching ID
            { 
              //console.log("found Matching Data");
              //Then we gotta take all the keys and check them against the issue item
              Object.keys(checkedData).forEach(function(key){
                //console.log(key + " | " +typeof item[key]);
                if(typeof item[key] == typeof undefined)
                {
                  console.log("=== ERROR COULD NOT UPDATE ID ===");
                  return res.json({ error: 'could not update', '_id': data._id });
                }else
                {
                  item[key] = checkedData[key];
                }
              });
              item['updated_on'] = new Date();
              console.log('Data successfully updated');
            }//else{console.log(" to find Data | " + checkedData['_id']);}
          });
        fs.writeFileSync("testData/"+project + ".json", JSON.stringify(appData, null, 4));
        return res.json({ result: 'successfully updated', '_id': data._id });
        }
      }
    
      
      //
    })    
    .delete(function (req, res){
      let project = req.params.project;
      console.log("DELETE : "+ project);
    });
    
};

