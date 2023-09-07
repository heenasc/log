//this below code working fine for All users but if i am selecting single role it throws error function not calling
import ForgeUI, {User,  DashboardGadget, Text , useProductContext,Select, Option ,useState, useEffect,UserPicker,DashboardGadgetEdit, Button , render,TextField,Macro, Table, Head, Cell, Row}  from "@forge/ui";
import api, { route } from "@forge/api";

const Bar = ()=>{
  return(
    <div></div>
  )
}
const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const someRandomvalue = useProductContext();
    //console.log("This is someRandomvalue",someRandomvalue);
      console.log("This is someRandomvalue exit");
  const [logwork, setLogwork] = useState("Fetching logwork...");
  const [start,setStartDate] = useState('');
  const [End,setEndDate] = useState('');
  const [loggedWork,setLoggedWork] = useState(false)
  const UserWorkLogs = {};
  const [worklogs,setworklogs] = useState(false);
  const [projects, setProject] = useState("");
  const [accountIds, setaccountIds] = useState([]);
  const [lastRoleId, setlastRoleId] = useState([]);
  const { roles,StartDate, EndDate,project,selectedRoleUserAccountIds} = gadgetConfiguration;
  console.log("This is roles",roles);
  
  console.log("This is roles",roles);
  console.log("This is project",project);
  //console.log(roles,StartDate,EndDate,project,accountIds,"This is from useEffect THigns");
  //useState(fetchRoles());
 /* useEffect(() => {
    fetchRoles(); // Fetch roles when the component mounts
  }, []);*/
  async function timer(time){
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{resolve()},time)
    })
  }

  if(roles=='all'){
  //const doSomething= ()=>{}
  console.log("all calling");
  useState(fetchAllRoles(project));
    console.log("all exit");
  }else{
  console.log("all not calling");
  useState(fetchRoles());
    console.log("all not exit");
  }



async function fetchAllRoles(projectKey) {
  console.log("projectKey", projectKey);
  console.log("fetchrole view All");
  const projectRoleResponse = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}/role`, {
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
      const roleUsersResponse = await api.asUser().requestJira(route`/rest/api/3/role/${lastRoleId}`, {
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

        // Concatenate the current accountIds to the allAccountIds array
        allAccountIds.push(...accountIds);

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
      const workLog = await fetchIssues(accountId, StartDate, EndDate, project);
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
}



  async function fetchNumberOfIssues(accountIds, startDate , EndDate,project) {
    
     console.log(accountIds , "This is from fetchNumberOfIssues");
    // console.log(startDate,EndDate);
    setStartDate(startDate);
    setEndDate(EndDate);
    // console.log(start,End),"This sithe values";
    let UserWorkLogs = {};
    for(let i in accountIds){
      UserWorkLogs[accountIds[i]] = 0
    }

    // console.log(UserWorkLogs);


    for(let i in accountIds){
      let workLog = await fetchIssues(accountIds[i],startDate,EndDate,project);
    }
  }
 
  async function somethingElse(){
 
    for(let i in accountIds){
      UserWorkLogs[accountIds[i]] = 1
    }
    for(let i in accountIds){
      let workLog = await fetchIssues(accountIds[i],StartDate,EndDate, project);
      UserWorkLogs[accountIds[i]] = workLog;
    }
    
    console.log(UserWorkLogs),"This is worklogs userWorklogs";
    console.log(loggedWork,"This is loggedWork");
    setLoggedWork(true);
    setworklogs(UserWorkLogs);

}
  async function fetchIssues(accountIds,start,end,project){
    
    //console.log("from fetchIssues",accountIds);
    console.log(start,end);
    let issues = []
    let loop = true;
    let startAt = 0;
    let maxResults = 50;

    const jqlQuery = `project = "${project}" AND worklogAuthor in (${accountIds}) AND updated >= "${start}" AND updated <= "${end}"`;
    console.log(jqlQuery);
    while(loop){
      const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jqlQuery}&fields=none&maxResults=${maxResults}&startAt=${startAt}`,{
        headers:{
          'content-type':'application/json'
        }
      });
      let responseJson = await response.json();
      const issueArray = responseJson.issues.map(obj => obj.key);
      issues.push(...issueArray);
      // console.log(responseJson);
      // console.log(responseJson.issues.length);
      if(responseJson.issues.length < 50){
        loop = false;
      }
    }

    // for(let i in issues){
    //   let issueWorklogs = await workLogs(issues,start,end);
    // }
    let userWorkLogs = await workLogs(issues,start,end,accountIds)

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
        let worklogResponse =  await api.asUser().requestJira(route`/rest/api/3/issue/${userIssueIds[i]}/worklog?startAt=${startAt}&maxResults=${maxResults}`);
        
        let worklog = await worklogResponse.json();
        // console.log(worklog)
        // console.log(worklog.worklogs[0].author)
        // console.log(worklog.worklogs.length);
        startAt +=50;
        // console.log(worklogResponse.worklogs)
        for(let j in worklog.worklogs){
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
      const worklogStarted = new Date(worklogs[i].created);
    const worklogUpdated = new Date(worklogs[i].updated);
      if(worklogs[i].author.accountId == accountIds && ((worklogStarted >= start && worklogStarted <= end) || (worklogUpdated >= start && worklogUpdated <= end))){
        totalTime+= worklogs[i].timeSpentSeconds;
      }
    }
    // console.log(totalTime)
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
    rows.push(
      <Row key={accountId}>
        <Cell>
          <User accountId={accountId} />
        </Cell>
        <Cell>
          <Text>{logWork}</Text>
        </Cell>
      </Row>
    );
  }

  console.log(rows);
  console.log(UserWorkLogs, "This is workLogs in details of worklogs");

  return (
    <Table>
      <Head>
        <Cell>
          <Text>User</Text>
        </Cell>
        <Cell>
          <Text>Log Work</Text>
        </Cell>
      </Head>
      {rows}
    </Table>
  );
}

  
  //   {loggedWork && details()}
  return (
    <DashboardGadget>
   
   {loggedWork && details()}
 
    </DashboardGadget>
  );
};

export default View;
