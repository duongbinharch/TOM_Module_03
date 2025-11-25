//Import React and ReactDOM libraries to use React components and render them to the DOM
import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"

import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/ProjectsPage"
import { ProjectDetailsPage } from "./react-components/ProjectDetailsPage"
import {ProjectsManager} from "./classes/ProjectsManager"
const projectsManager = new ProjectsManager()

// Create the root element for the React app
const rootElement = document.getElementById("app") as HTMLDivElement //get the div with id "app" from the HTML file
const appRoot = ReactDOM.createRoot(rootElement)//Create a React root using syntax ReactDOM.createRoot()

// Render the Sidebar component inside the React root
/* Lưu Syntax JSX element truyền vào route:
      element={...} — nhúng một biểu thức JS trong JSX. 
      <Component prop={...}/> — là một React element (một instance), không phải chỉ là kiểu component.
      Tương đương với React.createElement(Component, { prop: value }).*/
appRoot.render(
  <>
    <Router.BrowserRouter>
      <Sidebar />
      <Router.Routes>
        <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager}/>} />
        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager}/>} />
      </Router.Routes>
    </Router.BrowserRouter>
  </>
)


