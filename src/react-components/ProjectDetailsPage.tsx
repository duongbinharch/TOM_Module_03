import * as React from 'react';
import * as Router from "react-router-dom";
import { ProjectsManager } from '../classes/ProjectsManager';   
import { ThreeViewer } from './ThreeViewer';
import { deleteDocument } from '../firebase';
import { TodoList } from './TodoList';

interface Props {//interface is a TypeScript feature to define the shape of an object, and Props is a common name for defining props type for React components
  // Define any props for ProjectsPage if needed in the future
  projectsManager: ProjectsManager;
}


export function ProjectDetailsPage(props : Props) {
  const routeParams = Router.useParams<{ id: string }>()//this hook is used to access the dynamic parameters from the current route, in this case we expect an "id" parameter
  if (!routeParams.id) {return(<p>Project ID is need to see this page</p>)}// if no id is provided in the route, we return early and render nothing
  const project = props.projectsManager.getProject(routeParams.id) //get the project with ID "1" from the projectsManager instance passed as a prop
  if (!project) {return(<p>The project with ID {routeParams.id} was not found</p>)}// if no project is found with the given ID, we return early and render nothing
  
  
  const navigateTo = Router.useNavigate();//Hook to get the navigate function for programmatic navigation
  //Delete project event handler, onProjectDeleted will be triggered when a project is deleted
  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("/projects", id);//wait for deleteDocument function to delete the project from Firestore database, cloud
    navigateTo("/");//After deleting the project, navigate back to the home page
  }//Trigger the event handler will pass the project ID to deleteDocument function to delete the project from Firestore database, cloud
  
  
  
  
  //Pass the Edit button to ProjectModal to edit the project details
  const editButton = (
    <Router.Link to={`/#edit-project-modal?projectId=${project.id}`} key={project.id} className="btn-secondary">
    <p>Edit</p>
    <span className="material-icons-round">edit</span>
    </Router.Link>
  )
  /*Archived: 
  <button className="btn-secondary"><p style={{ width: "100%" }}>Edit</p>
  </button>
  */
  
  
  //Render the project details page
  return (
    <div className="page" id="project-details">
    <header>
    <div>
    <h2 data-project-info="name">{project.name}</h2>
    <p style={{ color: "#969696" }}>{project.description}</p>
    </div>
    <button onClick={() => props.projectsManager.deleteProject(project.id)} style={{backgroundColor: "red"}}> Delete project</button>
    </header>
    <div className="main-page-content">
    <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
    <div className="dashboard-card" style={{ padding: "30px 0" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px 30px",
        marginBottom: 30
      }}
    >
    <p
    style={{
      fontSize: 20,
      backgroundColor: "#ca8134",
      aspectRatio: 1,
      borderRadius: "100%",
      padding: 12
    }}
    >
    HC
    </p>
    {editButton}
    </div>  
    <div style={{ padding: "0 30px" }}>
    <div>
    <h5>{project.name}</h5>
    <p>{project.description}</p>
    </div>
    <div
    style={{
      display: "flex",
      columnGap: 30,
      padding: "30px 0px",
      justifyContent: "space-between"
    }}
    >
    <div>
    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
    Status
    </p>
    <p>{project.status}</p>
    </div>
    <div>
    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
    Cost
    </p>
    <p>$ {project.cost}</p>
    </div>
    <div>
    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
    Role
    </p>
    <p>{project.userRole}</p>
    </div>
    <div>
    <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
    Finish Date
    </p>
    <p>{project.finishDate.toDateString()}</p>
    </div>
    </div>
    <div
    style={{
      backgroundColor: "#404040",
      borderRadius: 9999,
      overflow: "auto"
    }}
    >
    <div
    style={{
      width: `${project.progress * 100}%`,
      backgroundColor: "green",
      padding: "4px 0",
      textAlign: "center"
    }}
    >
    {project.progress * 100}%
    </div>
    </div>
    </div>
    </div>
    <div className="dashboard-card" style={{ flexGrow: 1 }}>
      <div
        style={{
          padding: "20px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
        >
        <h4>To-Do</h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            columnGap: 20
          }}
          >
          <div
            style={{ display: "flex", alignItems: "center", columnGap: 10 }}
            >
            <span className="material-icons-round">search</span>
            <input
              type="text"
              placeholder="Search To-Do's by name"
              style={{ width: "100%" }}
            />
          </div>
          <span className="material-icons-round">add</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px 30px",
          rowGap: 20
        }}
      >
        <div className="todo-item">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            >
            <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
            <span
            className="material-icons-round"
            style={{
              padding: 10,
              backgroundColor: "#686868",
              borderRadius: 10
            }}
            >
            construction
            </span>
            <p>Make anything here as you want, even something longer.</p>
            </div>
            <p style={{ textWrap: "nowrap", marginLeft: 10 }}>Fri, 20 sep</p>
          </div>
        </div>
      </div>
    </div>
    </div>
    <ThreeViewer />
    </div>
    </div>
  );
}