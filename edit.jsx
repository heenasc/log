//this function call for both all and single role also
import ForgeUI, { DashboardGadgetEdit, UserPicker, useState, useEffect, TextField, DatePicker, Select, Option,Button,render,Text,User,DashboardGadget,useProductContext } from "@forge/ui";
import api, { route } from "@forge/api";

const Edit = () => {
  // let [someCount,setSomeCount] = useState(0)

   const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [selectedRoleUserAccountIds, setSelectedRoleUserAccountIds] = useState([]);
  const [accountIds, setaccountIds] = useState([]);
    useState(fetchProjects());
    useState(fetchRoles());
  let [userCount, setUserCount] = useState(1);
  const onSubmit = values => {
        console.log("values in edit",values);
    return values;

  };

  const handleAddButtonClick = () => {
    let value = userCount;
    setUserCount(value+1);
    // console.log(userCount)
    // setSomeCount(count => count +1);
  };

  const renderUserFields = () => {
    const userFields = [];
    let users = {}
    for (let i = 0; i < userCount; i++) {
      // users[<UserPicker lable="user" name={`user${i}`} text="Picker User" />] =   <TextField key={i} name={`name${i}`} label={`Say hello to user ${i + 1}:`} />
      userFields.push(
        
        <UserPicker lable="user" name={`user${i}`} text="Picker User" /> 
         
        // <TextField key={i} name={`name${i}`} label={`Say hello to user ${i + 1}:`} />

      );
    }


    return userFields;
  };

  async function fetchProjects() {
    try {
      console.log("entered fetchProjects")
      const response = await api.asUser().requestJira(route`/rest/api/3/project/search`, {
        headers: {
          'content-type': 'application/json'
        }
      });
      console.log("fetchProjects")
      const responseJson = await response.json();
      //const issueArray = responseJson.issues.map(obj => obj.key);
      setProjects(responseJson.values);
      //console.log("Projects:", responseJson.values);
      console.log("exit fetchProjects")
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    }
  
  async function fetchRoles() {
  // Inside fetchRoles function
//export const roleUsersJson = await roleUsersResponse.json();
//export const accountIds = roleUsersJson.actors.map((actor) => actor.actorUser.accountId);
    try {
      // Fetch roles API call
            console.log("entered fetchroles")
      const response = await api.asUser().requestJira(route`/rest/api/3/role`, {
        headers: {
          'content-type': 'application/json'
        }
      });
      console.log("fetchrole")
      const responseJson = await response.json();
      setRoles(responseJson);
      console.log("exit fetchrole")
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <Select
          label="Select Project"
          name="project" // Add the name prop
          value={project}
          onChange={(newValue) => setProject(newValue)}
        >
          <Option label="Select a project" value="" />
        {projects.map((proj) => (
          <Option key={proj.id} label={proj.name} value={proj.key} />
        ))}
      </Select>
      <Select
        label="Select Role"
        name="roles"
        value={roles}
        onChange={(newRoles) => setRoles(newRoles)}
      >
	<Option label='All' value='all' />
        {roles.map((role) => (
          <Option key={role.id} label={role.name} value={role.id} />
        ))}
      </Select>
      <DatePicker name="StartDate" label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
      <DatePicker name="EndDate" label="End Date" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
    </DashboardGadgetEdit>
  );
};


export default Edit;
