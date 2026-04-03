import { IProject, Project } from "./Project"

// Update the ProjectManager with the import data
type ImportedProject = IProject & {
  id?: string
  cost?: number
  progress?: number
}

export class ProjectsManager {
  list: Project[] = []// Array to hold Project instances, list: is a property of ProjectsManager class
  onProjectCreated = (project : Project) => {} // this is an event handler that will be called when a new project is created, it takes the created project as parameter
  onProjectDeleted = (id: string) => {} // this is an event handler that will be called when a project is deleted, it takes the id of the deleted project as parameter

  /*constructor() {//This below is just for testing purposes, to have at least one project when the app starts
    const project = this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date()
    })
  }*/

  filterProjects(value: string) {
    const filteredProjects = this.list.filter((project) => {//why use this.list.filter, because we want to filter the original full list of projects from projectsManager, not the already filtered projects in state
            return project.name.includes(value)//filter projects by name containing the search value, why use includes (to check if a string contains a specified substring)
        })//.filter is an array method that creates a new array with all elements that pass the test implemented by the provided function
        //Cách hoạt động của .filter: với mỗi phần tử project, nếu predicate trả true thì project đó được giữ trong mảng kết quả; nếu false thì bị loại. Kết quả của .filter là một mảng các project (Project[]), không phải mảng boolean.
    return filteredProjects
  }

  newProject(data: IProject, id?: string) {//This is a method to create a new project
    const projectNames = this.list.map((project) => { // (project) => { ... } is an arrow function
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data, id) // Create a new Project instance
    this.list.push(project)	// Important: we add the new project to the list, this.list means the list property of the ProjectsManager instance
    this.onProjectCreated(project)// Trigger the event handler
    return project
  }

  
  getProject(id: string) {//This is a method to get a project by its ID
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }
  
  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return }
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
    this.onProjectDeleted(id) // Trigger the event handler
  }
  
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2) //this.list is an array of Project instances, "this" means ProjectsManager instance 
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json` // Ensure the file name ends with .json
    a.click()
    URL.revokeObjectURL(url)
  }
  
  importFromJSON() {
    return new Promise<Project[]>((resolve) => {
      const importedProjects: Project[] = []
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'

      input.addEventListener('change', () => {
        const filesList = input.files
        if (!filesList || filesList.length === 0) {
          resolve([])
          return
        }

        const reader = new FileReader()
        reader.addEventListener("load", () => {
          try{
            const json = reader.result
            if (!json) { 
              resolve([])
              return 
            }

            const parsed = JSON.parse(json as string) 
            const projects = Array.isArray(parsed) ? parsed as ImportedProject[] : []

            for (const imported of projects) {
              try {
                const normalized: IProject = {
                  name: imported.name,
                  description: imported.description,
                  status: imported.status,
                  userRole: imported.userRole,
                  finishDate: imported.finishDate instanceof Date
                    ? imported.finishDate
                    : new Date(imported.finishDate),
                }

                const project = this.newProject(normalized, imported.id)
                if (typeof imported.cost === "number") project.cost = imported.cost
                if (typeof imported.progress === "number") project.progress = imported.progress
                importedProjects.push(project)
              } catch (error) {
                // Skip invalid or duplicated projects and continue importing the rest.
              }
            }

            resolve(importedProjects)
          } catch (error) {
            resolve([])
          }
        })

        reader.readAsText(filesList[0])
      })

      input.click()
    })
  }
}