import React, { useEffect, useState } from 'react';
import { view, invoke, requestJira, router } from '@forge/bridge';
import api from "@forge/api";

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [project, setProjects] = useState([]);
  const [accountIds, setAccountIds] = useState([]);
  const [logwork, setLogwork] = useState("Fetching logwork...");
  const [StartDate,setStartDate] = useState('');
  const [EndDate,setEndDate] = useState('');
  const [loggedWork,setLoggedWork] = useState(false)
  const UserWorkLogs = {};
  const [worklogs,setworklogs] = useState(false);
  const [lastRoleId, setlastRoleId] = useState([]);
  const [userDetails, setUserDetails] = useState({}); // Define userDetails state
  const [maxHours, setMaxHours] = useState(40);
  //const query = 'project=CAI';
  let jqlQuery;
  let finalUrl;
  let [Query, setQuery]=useState('');
  //fetch for all
  const fetchAllRoles = async (projectKey,StartD,EndD) => {
  console.log("projectKey", projectKey);
  console.log("fetchrole view All");
  console.log("StartD,EndD",StartD,EndD);
  
  const projectRoleResponse = await requestJira(`/rest/api/3/project/${projectKey}/role`, {
    headers: {
      'content-type': 'application/json'
    }
  });
  const projectRoleJson = await projectRoleResponse.json();

  // Create an array to store all accountIds
  const allAccountIds = [];

  for (const roleUrl of Object.values(projectRoleJson)) {
    console.log("roleUrl", roleUrl);
    // Extract the roleId from the roleUrl
    const lastRoleId = roleUrl.split('/').pop();
    setlastRoleId(lastRoleId);
    console.log("lastRoleId", lastRoleId);

    try {
      const roleUsersResponse = await requestJira(`/rest/api/3/project/${projectKey}/role/${lastRoleId}`, {
      //const roleUsersResponse = await requestJira(`/rest/api/3/role/${lastRoleId}`, {
        headers: {
          'content-type': 'application/json'
        }
      });

      const roleUsersJson = await roleUsersResponse.json();

      // Check if the 'actors' property exists and is an array before mapping it
      if (roleUsersJson.actors && Array.isArray(roleUsersJson.actors)) {
        const accountIds = roleUsersJson.actors
          .filter((actor) => actor.actorUser && actor.actorUser.accountId) // Check if actorUser exists and has an accountId
          .map((actor) => actor.actorUser.accountId);
         const activeAccountIds = await filterInactiveUsers(accountIds);
         console.log("activeAccountIds",activeAccountIds);
        // Concatenate the current accountIds to the allAccountIds array
        allAccountIds.push(...activeAccountIds);
        let Query1=await JQLFucntion(allAccountIds,StartD,EndD, projectKey);
        setQuery(Query1);
        
        //console.log("accountIds from view", accountIds);
      } else {
        // Display a message when no actors are present in the role
        console.log(`No actors found for role with lastRoleId ${lastRoleId}`);
      }
    } catch (error) {
      // Handle the error gracefully
      console.error(`Error fetching role with lastRoleId ${lastRoleId}: ${error.message}`);
    }
  }

  // Now fetch issues for all accountIds concurrently
  const issuePromises = allAccountIds.map(async (accountId) => {
    try {
      const workLog = await fetchIssues(accountId, StartD, EndD, projectKey);
      return { accountId, workLog };
    } catch (error) {
      console.error(`Error fetching issues for accountId ${accountId}: ${error.message}`);
      return { accountId, workLog: null };
    }
  });

  // Wait for all issue fetching to complete
  const results = await Promise.all(issuePromises);

  // Process the results and update UserWorkLogs
  for (const result of results) {
    const { accountId, workLog } = result;
    //console.log("accountIds from view", accountId);
    UserWorkLogs[accountId] = workLog !== null ? workLog : 1;
  }

  console.log(UserWorkLogs, "This is worklogs userWorklogs");
  console.log(loggedWork, "This is loggedWork");
  setLoggedWork(true);
  setworklogs(UserWorkLogs);
  fetchUserDetails(allAccountIds);
}  
    
    
  // Function to filter inactive users
const filterInactiveUsers = async (accountIds) => {
  const activeAccountIds = [];

  for (const accountId of accountIds) {
    try {
      const userResponse = await requestJira(`/rest/api/3/user?accountId=${accountId}`, {
        headers: {
          'content-type': 'application/json'
        }
      });

      const userJson = await userResponse.json();
      
      // Check if the user is active based on the "active" field
      if (userJson.active === true) {
        activeAccountIds.push(accountId);
      }
      console.log("activeAccountIds from function",activeAccountIds);
    } catch (error) {
      console.error(`Error fetching user details for accountId ${accountId}: ${error.message}`);
    }
  }

  return activeAccountIds;
}
  
    
    
  //const [role, setRole] = useState([]);
  const fetchData = async (role,project,StartDate,EndDate) => {
    try {
      console.log("entered fetchProjects",role,project,StartDate,EndDate);
      setProjects(project);
      setStartDate(StartDate);
      setEndDate(EndDate);
      //openJiraSearch(query);
      console.log("entered fetchProjects after set",project,StartDate,EndDate);
      const response = await requestJira(`/rest/api/3/project/${project}/role/${role}`, {
      //const response = await requestJira(`/rest/api/3/role/${role}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      });
      console.log("fetchProjects");
      const responseJson = await response.json();
      console.log("responseJson",responseJson);
      const accountIds = responseJson.actors.map((actor) => actor.actorUser.accountId);
      const activeAccountIds = await filterInactiveUsers(accountIds);
      //setAccountIds(accountIds);
      setAccountIds(activeAccountIds);
      console.log("activeAccountIds from view", activeAccountIds);
      
      let Query1=await JQLFucntion(activeAccountIds,StartDate,EndDate, project);
      setQuery(Query1);
      console.log("accountIds from view", accountIds);
      for(let i in activeAccountIds){
      UserWorkLogs[activeAccountIds[i]] = 1
    }
    
      for(let i in activeAccountIds){
      console.log("accountIds fetchissues",activeAccountIds);      
      let workLog = await fetchIssues(activeAccountIds[i],StartDate,EndDate, project);
      UserWorkLogs[activeAccountIds[i]] = workLog;
    }
    console.log(UserWorkLogs),"This is worklogs userWorklogs";
    console.log(loggedWork,"This is loggedWork");
    setLoggedWork(true);
    setworklogs(UserWorkLogs);
    fetchUserDetails(activeAccountIds);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    //console.log("activeAccountIds from outside view", activeAccountIds);
    }
    
   async function JQLFucntion(activeAccountIds,StartDate,EndDate, project){
   console.log("JQLFucntion called",JQLFucntion);
   Query = `project = "${project}" AND worklogAuthor in (${activeAccountIds}) AND worklogDate >= "${StartDate}" AND worklogDate <= "${EndDate}"`;
   console.log("inside JQLFucntion Query",Query);
   return Query; // Return the Query value

   }
   function openInNewTabWithQuery(query) {
   console.log("query openInNewTabWithQuery",query);
    const baseUrl = 'https://cambridgetech.atlassian.net/issues/?jql=';
    const encodedQuery = encodeURIComponent(query); // Ensure the query is properly encoded
    finalUrl = `${baseUrl}${encodedQuery}`;
    console.log("finalUrl",finalUrl);
    router.open(finalUrl);
   }
   
  console.log("outside function Query",Query);
  
  async function fetchIssues(accountIds,start,end,project){
    
    console.log("from fetchIssues",accountIds);
    console.log(start,end);
    let issues = []
    let loop = true;
    let startAt = 0;
    let maxResults = 50;

    //const jqlQuery = `project = "${project}" AND worklogAuthor in (${accountIds}) AND updated >= "${start}" AND updated <= "${end}"`;
    //const jqlQuery = `project = "${project}" AND worklogAuthor in (${accountIds}) AND worklogDate >= startOfMonth(-1) AND worklogDate < startOfMonth()`;
    //const jqlQuery = `project = "${project}" AND worklogAuthor in (${accountIds}) AND worklogDate >= startOfWeek(-1) AND worklogDate <= startOfWeek()`;
    jqlQuery = `project = "${project}" AND worklogAuthor in (${accountIds}) AND worklogDate >= "${start}" AND worklogDate <= "${end}"`;
    console.log("jqlQuery",jqlQuery);
    //jql='project = CAI';
    //openJiraSearch(jqlQuery);
    
    while(loop){
      const response = await requestJira(`/rest/api/3/search?jql=${jqlQuery}&fields=none&maxResults=${maxResults}&startAt=${startAt}`,{
        headers:{
          'content-type':'application/json'
        }
      });
      let responseJson = await response.json();
      const issueArray = responseJson.issues.map(obj => obj.key);
      issues.push(...issueArray);
      console.log("responseJson",responseJson);
      // console.log(responseJson.issues.length);
      if(responseJson.issues.length < 50){
        loop = false;
      }
    }
 
    // for(let i in issues){
    //   let issueWorklogs = await workLogs(issues,start,end);
    // }
    let userWorkLogs = await workLogs(issues,start,end,accountIds)
    console.log("issues",issues);
    //fetchUserDetails(accountIds);
    return userWorkLogs;
    


  }

  async function workLogs(userIssueIds,start,end,accountIds){
    // console.log("this is from worklogsfunction",userIssueIds,start,end);
    let worklogs = [];
    for(let i in userIssueIds){
      let startAt = 0;
      let maxResults = 50;
      let loop = true;
      
      while(loop){
        let worklogResponse =  await requestJira(`/rest/api/3/issue/${userIssueIds[i]}/worklog?startAt=${startAt}&maxResults=${maxResults}`);
         
        

        let worklog = await worklogResponse.json();
         console.log("worklog",worklog);
        // console.log(worklog.worklogs[0].author)
        // console.log(worklog.worklogs.length);
        startAt +=50;
         console.log("worklogResponse.worklogs",worklog.worklogs);
        for(let j in worklog.worklogs){
          console.log("j",worklog.worklogs[j]);
          worklogs.push(worklog.worklogs[j])
        }
        
        if(worklog.worklogs.length < 50){
          loop = false;
        }
        
  
      }
      
    }

    let totalTime = 0;

     start = new Date(start);
     end = new Date(end);
    
    for(let i in worklogs){
      console.log("worklogs",worklogs);
      const worklogStarted = new Date(worklogs[i].started); 
      //const worklogStarted = new Date(worklogs[i].created);
    const worklogUpdated = new Date(worklogs[i].updated);
    console.log("worklogUpdated",worklogUpdated);
      //if(worklogs[i].author.accountId == accountIds && ((worklogStarted >= start && worklogStarted <= end) || (worklogUpdated >= start && worklogUpdated <= end))){
      if (worklogs[i].author.accountId == accountIds && worklogStarted >= start && worklogStarted <= end) {
      //console.log('worklogStarted:',worklogStarted,'worklogUpdated',worklogUpdated,'start:',start,'end:',end);
     
        console.log("worklogs[i].timeSpent",worklogs[i].timeSpent);
        totalTime+= worklogs[i].timeSpentSeconds;
        console.log("totalTime",totalTime);
      }
    }
    console.log("totalTime updated",totalTime);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;
    return logworkData;


  }
  function displayDetails(){
    let something = [1,2,3,4]
    let details = [];
    for(let i in something){
      details.push(
       
        <User accountId={i}/>
        
      )
    
    }
    return details;
  }

  const renderFeilds = ()=>{
    let DetailArray = [];
  }
 
  let randomValues = [1,2,3,4]

  function details() {
  console.log("Inside details");
  console.log(UserWorkLogs, "Inside userWorklogs details");
  let rows = [];

  
  for (let accountId in worklogs) {
  const logWork = worklogs[accountId];
  calculateTotalLogWork(worklogs);
  calculateTotalLogWork(worklogs);
  //fetchUserDetails(accountId)
  parseLogWork(logWork);
  const logWorkPercentage = parseLogWork(logWork);
  rows.push(
    <Row key={accountId}>
      <Cell>
        <User accountId={accountId} />
      </Cell>
      <Cell>
        <Text>{logWork}</Text>
      </Cell>
      <Cell>
        <div style={{ width: '100px', height: '20px', border: '1px solid #ccc' }}>
          <svg width="100%" height="100%">
            <g className="bars">
              <rect fill="#ff0000" width="100%" height="100%"></rect>
              <rect fill="#00ff00" width={`${logWorkPercentage}%`} height="100%"></rect>
            </g>
          </svg>
        </div>
      </Cell>
      <Cell>
      <Text>Σ Time Spent: {maxHours} hours</Text>
    </Cell>
    </Row>
  );
}
  

  console.log(rows);
  console.log(UserWorkLogs, "This is workLogs in details of worklogs");
  };
 
 // Fetch user details (avatars and names)
  const fetchUserDetails = async (accountIds) => {
    try {
      console.log("fetchUserDetails",accountIds);
      const userDetails = {};
      for (const accountId of accountIds) {
        const userResponse = await requestJira(`/rest/api/3/user?accountId=${accountId}`, {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          },
        });
        const userJson = await userResponse.json();
        console.log("userJson",userJson);
        userDetails[accountId] = {
          name: userJson.displayName,
          avatarUrl: userJson.avatarUrls['48x48'], // You can choose the avatar size you need
        };
      }
      setUserDetails(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
 
  // Fetch data when component mounts
  useEffect(() => {
    getContext();
  }, []);


 

async function getContext() {
  try {
    const contexts = await view.getContext();
    console.log(contexts);
    console.log(contexts.extension.gadgetConfiguration.context.selectedDateUnit);
    let role = contexts.extension.gadgetConfiguration.context.role;
    let project = contexts.extension.gadgetConfiguration.context.project;
    let StartDate = contexts.extension.gadgetConfiguration.context.startDate;
    let EndDate = contexts.extension.gadgetConfiguration.context.endDate;
    const selectedDateUnit = contexts.extension.gadgetConfiguration.context.selectedDateUnit;
    console.log("selectedDateUnit", selectedDateUnit);
    console.log(role,project, StartDate, EndDate);
    let newmaxHours=40;
    // fetchData(role,project,StartDate,EndDate); // Call the async function here
    console.log("contexts", role);
    if (role === 'All') {
      console.log("all calling");
      let StartDateRangeAll, EndDateRangeAll;
      if (selectedDateUnit === 'Last Week') {
       console.log("Last Week calling");
       newmaxHours = 40;
       setMaxHours(newmaxHours);
       console.log("maxHours",maxHours);
        const currentDate = new Date();
        const lastWeekStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        );
        StartDateRangeAll = lastWeekStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRangeAll = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("Last Week StartDateRangeAll, EndDateRangeAll",StartDateRangeAll, EndDateRangeAll);
        fetchAllRoles(project, StartDateRangeAll, EndDateRangeAll);
      } else if (selectedDateUnit === 'Last Month') {
      console.log("Last Month calling");
        newmaxHours = 160;
        setMaxHours(newmaxHours);
        console.log("maxHours",maxHours);
        const currentDate = new Date();
        const lastMonthStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate()
        );
        StartDateRangeAll = lastMonthStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRangeAll = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("Last Month StartDateRangeAll, EndDateRangeAll",StartDateRangeAll, EndDateRangeAll);
        fetchAllRoles(project, StartDateRangeAll, EndDateRangeAll);
      } else if (selectedDateUnit === 'Last 3 Months') {
      console.log("Last 3 Month calling");
        newmaxHours = 480;
        setMaxHours(newmaxHours);
        console.log("maxHours",maxHours);
        const currentDate = new Date();
        const lastThreeMonthsStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          currentDate.getDate()
        );
        StartDateRangeAll = lastThreeMonthsStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRangeAll = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("Last 3 Month StartDateRangeAll, EndDateRangeAll",StartDateRangeAll, EndDateRangeAll);
        fetchAllRoles(project, StartDateRangeAll, EndDateRangeAll);
      }else{
      console.log("custom calling");
      console.log("custom",StartDate, EndDate);
      
      const start = new Date(StartDate);
      const end = new Date(EndDate);
      let workingDays = 0;
      while (start <= end) {
        const dayOfWeek = start.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          workingDays++; // Count only Monday to Friday as working days
        }
        start.setDate(start.getDate() + 1); // Move to the next day
      }
      console.log("workingDays",workingDays);
      //newmaxHours = workingDays * 8 - 16;
      newmaxHours = workingDays * 8;
      setMaxHours(newmaxHours);
      console.log("maxHours",newmaxHours);
      
      fetchAllRoles(project, StartDate, EndDate);
      console.log("all exit");
      }
    } else {
      console.log("all Not Calling");
      let StartDateRange, EndDateRange;
      if (selectedDateUnit === 'Last Week') {
        console.log("all Not Calling Last Week");
        newmaxHours = 40;
        setMaxHours(newmaxHours);
        console.log("maxHours",newmaxHours);
        const currentDate = new Date();
        const lastWeekStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        );
        StartDateRange = lastWeekStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRange = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("all Not Calling Last Week StartDateRange, EndDateRange",StartDateRange, EndDateRange);
        fetchData(role, project, StartDateRange, EndDateRange);
      } else if (selectedDateUnit === 'Last Month') {
         console.log("all Not Calling Last Month");
         newmaxHours = 160;
         setMaxHours(newmaxHours);
        console.log("maxHours",newmaxHours);
        const currentDate = new Date();
        const lastMonthStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate()
        );
        StartDateRange = lastMonthStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRange = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("all Not Calling Last Month StartDateRange, EndDateRange",StartDateRange, EndDateRange);
        fetchData(role, project, StartDateRange, EndDateRange,maxHours);
      } else if (selectedDateUnit === 'Last 3 Months') {
        console.log("all Not Calling Last 3 Month");
         newmaxHours = 480;
         setMaxHours(newmaxHours);
        console.log("maxHours",newmaxHours);
        const currentDate = new Date();
        const lastThreeMonthsStartDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          currentDate.getDate()
        );
        StartDateRange = lastThreeMonthsStartDate.toISOString().split('T')[0]; // Extract date portion
        EndDateRange = currentDate.toISOString().split('T')[0]; // Extract date portion
        console.log("all Not Calling Last 3 Month StartDateRange, EndDateRange",StartDateRange, EndDateRange);        
        fetchData(role, project, StartDateRange, EndDateRange);
      }else{
      console.log("custom Calling");
	console.log("custom",StartDate, EndDate);
	
      const start = new Date(StartDate);
      const end = new Date(EndDate);

      let workingDays = 0;
      while (start <= end) {
        const dayOfWeek = start.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          workingDays++; // Count only Monday to Friday as working days
        }
        start.setDate(start.getDate() + 1); // Move to the next day
      }
      console.log("workingDays",workingDays);
      //newmaxHours = workingDays * 8 - 16;
      newmaxHours = workingDays * 8;
      setMaxHours(newmaxHours);
      console.log("maxHours",newmaxHours);
      console.log("maxHours",maxHours);
	
      fetchData(role, project, StartDate, EndDate);
    }
    }
  } catch (error) {
    console.error("Error fetching context:", error);
  }
}


  
  
 

 // useEffect(() => {
 //   getContext();
 // }, []);

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

 function parseLogWork(logWork) {
  // Split logWork into hours and minutes
        console.log("maxHours",maxHours);
  console.log("maxHours from parseLogWork",maxHours);
  const [hours, minutes] = logWork.split(' ').map((part) => {
    if (part.includes('h')) {
      return parseInt(part, 10); // Parse hours as an integer
    } else if (part.includes('m')) {
      return parseInt(part, 10) / 60; // Convert minutes to hours
    }
    return 0; // Handle any other cases if needed
  });

  // Calculate the log work percentage (assuming 40 hours is 100%)
  const logWorkPercentage = (hours + minutes) / maxHours * 100;

  return logWorkPercentage;
}


 if (!worklogs || !calculateTotalLogWork) {
    return 'Please wait, your data is being loaded...';
  }

function calculateTotalLogWork(worklogs) {
  let totalLogWorkSeconds = 0;

  for (const accountId in worklogs) {
    const logWork = worklogs[accountId];
    const [hoursStr, minutesStr] = logWork.split(' ');
    const hours = parseFloat(hoursStr.replace('h', '')) || 0;
    const minutes = parseFloat(minutesStr.replace('m', '')) || 0;
    totalLogWorkSeconds += hours * 3600 + minutes * 60;
  }

  const totalHours = Math.floor(totalLogWorkSeconds / 3600);
  const totalMinutes = Math.floor((totalLogWorkSeconds % 3600) / 60);

  return `${totalHours}h ${totalMinutes}m`;
}


function calculateTotalTimeSpent(worklogs) {
  let totalTimeSpent = 0;

  for (const accountId in worklogs) {
    // Assuming maxHours is a number
    totalTimeSpent += maxHours;
  }

  return totalTimeSpent;
}

  
  function openInNewTab(url) {
  router.open(url, '_blank');
  //router.navigate(url);
}


return (
  <div>
    {loggedWork && (
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Original Estimate</th>
            <th>Log Work</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(worklogs).map(([accountId, logWork]) => {
            const logWorkPercentage = parseLogWork(logWork);
            const userDetail = userDetails[accountId] || {};

            return (
              <tr key={accountId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={userDetail.avatarUrl}
                      alt={`Avatar for ${userDetail.name}`}
                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                    />
                    {userDetail.name || accountId}
                  </div>
                </td>
                <td>{maxHours} hours</td>
                <td>{logWork}</td>
                <td>
                  <div style={{ width: '100px', height: '20px', border: '1px solid #ccc' }}>
                    <svg width="100%" height="100%">
                      <g className="bars">
                        <rect fill="#ff0000" width="100%" height="100%"></rect>
                        <rect fill="#00ff00" width={`${logWorkPercentage}%`} height="100%"></rect>
                      </g>
                    </svg>
                  </div>
                </td>
              </tr>
            );
          })}

          <tr>
  	   <td><b>Total:</b></td>
           <td><b>{calculateTotalTimeSpent(worklogs).toFixed(2)} hours</b></td>
           <td><b>{calculateTotalLogWork(worklogs)}</b></td>
           <td>
               <a
        onClick={() => openInNewTabWithQuery(Query)}
      >
        Open Jira Search
      </a>
            </td>
         </tr>
        </tbody>
      </table>
    )}
  </div>
);
}
export default View;
