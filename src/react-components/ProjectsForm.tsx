import * as React from 'react';
import * as Firestore from "firebase/firestore"
import { IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { getCollection, updateDocument } from '../firebase';


interface Props {//interface is a TypeScript feature to define the shape of an object, and Props is a common name for defining props type for React components
  // Define any props for ProjectsPage if needed in the future
  projectsManager: ProjectsManager;//projectsManager is a prop of type ProjectsManager, this will be passed from parent component (here is from index.tsx) to ProjectsPage component
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>; // <-- thêm prop để component con cập nhật state của cha
}

export function ProjectsForm(props: Props) {
  //--- FIRESTORE PROJECTS COLLECTION REFERENCE ---
  const projectsCollection = getCollection<IProject>("/projects")//use the getCollection function from firebase/index.ts to get the collection reference (reuse the function in firebase/index.ts) 

  //--- FORM SUBMISSION HANDLERS (NEW PROJECT) ---
  //When the new project form is submitted, create a new project and close the modal
  const onFormSubmit = (e: React.FormEvent) => {
    const projectForm = document.getElementById("new-project-form")
    if (!(projectForm && projectForm instanceof HTMLFormElement)) {return}
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      //projectsCollection = Firestore.collection(firebaseDB, "/projects") as Firestore.CollectionReference<IProject>//reference to "projects" collection in Firestore database
      Firestore.addDoc(projectsCollection, projectData)//add the new project to Firestore database
      const project = props.projectsManager.newProject(projectData)// Create the new project and store it in "project" variable, and also add the new project to the list inside projectsManager
      //console.log(project)
      projectForm.reset()
      const modal = document.getElementById("new-project-modal")
      if (!(modal && modal instanceof HTMLDialogElement)) {return}
      modal.close()
    } catch (err) {
      alert(err)
    }
  }
  
  //--- EDIT PROJECT FORM SUBMISSION ---
  //When the edit project form is submitted, update the project and close the modal
  const onEditFormSubmit = async (e: React.FormEvent) => {
    const editProjectForm = document.getElementById("edit-project-form")
    if (!(editProjectForm && editProjectForm instanceof HTMLFormElement)) {return}
    e.preventDefault()
    const formData = new FormData(editProjectForm)
    const projectId = formData.get("projectId") as string | null
    if (!projectId) { alert("No projectId"); return }
    const project = props.projectsManager.getProject(projectId)
    if (!project) { alert("Project not found"); return }
    // update fields on the project instance
    project.name = formData.get("name") as string
    project.description = formData.get("description") as string
    project.userRole = formData.get("userRole") as UserRole
    project.status = formData.get("status") as ProjectStatus
    project.finishDate = new Date(formData.get("finishDate") as string)
    // reflect changes in state
    // gọi props.setProjects nếu được truyền từ cha
    props.setProjects?.([...props.projectsManager.list])
    // close modal
    const modal = document.getElementById("edit-project-modal")
    if (modal && modal instanceof HTMLDialogElement) modal.close()
    //update the project in Firestore database
    try {
      await updateDocument<Partial<IProject>>("/projects", projectId, { 
           name: project.name,
           description: project.description,
           userRole: project.userRole,
           status: project.status,
           finishDate: project.finishDate
       });
    } catch (err) {
      alert(err)
    }
  }
  
  //--- RENDERING ---
  return (
  <div className="page" id="projects-page" style={{ display: "flex" }}>
    <dialog id="new-project-modal">
      <form onSubmit={(e) => { onFormSubmit(e) }} id="new-project-form">
      <h2>New Project</h2>
      <div className="input-list">
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">apartment</span>Name
      </label>
      <input
      name="name"
      type="text"
      placeholder="What's the name of your project?"
      />
      <p
      style={{
        color: "gray",
        fontSize: "var(--font-sm)",
        marginTop: 5,
        fontStyle: "italic"
      }}
      >
      TIP: Give it a short name
      </p>
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">subject</span>Description
      </label>
      <textarea
      name="description"
      cols={30}
      rows={5}
      placeholder="Give your project a nice description! So people is jealous about it."
      defaultValue={""}
      />
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">person</span>Role
      </label>
      <select name="userRole">
      <option>Architect</option>
      <option>Engineer</option>
      <option>Developer</option>
      </select>
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">not_listed_location</span>
      Status
      </label>
      <select name="status">
      <option>Pending</option>
      <option>Active</option>
      <option>Finished</option>
      </select>
      </div>
      <div className="form-field-container">
      <label htmlFor="finishDate">
      <span className="material-icons-round">calendar_month</span>
      Finish Date
      </label>
      <input name="finishDate" type="date" />
      </div>
      <div
      style={{
        display: "flex",
        margin: "10px 0px 10px auto",
        columnGap: 10
      }}
      >
      <button type="button" style={{ backgroundColor: "transparent" }}>
      Cancel
      </button>
      <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
      Accept
      </button>
      </div>
      </div>
      </form>
    </dialog>
    
    <dialog id="edit-project-modal">
      <form onSubmit={(e) => { onEditFormSubmit(e) }} id="edit-project-form">
      <h2>Edit Project</h2>
      <div className="input-list">
      {/* hidden input to carry project id */}
      <input type="hidden" name="projectId" value="" />
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">apartment</span>Name
      </label>
      <input
      name="name"
      type="text"
      placeholder="What's the name of your project?"
      />
      <p
      style={{
        color: "gray",
        fontSize: "var(--font-sm)",
        marginTop: 5,
        fontStyle: "italic"
      }}
      >
      TIP: Give it a short name
      </p>
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">subject</span>Description
      </label>
      <textarea
      name="description"
      cols={30}
      rows={5}
      placeholder="Give your project a nice description! So people is jealous about it."
      defaultValue={""}
      />
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">person</span>Role
      </label>
      <select name="userRole">
      <option>Architect</option>
      <option>Engineer</option>
      <option>Developer</option>
      </select>
      </div>
      <div className="form-field-container">
      <label>
      <span className="material-icons-round">not_listed_location</span>
      Status
      </label>
      <select name="status">
      <option>Pending</option>
      <option>Active</option>
      <option>Finished</option>
      </select>
      </div>
      <div className="form-field-container">
      <label htmlFor="finishDate">
      <span className="material-icons-round">calendar_month</span>
      Finish Date
      </label>
      <input name="finishDate" type="date" />
      </div>
      <div
      style={{
        display: "flex",
        margin: "10px 0px 10px auto",
        columnGap: 10
      }}
      >
      <button type="button" style={{ backgroundColor: "transparent" }}>
      Cancel
      </button>
      <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
      Accept
      </button>
      </div>
      </div>
      </form>
    </dialog>
  </div>
  );
}
