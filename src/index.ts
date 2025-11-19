import * as THREE from "three" // Import the entire three.js library
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js" //Graphical User Interface for the 3D viewer which helps to manipulate objects in the scene
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js" //Found the difference with the tutorial that need to add .js at the end of the path 
//import { OrbitControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js"
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js"

import { IProject, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"

function showModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function closeModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
} else {
  console.warn("New projects button was not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
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
      const project = projectsManager.newProject(projectData)
      console.log(project)
      projectForm.reset()
      closeModal("new-project-modal")
    } catch (err) {
      alert(err)
    }
  })
} else {
	console.warn("The project form was not found. Check the ID!")
}

const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

//ThreeJS viewer
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0xaaaaaa)//Set a light gray background color for the scene

const viewerContainer = document.getElementById("viewer-container") as HTMLElement//Get the div container from the HTML file

/* This is the initial way to get the dimensions of the container
//Get the dimensions of the container to set the aspect ratio of the camera and the size of the renderer
const containerDimensions = viewerContainer.getBoundingClientRect()//.getBoudingClientRect() is a method that returns the size of an element and its position relative to the viewport. It is from the DOM API.
const aspectRatio = containerDimensions.width / containerDimensions.height
*/


//PerspectiveCamera is a class in three.js that represents a camera with perspective projection. It simulates the way the human eye sees the world, where objects that are farther away appear smaller.
//The constructor takes four parameters: field of view (in degrees), aspect ratio, near clipping plane, and far clipping plane.
const camera = new THREE.PerspectiveCamera(75)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})//WebGLRenderer is a class in three.js that allows us to render 3D graphics using WebGL.
viewerContainer.append(renderer.domElement)//The domElement property of the WebGLRenderer instance is a canvas element that the renderer uses to display the rendered scene. By appending it to the viewerContainer, we are adding the canvas to the HTML document so that it becomes visible on the webpage.
//Initial size of the renderer
//renderer.setSize(containerDimensions.width, containerDimensions.height)//Use this method to set the size of the renderer to match the dimensions of the container. This ensures that the rendered scene fits perfectly within the viewerContainer.

function resizeViewer() {
  const containerDimensions = viewerContainer.getBoundingClientRect()//Get the new dimensions of the container
  renderer.setSize(containerDimensions.width, containerDimensions.height)//Update the size of the renderer
  const aspectRatio = containerDimensions.width / containerDimensions.height
  camera.aspect = aspectRatio//Update the aspect ratio of the camera
  camera.updateProjectionMatrix()//Call this method to update the camera's projection matrix after changing its properties.
 }

window.addEventListener("resize", resizeViewer)//Add an event listener to the window object that listens for the resize event. When the event is triggered, the resizeViewer function is called to update the size of the renderer and the aspect ratio of the camera.

//Call the function once to set the initial size, this resizeVierwer() function is called only when the event "resize" is triggered so for initialization we need to call it once
resizeViewer()

//Creating a cube and adding it to the scene
const geometry = new THREE.BoxGeometry()//BoxGeometry is a class in three.js that represents a box-shaped 3D geometry. It is defined by its width, height, and depth. By default, the BoxGeometry constructor creates a box with dimensions of 1 unit in each direction (width, height, depth).
const material = new THREE.MeshStandardMaterial()//by default, the MeshStandardMaterial constructor creates a material with a white color (0xffffff), full opacity (1.0), and no metalness or roughness (both set to 0.5).  
const cube = new THREE.Mesh(geometry, material)

//scene.add(cube)

const directionalLight = new THREE.DirectionalLight()
const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.5

//scene.add(cube, directionalLight, ambientLight)

scene.add(directionalLight, ambientLight) //

//OrbitControls allow the camera to orbit around a target by mouse interaction.
const cameraControls = new OrbitControls(camera, viewerContainer)


//Function that will be called on each frame FPS 
function renderScene() {
  //Camera shoting the scene afte something has been added to it
  renderer.render(scene, camera)//The render method of the WebGLRenderer instance is called to render the scene from the perspective of the camera. This method draws the 3D graphics onto the canvas element.
  //renderer.render(scene, camera) //Set of the scene and the camera to be rendered
  requestAnimationFrame(renderScene)
}
renderScene()//Initial call to the function to start the rendering loop

//Helpers
const axes = new THREE.AxesHelper()//The AxesHelper class is a built-in helper class in three.js that creates a visual representation of the coordinate axes in a 3D scene. It is useful for debugging and understanding the orientation of objects in the scene.
const grid = new THREE.GridHelper()//The GridHelper class is a built-in helper class in three.js that creates a visual representation of a grid in a 3D scene. It is useful for providing a reference plane and helping with the alignment of objects in the scene.
//Change the grid color and make it transparent
grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#808080")
//Add the axes and the grid to the scene
scene.add(axes, grid)

const gui = new GUI() //Create a new GUI instance
//Control the Cube
const cubeControls = gui.addFolder("Cube")//Create a folder in the GUI for the cube controls
cubeControls.add(cube.position, "x", -10, 10, 0.1)//Add a control to the GUI to manipulate the x position of the cube, with a range from -10 to 10 and a step of 0.1
cubeControls.add(cube.position, "y", -10, 10, 0.1)//Add a control to the GUI to manipulate the y position of the cube, with a range from -10 to 10 and a step of 0.1
cubeControls.add(cube.position, "z", -10, 10, 0.1)
cubeControls.add(cube, "visible")//Add a control to the GUI to toggle the visibility of the cube
cubeControls.add(cube.material, "wireframe")//Add a control to the GUI to toggle the wireframe mode of the cube's material
cubeControls.addColor(cube.material, "color")//Add a control to the GUI to change the color of the cube's material
//Control the Lights
const lightControls = gui.addFolder("Lights")//Create a folder in the GUI for the light controls
lightControls.add(directionalLight.position, "x", -10, 10, 0.1)
lightControls.add(directionalLight.position, "y", -10, 10, 0.1)
lightControls.add(directionalLight.position, "z", -10, 10, 0.1)
lightControls.add(directionalLight, "intensity", 0, 2, 0.1)
lightControls.addColor(directionalLight, "color")
lightControls.add(ambientLight, "intensity", 0, 2, 0.1)
lightControls.addColor(ambientLight, "color")

//load a 3D model in OBJ format
const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader()

mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
  materials.preload()//Preload the materials before applying them to the mesh
  objLoader.setMaterials(materials)//Set the materials to be used by the OBJLoader instance when loading OBJ files.
  objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
    scene.add(mesh)//Add the loaded mesh to the scene
  })
})
