// General structure

STATUSES = ["Active", "Backlog", "Complete", "Cancelled"];
TEAM     = ["Electrical", "Mechanical", "Operations"];
MIME     = "application/json";

testMsg = 
  { 
    parameter: 
    {
      dueDate: "2019-09-10",
      re: "ezra",
      subTeam: "controls",
      group: "Electrical",
      name: "Make Task List",
      notes: "nothing",
      status: "Active"
    }
  };

function unitTest() {
  console.log(doPost(testMsg));
}

function getCurrDay() {
  var today = new Date();
  
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  return (yyyy + '-' + mm + '-' + dd);  
}

function compareDates(createDate, dueDate) {
  var currDateArr = createDate.split("-",3);
  var dueDateArr  = dueDate.split("-",3);
  
  /* YYYY - MM - DD */
  
  if (currDateArr[0] < dueDateArr[0]) /* Its a later year, we don't need to check anything else */
  {
    return true;
  }
  else if (currDateArr[0] === dueDateArr[0])  /* Same year */ 
  {
    if (currDateArr[1] < dueDateArr[1])  /* Its a later month, we're good to go */
    {
      return true;
    } 
    else if (currDateArr[1] === dueDateArr[1])  /* Same month */
    {
      if (currDateArr[2] < dueDateArr[2]) 
      {
        return true;
      }
    }
  }
  
  return false;  /* Create date is later than due date */
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
  setup();
  var params = e.parameter; // Grab the parameters sent by slack
  return parse(params); //I have no how to validate?
}

function doPost(e) {
  console.log("SAW POST");
  console.log(e);
  setup();
  /* if (e.postData.type !== MIME) return; */
  /*var params = JSON.parse(e.postData.contents);*/
  var params = e.parameter;

  params.createDate = getCurrDay();  /* I have too much of the structure done, just toss it in there */
  parse(params); 
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
  
  if (!compareDates(createDate, dueDate)) {
    console.log("Invalid dates");
    return false;
  }
  
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

function setup() {
  // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}
}

