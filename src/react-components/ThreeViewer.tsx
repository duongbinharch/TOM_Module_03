import * as React from "react";

//Import ThreeJS libraries for 3D viewer
import * as THREE from "three" // Import the entire three.js library

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js" //Graphical User Interface for the 3D viewer which helps to manipulate objects in the scene
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js" //Found the difference with the tutorial that need to add .js at the end of the path 
//import { OrbitControls } from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js';

//import the OBJLoader 
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
//import the GLTFLoader from the examples/jsm/loaders folder of the three.js library
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export function ThreeViewer() {
  //Declare variables for ThreeJS components, these variables will be initialized in the setViewer function
  //Cầm declare trước vì nếu không các biến này sẽ chỉ có scope trong hàm setViewer, không thể truy cập từ các hàm khác như renderScene
  //To avoid undefined errors, shadowing the variables here
  let scene: THREE.Scene | null
  let mesh: THREE.Object3D | null
  let renderer: THREE.WebGLRenderer | null
  let cameraControls: OrbitControls | null
  let camera: THREE.PerspectiveCamera | null
  let axes: THREE.AxesHelper | null
  let grid: THREE.GridHelper | null
  let directionalLight: THREE.DirectionalLight | null
  let ambientLight: THREE.AmbientLight | null
  let mtlLoader: MTLLoader | null
  let objLoader: OBJLoader | null

  //Function to set up the ThreeJS viewer
  const setViewer = () => {
    //All the ThreeJS code will go here
    //ThreeJS viewer
    scene = new THREE.Scene()//Create a new scene where all the 3D objects will be added
    const viewerContainer = document.getElementById("viewer-container") as HTMLElement//Get the div container from the HTML file
  
    //PerspectiveCamera is a class in three.js that represents a camera with perspective projection. It simulates the way the human eye sees the world, where objects that are farther away appear smaller.
    //The constructor takes four parameters: field of view (in degrees), aspect ratio, near clipping plane, and far clipping plane.
    camera = new THREE.PerspectiveCamera(75)
    camera.position.z = 5
  
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})//WebGLRenderer is a class in three.js that allows us to render 3D graphics using WebGL.
    viewerContainer.append(renderer.domElement)//The domElement property of the WebGLRenderer instance is a canvas element that the renderer uses to display the rendered scene. By appending it to the viewerContainer, we are adding the canvas to the HTML document so that it becomes visible on the webpage.
    //Initial size of the renderer
    //renderer.setSize(containerDimensions.width, containerDimensions.height)//Use this method to set the size of the renderer to match the dimensions of the container. This ensures that the rendered scene fits perfectly within the viewerContainer.
  
    function resizeViewer() {
      const containerDimensions = viewerContainer.getBoundingClientRect()//Get the new dimensions of the container
      if (!renderer || !camera) { return }//Check if the renderer and camera are initialized
      renderer.setSize(containerDimensions.width, containerDimensions.height)//Update the size of the renderer
      const aspectRatio = containerDimensions.width / containerDimensions.height
      camera.aspect = aspectRatio//Update the aspect ratio of the camera
      camera.updateProjectionMatrix()//Call this method to update the camera's projection matrix after changing its properties.
    }
  
    window.addEventListener("resize", resizeViewer)//Add an event listener to the window object that listens for the resize event. When the event is triggered, the resizeViewer function is called to update the size of the renderer and the aspect ratio of the camera.
  
    //Call the function once to set the initial size, this resizeVierwer() function is called only when the event "resize" is triggered so for initialization we need to call it once
    resizeViewer()
  
    directionalLight = new THREE.DirectionalLight()
    ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = 0.5
  
    scene.add(directionalLight, ambientLight) //
  
    //OrbitControls allow the camera to orbit around a target by mouse interaction.
    cameraControls = new OrbitControls(camera, viewerContainer)
  
  
    //Function that will be called on each frame FPS 
    function renderScene() {
      //Camera shoting the scene afte something has been added to it
      if (!renderer || !scene || !camera) { return }//Check if the renderer, scene, and camera are initialized
      renderer.render(scene, camera)//The render method of the WebGLRenderer instance is called to render the scene from the perspective of the camera. This method draws the 3D graphics onto the canvas element.
      //renderer.render(scene, camera) //Set of the scene and the camera to be rendered
      requestAnimationFrame(renderScene)
    }
    renderScene()//Initial call to the function to start the rendering loop
  
    //Helpers
    axes = new THREE.AxesHelper()//The AxesHelper class is a built-in helper class in three.js that creates a visual representation of the coordinate axes in a 3D scene. It is useful for debugging and understanding the orientation of objects in the scene.
    grid = new THREE.GridHelper()//The GridHelper class is a built-in helper class in three.js that creates a visual representation of a grid in a 3D scene. It is useful for providing a reference plane and helping with the alignment of objects in the scene.
    //Change the grid color and make it transparent
    grid.material.transparent = true
    grid.material.opacity = 0.4
    grid.material.color = new THREE.Color("#808080")
    //Add the axes and the grid to the scene
    scene.add(axes, grid)
  
    
    /*
    //Create a new GUI instance means a new graphical user interface dashboard for the 3D viewer
    const gui = new GUI() 
  
    //Control the Lights
    const lightControls = gui.addFolder("Lights")//Create a folder in the GUI for the light controls
    lightControls.add(directionalLight.position, "x", -10, 10, 0.1)
    lightControls.add(directionalLight.position, "y", -10, 10, 0.1)
    lightControls.add(directionalLight.position, "z", -10, 10, 0.1)
    lightControls.add(directionalLight, "intensity", 0, 2, 0.1)
    lightControls.addColor(directionalLight, "color")
    lightControls.add(ambientLight, "intensity", 0, 2, 0.1)
    lightControls.addColor(ambientLight, "color")
    */
  
    //load a 3D model in OBJ format
    objLoader = new OBJLoader()
    mtlLoader = new MTLLoader()
  
    mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
      materials.preload()//Preload the materials before applying them to the mesh
      if (!objLoader) { return }
      objLoader.setMaterials(materials)//Set the materials to be used by the OBJLoader instance when loading OBJ files.
      objLoader.load("../assets/Gear/Gear1.obj", (object) => {
        if (!scene) { return }
        scene.add(object)//Add the loaded mesh to the scene
        mesh = object //Assign the loaded mesh to the mesh variable for later use in the return fuction below
      })
    })
    /*
    //Load a glTF model
    const gltfLoader = new GLTFLoader(); //
    gltfLoader.load('https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => { //https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf //./assets/glTF4/scene.gltf
      console.log("GLTF:", gltf);
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 1, 0);
      //Control the GLTF object
      const glTFControls = gui.addFolder("GLTF Object")//Create a folder in the GUI for the cube controls
      glTFControls.add(model.position, "x", -100, 100, 0.1)//Add a control to the GUI to manipulate the x position of the cube, with a range from -100 to 100 and a step of 0.1
      glTFControls.add(model.position, "y", -100, 100, 0.1)//Add a control to the GUI to manipulate the y position of the cube, with a range from -100 to 100 and a step of 0.1
      glTFControls.add(model.position, "z", -100, 100, 0.1)
      glTFControls.add(model, "visible")//Add a control to the GUI to toggle the visibility of the cube
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error("Error GLTF:", error);
    }
    );
  
    //Add a spotlight to the scene to better see the glTF model
    const spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 10, 0);
    scene.add(spotLight);
  
    //Control the Spot Lights
    const spotlightControls = gui.addFolder("SpotLights")//Create a folder in the GUI for the light controls
    spotlightControls.add(spotLight.position, "x", -100, 100, 0.1)
    spotlightControls.add(spotLight.position, "y", -100, 10, 0.1)
    spotlightControls.add(spotLight.position, "z", -100, 100, 0.1)
    spotlightControls.add(spotLight, "intensity", 0, 2, 0.1)
    spotlightControls.addColor(spotLight, "color")
    spotlightControls.add(spotLight, "visible")
    // */
  }

  //One highlight issue that the viewerContainer div must be present in the HTML file before this code is executed, otherwise document.getElementById("viewer-container") will return null and cause errors
  //That why will need to use React.useEffect to ensure that the code is executed after the component is mounted and the div is present in the DOM, mounting means the process of adding a component to the DOM
  React.useEffect(() => {
    setViewer()
    //DISPOSE CODE
    //Cleanup function to remove event listeners or dispose of resources when the component is unmounted
    //Cấu trúc useEffect(() => { setup; return () => { cleanup } }, [deps]) with 'deps' is the dependency array
    return () => {
      mesh?.removeFromParent()
      mesh?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          child.material.dispose()
          //Dispose nghĩa là giải phóng bộ nhớ, tránh rò rỉ bộ nhớ, 
          //Three.js cấp phát bộ nhớ GPU cho geometry/material/texture; khi không dùng nữa phải gọi .dispose() để giải phóng, nếu không sẽ rò bộ nhớ (memory leak), đặc biệt khi mount/unmount nhiều lần.
        }
      })
      mesh = null
    }

  }, [])//Empty dependency array means this effect will only run once when the component is mounted, never run again, only for initialization purpose/ 1 time.

  return (
    <div
    id="viewer-container"
    className="dashboard-card"
    style={{ minWidth: 0 }}
    />
  )
}