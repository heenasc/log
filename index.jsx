/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext } from "@forge/ui";

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
      return values
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
    </DashboardGadgetEdit>
  );
}

export const runView = render(
  <View/>
);

export const runEdit = render(<Edit/>)
*/
//working
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker } from "@forge/ui";

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 && (
        <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />      
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/
//working close
// index.js
/*import ForgeUI, { useState, useEffect, DashboardGadget, DashboardGadgetEdit, render, Text, useProductContext, UserPicker,TextField } from "@forge/ui";
// Rest of your code...

import { fetchLogworkByUser } from "./api";


// index.js


// Rest of your code...

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(''); // Initialize logwork state with an empty string

  useEffect(() => {
    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork('');
        return;
      }

      const userName = gadgetConfiguration.User.join(", ");
      const logworkData = await fetchLogworkByUser(userName);
      setLogwork(logworkData || ''); // Ensure logworkData is not null or undefined before setting the state
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 && (
        <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
      )}
      {logwork && <Text content={`Logwork: ${logwork}`} />}
    </DashboardGadget>
  );
};

// Rest of your code...



const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
    	
      <UserPicker label="User" name="User" isMulti="true" />      
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);*/

/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (userName) => {
  try {
    console.log("Fetching logwork for user:", userName);
    //const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor=${userName}&fields=timetracking`);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${userName})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data); 
	  
    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData); // Log the API response to check the data
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json()); // Log the error response
    console.error("Error status:", error.status); // Log the error status
    return null;
  }
};


const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      const userName = gadgetConfiguration.User.join(", ");
      try {
        const logworkData = await fetchNumberOfIssues(userName);
        setLogwork(logworkData); // Set the logwork state once fetched
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null); // Set the logwork state to null if there was an error
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 && (
        <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
      )}
      {logwork !== null ? ( // Use strict equality check here
        <Text content={`Logwork: ${logwork}`} />
      ) : (
        <Text content="Fetching logwork..." />
      )}
    </DashboardGadget>
  );
};



const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />      
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);


*/
//above code gives all information without logwork only
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (username) => {
  try {
    console.log("Fetching logwork for user:", username);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  // Provide the username directly to fetch the logwork
  const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc92fb88b05653fa7d117e,62fc79ce142d0c981fcda12a"));
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 && (
        <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
      )}
      {logwork !== null ? ( // Use strict equality check here
        <Text content={`Logwork: ${logwork}`} />
      ) : (
        <Text content="Fetching logwork..." />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/
//above code gives multiple user logwork and this is what i required



/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (username) => {
  try {
    console.log("Fetching logwork for user:", username);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};



const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected user(s) from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.map(user => user).join(",");
      console.log("Selected Usernames:", selectedUsernames); // Add this line to log the selected usernames

      try {
        const logworkData = await fetchNumberOfIssues(selectedUsernames);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null);
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);


  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.map(user => user.displayName).join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};


const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);*/
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (username) => {
  try {
    console.log("Fetching logwork for user:", username);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected user(s) from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.map(user => user).join(",");
      console.log("Selected Usernames:", selectedUsernames);
      const logworkData = await fetchNumberOfIssues(selectedUsernames);

      try {
        const logworkData = await fetchNumberOfIssues(selectedUsernames);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null);
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.map(user => user.displayName).join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/
//above code is giving multiple log work but not showing i need to refere this one only
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, UserPicker, useState, useEffect, Fragment ,useProductContext} from "@forge/ui";
import api, { route } from "@forge/api";
import fetch from "node-fetch"; // Import node-fetch


const fetchNumberOfIssues = async (usernames) => {
  try {
    console.log("Fetching logwork for users:", usernames);
    //console.log('/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking');
    console.log(`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    //const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    console.log("Before API call");
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    console.log("After API call");
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};
const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);
  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected usernames from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.join(",");
      console.log("Selected Usernames:", selectedUsernames);

      try {
        const logworkData = await fetchNumberOfIssues(selectedUsernames);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null);
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <UserPicker label="User" name="User" isMulti={true} />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, UserPicker, useState, useEffect, Fragment ,useProductContext} from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (usernames) => {
  try {
    console.log("Fetching logwork for users:", usernames);
    //console.log('/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking');
    console.log(`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    //const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    console.log("Before API call");
       
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${usernames})&fields=timetracking`);
    console.log("After API call");
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc92fb88b05653fa7d117e,62fc79ce142d0c981fcda12a"));
  const { extensionContext: { gadgetConfiguration } } = useProductContext(); 
  //const { extensionContext: { gadgetConfiguration } } = ForgeUI.useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected usernames from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.join(",");
      console.log("Selected Usernames:", selectedUsernames);

      try {
        const logworkData = await fetchNumberOfIssues(selectedUsernames);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null);
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <UserPicker label="User" name="User" isMulti={true} />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);*/
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, UserPicker, useState, useEffect, Fragment, useProductContext } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchLogworkForUser = async (userIds) => {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${userIds})&fields=timetracking`);
    const data = await response.json();

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const fetchUserDetails = async (userIds) => {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/user?accountId=${userIds}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    async function fetchAndSetLogwork() {
      if (!gadgetConfiguration || !gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      try {
        console.log("Selected Users:", gadgetConfiguration.User);
        const selectedUserIds = gadgetConfiguration.User.map(user => user.accountId).join(",");
        console.log("Selected User IDs:", selectedUserIds);

        // Fetch user details
        const userDetails = await fetchUserDetails(selectedUserIds);
        console.log("User Details:", userDetails);

        const logworkData = await fetchLogworkForUser(selectedUserIds);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching and setting logwork:", error);
        setLogwork(null);
      }
    }

    fetchAndSetLogwork();
  }, [gadgetConfiguration]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration && gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.map(user => user.displayName).join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <UserPicker label="User" name="User" isMulti={true} />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);
export const runEdit = render(<Edit />);*/

/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (username) => {
  try {
    console.log("Fetching logwork for user:", username);
    console.log("Fetching logwork for user:", `/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  const [logwork, setLogwork] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected user(s) from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.map(user => user).join(",");
      console.log("Selected Usernames:", selectedUsernames);
      const logworkData = await fetchNumberOfIssues(selectedUsernames);

      try {
        const logworkData = await fetchNumberOfIssues(selectedUsernames);
        setLogwork(logworkData);
      } catch (error) {
        console.error("Error fetching logwork:", error);
        setLogwork(null);
      }
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);

  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.name || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 ? (
        <Fragment>
          <Text content={`Selected User(s): ${gadgetConfiguration.User.map(user => user.displayName).join(", ")}`} />
          {logwork !== null ? (
            <Text content={`Logwork: ${logwork}`} />
          ) : (
            <Text content="Fetching logwork..." />
          )}
        </Fragment>
      ) : (
        <Text content="No User Selected" />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="name" label="Say hello to:" />
      <UserPicker label="User" name="User" isMulti="true" />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/
//below is last one with different user selected
/*import ForgeUI, { DashboardGadget, DashboardGadgetEdit, render, Text, TextField, useProductContext, UserPicker, useState, useEffect, Fragment } from "@forge/ui";
import api, { route } from "@forge/api";

const fetchNumberOfIssues = async (username) => {
  try {
    console.log("Fetching logwork for user:", username);
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=worklogAuthor in (${username})&fields=timetracking`);
    const data = await response.json();
    console.log("API response:", data);

    let totalSeconds = 0;
    if (data && data.issues) {
      data.issues.forEach((issue) => {
        if (issue.fields && issue.fields.timetracking) {
          totalSeconds += issue.fields.timetracking.timeSpentSeconds;
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const logworkData = `${hours}h ${minutes}m`;

    console.log("API Response:", logworkData);
    return logworkData;
  } catch (error) {
    console.error("Error fetching logwork:", error);
    console.error("Error response:", await error.response.json());
    console.error("Error status:", error.status);
    return null;
  }
};

const View = () => {
  // Provide the username directly to fetch the logwork
  //62fc79ce142d0c981fcda12a-heena.hc
  //62fc92fb88b05653fa7d117e-hchaudhary
  //63a54ab148b367d78a159bd2-dikshith
  
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc92fb88b05653fa7d117e,62fc79ce142d0c981fcda12a"));//heena.hc ,hchaudhary
  const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc92fb88b05653fa7d117e")); //hchaudhary
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc79ce142d0c981fcda12a")); //heena.hc
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("63a54ab148b367d78a159bd2")); //dikshith
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc79ce142d0c981fcda12a,63a54ab148b367d78a159bd2")); //heena.hc,dikshith
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc92fb88b05653fa7d117e,63a54ab148b367d78a159bd2")); //hchaudhary,dikshith
  //const [logwork, setLogwork] = useState(async () => await fetchNumberOfIssues("62fc79ce142d0c981fcda12a,62fc92fb88b05653fa7d117e,63a54ab148b367d78a159bd2")); //hchaudhary,dikshith,heena.hc
  const { extensionContext: { gadgetConfiguration } } = useProductContext();
  
  useEffect(() => {
    console.log("useEffect triggered");
    console.log("gadgetConfiguration.User:", gadgetConfiguration.User);

    async function fetchLogwork() {
      if (!gadgetConfiguration.User || gadgetConfiguration.User.length === 0) {
        setLogwork(null);
        return;
      }

      // Get the selected user(s) from the UserPicker field
      const selectedUsernames = gadgetConfiguration.User.map(user => user).join(",");
      console.log("Selected Usernames:", selectedUsernames);
      //const logworkData= useState(async () => await fetchNumberOfIssues(selectedUsernames));
      //const logworkData = await fetchNumberOfIssues(selectedUsernames);
    }

    fetchLogwork();
  }, [gadgetConfiguration.User]);
  
  return (
    <DashboardGadget>
      <Text
        content={`Hello ${gadgetConfiguration.Time || "world"}.`}
      />
      {gadgetConfiguration.User && gadgetConfiguration.User.length > 0 && (
        <Text content={`Selected User(s): ${gadgetConfiguration.User.join(", ")}`} />
      )}
      {logwork !== null ? ( // Use strict equality check here
        <Text content={`Logwork: ${logwork} ,3h 20m`} />
      ) : (
        <Text content="Fetching logwork..." />
      )}
    </DashboardGadget>
  );
};

const Edit = () => {
  const onSubmit = values => {
    return values;
  };

  return (
    <DashboardGadgetEdit onSubmit={onSubmit}>
      <TextField name="Time" label="Time" />
      <UserPicker label="User" name="User" isMulti="true" />
    </DashboardGadgetEdit>
  );
};

export const runView = render(<View />);

export const runEdit = render(<Edit />);
*/


import ForgeUI, { render } from "@forge/ui";
import View from "./view";
import Edit from "./edit";

export const runView = render(<View />);
export const runEdit = render(<Edit />);


