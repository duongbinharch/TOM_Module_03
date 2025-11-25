import * as React from 'react';
import * as Router from "react-router-dom";
import * as Firestore from "firebase/firestore";
import { IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';   
import { ProjectCard } from './ProjectCard';
import { SearchBox } from './SearchBox';
import { ProjectsForm } from './ProjectsForm';
//import { firebaseDB } from '../firebase'; has been replaced by getCollection function and firestoreDB in firebase/index.ts
import { getCollection } from '../firebase';
import { updateDocument } from '../firebase';

interface Props {//interface is a TypeScript feature to define the shape of an object, and Props is a common name for defining props type for React components
  // Define any props for ProjectsPage if needed in the future
  projectsManager: ProjectsManager;//projectsManager is a prop of type ProjectsManager, this will be passed from parent component (here is from index.tsx) to ProjectsPage component
}
// FIRESTORE > COLLECTION : Get the collection reference for "projects" collection in Firestore
const projectsCollection = getCollection<IProject>("/projects")//use the getCollection function from firebase/index.ts to get the collection reference (reuse the function in firebase/index.ts)

export function ProjectsPage(props : Props) {//this is start of mounting ProjectsPage component //Props is the type of props parameter, we define it above. 'props' is an object that holds all the props passed to ProjectsPage component
  //const [projectsManager] = React.useState(new ProjectsManager())//React.useState is used to create a stable instance of ProjectsManager that persists across re-renders, updates or changes to projectsManager won't trigger re-renders
  //React.useState is a React hook that allows functional components to have state variables, meaning the component can remember values between renders and update the UI when those values change
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)//projectManager.list is from ProjectsManager class, that is a list inside ProjectsManager to hold Project instances
  props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.list])}
  
  //const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)

  /*--- FIRESTORE PROJECTS IMPORTING ---*/
  const getFirestoreProjects =  async () => { //async for using await inside the function
    //const projectsCollection = Firestore.collection(firebaseDB, "/projects") as Firestore.CollectionReference<IProject>//reference to "projects" collection in Firestore database
    const firebaseProjects = await Firestore.getDocs(projectsCollection)  //promise return meaning it will complete in the future and need to use await to get the result
    for (const doc of firebaseProjects.docs) {//loop through each document in the collection
      const data = doc.data()//get the data of the document
      //console.log("Firestore project data:", data)}
      const project: IProject = {
        ...data,//spread operator to copy all properties from data object to project object
        finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate()//convert Firestore Timestamp to JavaScript Date object
      }
      //create a new Project instance using the data from Firestore
      try {
        props.projectsManager.newProject(project, doc.id)//use doc.id from Firestore as the project ID to avoid duplicate IDs
      } catch (err) {
        console.warn("Error importing project from Firestore:", err)
      }//assigment here, since the error will happend since when go back to the project page the project name is already in use
      //setProjects([...props.projectsManager.list])//update the projects state with the latest list from projectsManager after importing from Firestore,
    }
  }
  React.useEffect(() => {
    getFirestoreProjects()
    /*--- Why do we need to call this function inside useEffect?  (Explaiednation below)
    Because we only want to fetch the projects from Firestore when the component mounts for the first time, not on every render. 
    If we call it directly in the component body, it would run on every render, causing unnecessary network requests and potential infinite loops.
    ---*/
  },[])
  /*--- PROJECT CARDS RENDERING (Explaiednation below)
  Giải thích đoạn code dưới đây:
  Đầu tiên projects.map là một phương thức của mảng trong JavaScript, nó sẽ lặp qua từng phần tử trong mảng projects và áp dụng một hàm cho mỗi phần tử đó, kết quả của hàm sẽ được thu thập lại thành một mảng mới.
  Trong trường hợp này, mỗi phần tử trong mảng projects đại diện cho một đối tượng project.
  Hàm được áp dụng cho mỗi project sẽ trả về một thành phần React Router Link, với thuộc tính to được đặt thành đường dẫn đến trang chi tiết của project đó (ví dụ: /project/123 nếu project.id là 123).
  Bên trong Link, chúng ta sử dụng thành phần ProjectCard để hiển thị thông tin của project. Chúng ta truyền đối tượng project làm prop cho ProjectCard.
  Chúng ta cũng đặt thuộc tính key của Link thành project.id để giúp React theo dõi các phần tử trong danh sách một cách hiệu quả hơn.
  ---*/
  const projectCards = projects.map((project) => {//reminder that .map is a method to transform each element in an array into a new element, here we transform each project into a ProjectCard component
    return (//we pass project as a prop to ProjectCard component (method to pass props from parent component to child component), and also set a unique key using project.id
      <Router.Link to={`/project/${project.id}`} key={project.id}>
      <ProjectCard project={project}/> 
      </Router.Link>
    )
  })
  /*--- LOGGING PROJECTS STATE UPDATES ---*/
  React.useEffect(() => {
    console.log("Projects state updated", projects)
  }, [projects])
  
  /*--- NEW PROJECT FORM SUBMISSION ---*/
  //Handle the form submission to create a new project
  //When the "New Project" button is clicked, open the new project modal
  const onNewProjectClick = () => {
    const modal = document.getElementById("new-project-modal")
    if (!(modal && modal instanceof HTMLDialogElement)) {return}
    modal.showModal()
  }
  //--- NEW PROJECT FORM SUBMISSION HANDLERS --- has been immigrated to ProjectsForm.TSX---/

  //--- EDIT PROJECT FORM OPENING ---/
  //Handle opening the edit project modal when the URL hash changes
  const location = Router.useLocation();
  React.useEffect(() => {
    // Check if the URL hash indicates to open the edit project modal
    if(location.hash.startsWith("#edit-project-modal")) {
      // parse query params after the hash, e.g. "#edit-project-modal?projectId=123"
      const parts = location.hash.split("?");
      const query = parts[1] ?? "";
      const params = new URLSearchParams(query);
      const projectId = params.get("projectId");
      
      const modal = document.getElementById("edit-project-modal")
      if (!(modal && modal instanceof HTMLDialogElement)) {return}
      
      // If projectId found, fill the edit form fields
      if (projectId) {
        const project = props.projectsManager.getProject(projectId);
        const editForm = document.getElementById("edit-project-form") as HTMLFormElement | null;
        if (project && editForm) {
          (editForm.elements.namedItem("projectId") as HTMLInputElement | null)!.value = project.id;
          (editForm.elements.namedItem("name") as HTMLInputElement | null)!.value = project.name;
          (editForm.elements.namedItem("description") as HTMLTextAreaElement | null)!.value = project.description;
          (editForm.elements.namedItem("userRole") as HTMLSelectElement | null)!.value = project.userRole;
          (editForm.elements.namedItem("status") as HTMLSelectElement | null)!.value = project.status;
          // set date in yyyy-mm-dd
          (editForm.elements.namedItem("finishDate") as HTMLInputElement | null)!.value = project.finishDate.toISOString().slice(0,10);
        }
      }
      modal.showModal()
    }
  }, [location]);

  //--- EDIT PROJECT FORM SUBMISSION --- has been immigrated to ProjectsForm.TSX ---/
  
  /*--- EXPORT & IMPORT PROJECTS ---*/
  //Handle import/export projects
  const onExportProject = () => {
    props.projectsManager.exportToJSON()
  }
  const onImportProject = () => {
    props.projectsManager.importFromJSON()
  }
  
  /*--- SEARCH PROJECTS ---*/
  //This function is will help to filter projects based on search value from SearchBox component then update the projects state, so the displayed projectCards will be updated accordingly
  const onProjectSearch = (value: string) => {
    setProjects(props.projectsManager.filterProjects(value))//new filtered list of projects is set to projects state, thay thế cho setProjects([...props.projectsManager.list]) phía trên và 'projects' state sẽ chỉ chứa các project khớp với giá trị tìm kiếm, hay update theo
  }

  /*--- RENDER ---*/
  //Render the ProjectsPage component
  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
    
    <header>
    <h2>Projects</h2>
    <SearchBox onChange={(value) => onProjectSearch(value)}/>
    <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
    <span
    id="import-projects-btn"
    className="material-icons-round action-icon"
    onClick={onImportProject}
    >
    file_upload
    </span>
    <span
    id="export-projects-btn"
    className="material-icons-round action-icon"
    onClick={onExportProject}
    >
    file_download
    </span>
    <button onClick={onNewProjectClick} id="new-project-btn">
    <span className="material-icons-round">add</span>New Project
    </button>
    </div>
    </header>
    
    {
      projects.length > 0 ?<div id="projects-list"> {projectCards}</div> : <p style={{ marginTop: 20 }}>No projects found.</p>
    }

    <ProjectsForm projectsManager={props.projectsManager} setProjects={setProjects} />
    </div>
  );
}