// General structure

STATUSES = ["active", "backlog", "complete", "cancelled"];
TEAM     = ["Electrical", "Mechanical", "Operations"];
MIME     = "application/json";

testMsg = 
  { 
    parameter: 
    {
      dueDate: "1/20/19",
      createDate: "1/13/19",
      re: "ezra",
      subTeam: "controls",
      group: "Electrical",
      name: "Make Task List",
      notes: "nothing",
      status: "active"
    }
  };

function unitTest() {
  console.log(doGet(testMsg));
}


function buildMsg(msg) {
  var name = msg.name;
  var dueDate = msg.dueDate;
  var status = msg.status;
  var createDate = msg.createDate;
  var group = msg.group;
  var subTeam = msg.subTeam;
  var re = msg.re;
  var notes = msg.notes;
  
  if (name === undefined || dueDate === undefined ||
      status === undefined || createDate === undefined ||
      group === undefined || subTeam === undefined ||
      re === undefined) {
    return undefined;
  }
  
  if (!validate(msg)) return undefined;
  
  /* Needs to match the format of the row on the sheet itself, not sure of a less brittle way to do this */
  return [status, name, createDate, dueDate, group, subTeam, re, notes];
}

function parse(msg) {
  console.log("parser: ", msg);
  
  var sheet = SpreadsheetApp.getActive().getActiveSheet();
  var row = buildMsg(msg);
  
  if (row === undefined)
    return undefined;
  
  sheet.appendRow(row);

  return true;  
}

function doGet(e) {
  var params = e.parameter; // Grab the parameters sent by slack
  return parse(params); //I have no how to validate?
}

function doPost(e) {
  console.log("SAW POST");
  console.log(e);
  if (e.postData.type !== MIME) return;
  var params = JSON.parse(e.postData.contents);
  
  parse(params); // POST is bullshit anyway
}


function validate(msg) {
  var name = msg.name;
  var dueDate = msg.dueDate;
  var status = msg.status;
  var createDate = msg.createDate;
  var group = msg.group;
  var subTeam = msg.subTeam;
  var re = msg.re;
  var notes = msg.notes;
  
  /* TODO We need to validate dates better */
 // if (dueDate < createDate)
 //   return false;
  
  if (STATUSES.indexOf(status) < 0) {
    console.log("Failed here1\n");
    return false;    
  }
  
  if (TEAM.indexOf(group) < 0) {
    console.log("Failed here1\n");
    return false; 
  }
  return true;
}

