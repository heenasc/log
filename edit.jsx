import ForgeUI, { DashboardGadgetEdit, UserPicker, useState, useEffect, TextField, DatePicker, Select, Option } from "@forge/ui";
import api, { route } from "@forge/api";

const Edit = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [project, setProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [selectedRoleUserAccountIds, setSelectedRoleUserAccountIds] = useState([]);
  
    useState(fetchProjects());
    useState(fetchRoles());

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
      if (responseJson.length > 0) {
      const roleId = responseJson[0].id; // Get the ID of the default selected role
      const roleUsersResponse = await api.asUser().requestJira(route`/rest/api/3/role/${roleId}`);
      const roleUsersJson = await roleUsersResponse.json();
      const accountIds = roleUsersJson.actors.map((actor) => actor.actorUser.accountId);
      setSelectedRoleUserAccountIds(accountIds);
      console.log("accountIds",accountIds);
    }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }
  
  
  const onSubmit = async (values) => {
  console.log("onsumit call");
    try {
      return values;
      console.log("values",values);
      api.store.onGadgetConfigurationChange((configuration) => {
        configuration.StartDate = startDate;
        configuration.EndDate = endDate;
        configuration.Project = project;
        configuration.Projects = projects;
        configuration.Roles = roles;
        configuration.SelectedRoleUserAccountIds = selectedRoleUserAccountIds; // Add this line
        console.log("Selected Project role:", roles); 
        console.log("Selected Project Key:", projects); 
        configuration.SelectedUsers = selectedRoleUserAccountIds;
        console.log("Selected users", SelectedUsers); 
        console.log("Selected Users in onSubmit:", configuration);
        return configuration;
      });

      return "Data saved successfully"; // Return a valid child element or a string
    } catch (error) {
      console.error("Error on form submission:", error);
      return "Error occurred while saving data"; // Return a valid child element or a string
    }
  };

        console.log("Selected Users in onSubmit:", configuration);
                console.log("Selected Users in onSubmit:", values);
  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <DatePicker name="StartDate" label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
      <DatePicker name="EndDate" label="End Date" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
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
        isMulti={true} // Allow selecting multiple roles
        value={roles}
        onChange={(newRoles) => setRoles(newRoles)}
      >
        {roles.map((role) => (
          <Option key={role.id} label={role.name} value={role.id} />
        ))}
      </Select>
    </DashboardGadgetEdit>
  );
};

export default Edit;


