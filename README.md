# unconference_threevr

**VR in the browser!!!** Material for the threeVR class @ ITP Unconference, Winter 2018



## Introduction

### three.js
- Faster (& prettier) than p5.js in 3D *
- Good [documentation](https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene) + resources
- As [complex as you want](https://threejs.org/) (seriously, see the featured projects they have on their website!)

(* There's a big difference on how three.js and p5.js render their graphics. In p5.js, you need to manually discriminate what's on the screen. Everything you draw, is going to be displayed. If it's outside the limits of the canvas, the computer will try to draw it anyway. On the other hand, in three.js you add objects to a scene and the renderer calculates what the selected camera sees and acts accordingly. I imagine it as putting toys in a box and moving a camera around. The toys are always there, but you only see what you're pointing at.)

### [WebVR](https://webvr.info/)
- Experience VR in your browser
- Needs specific browsers (Chrome, Firefox, some VR browsers)
  - Also needs some extra js libraries
  - Can be extended to any mobile browser with the [WebVR polyfill](https://github.com/immersive-web/webvr-polyfill)
- Change in the rendering pipeline *
- Work in progress… Code from 2016 and earlier might not work

(* Usually, the browser is what decides when to render a new frame. In VR, the display is what has to decide when to render the new frame, which changes the way we call for this function in either mode.)



## Let's code
Each subsection in this part will correlate to a .js file, explaining their content.

### 01 - Basic building block elements for three js
three.js always needs some basic elements to run:
- [`scene`](https://threejs.org/docs/#api/scenes/Scene): where you place all your objects, lights, cameras and such
- [`camera`](https://threejs.org/docs/#api/cameras/Camera): how we look at the scenes. We can choose between perspective (most common one), orthographic and more
- [`renderer`](https://threejs.org/docs/#api/renderers/WebGLRenderer): the WebGL renderer in charge of displaying the scenes. Has different parameter options, such as size, pixel ratio, etc
- `animate()`: function which creates the render loop and where you should place all the code that [updates your objects](https://threejs.org/docs/#manual/introduction/How-to-update-things) to animate them

  This last function is worth looking at. The `renderer.render(scene, camera)` is the part that displays the scene according to the camera's parameters, and `requestAnimationFrame(animate)` is how the browser asks for the new frame when it's ready for a new one. This function has to be called the first time to enter the loop. (This last function is part of the WebAPI code.)
  ```
  function animate() {
	   renderer.render(scene, camera);
     requestAnimationFrame(animate);
  }
  animate();
  ```

<br/>
There are also some not-so-essential (global JavaScript code) ones that I always include:

- `container`: a call to the HTML element that will contain the canvas by using `container.appendChild(renderer.domElement);`
- `resize` event listener: in case you have a fullscreen sized sketch, you need to update the display area and adjust the camera accordingly

  ```
  window.addEventListener('resize', onWindowResize, true );

  function onWindowResize(){
    let wid = window.innerWidth;
    let hei = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(wid, hei);
	  camera.aspect = wid/hei;
    camera.updateProjectionMatrix();
   }
   ```


### 02 - Other basic elements and organizing the code
It is a bit confusing learning how to create three.js sketches, as some example files are not very organized. With that in mind, in order to understand them better and following some examples online, I encapsulate all the essential code in one function, `onLoad()`. This code is executed whenever the browser finishes loading the window, thanks to the `load` event listener. At the end of this function, I call the `createEnvironment()` function to create all the elements (which will be covered in the next subsection) and the `animate()` function to start running the sketch.

*(See the corresponding file to see exactly what this function has. Displaying it here would be copying almost the entire file).*

Also, some new elements are:
- `controls`: this is used to control the camera. Some usual controls are the [OrbitControls](https://threejs.org/docs/#examples/controls/OrbitControls), [FlyControls](https://threejs.org/examples/misc_controls_fly.html) and [VRControls](https://github.com/mrdoob/three.js/blob/master/examples/js/controls/VRControls.js). They need to be constantly updated on the `animation()` function
- `loader`: a [texture loader](https://threejs.org/docs/#api/loaders/TextureLoader). It needs to be created only once to be used whenever



### 03 - Creating elements
To create an element ([Mesh](https://threejs.org/docs/#api/objects/Mesh)) in three.js you need two essential parts: a [geometry](https://threejs.org/docs/#api/core/Geometry) and a mesh [material](https://threejs.org/docs/#api/constants/Materials).

- A **geometry** is a set of *vertices* (points in space) and *faces* (sets of 3 vertices that form a plane). Luckily, three.js has A LOT of built in shapes for our convenience (i.e: [sphere](https://threejs.org/docs/api/geometries/SphereGeometry.html), [box](https://threejs.org/docs/api/geometries/BoxGeometry.html), [torus](https://threejs.org/docs/#api/geometries/TorusGeometry), etc).

- A mesh **material** is a set of properties that give a basic texture to the material. Depending on the properties we want, we could use a [Basic material](https://threejs.org/docs/api/materials/MeshBasicMaterial.html) (which is flat and unaffected by lights), a [Lambert material](https://threejs.org/docs/api/materials/MeshLambertMaterial.html) (which is reflectant, but not shiny), a [Phong material](https://threejs.org/docs/api/materials/MeshPhongMaterial.html) (very shiny!), or others. We can also specify other properties, as a mapped texture, specular or emissive properties, the side of the material (it can be displayed inside for a sky dome -an enormous sphere that acts as the sky- , or only on the outside for a normal object), to display only the wireframe, etc.

After defining this elements, to create the object you simply assign them to a Mesh, set its position and rotation, and add them to the scene:
  ```
  var obj = new Mesh(obj_geometry, obj_material);
  obj.position.set(pos_x, pos_y, pos_z);
  obj.rotation.set(rot_x, rot_y, rot_z);
  scene.add(obj);
  ```

Also, it is worth noting that while these geometries and materials are often saved as variables, they are not linked to the specific Mesh. Thus, they can be used over and over again, instead of creating new geometries or materials.

<br/>

We can also create [lights](https://threejs.org/docs/#api/lights/Light). They don't need a geometry and texture, only a color and intensity; but they also have some special parameters depending on their type. These elements also have to be added to the scene (very common mistake!). Some examples are:
- an [Ambient light](https://threejs.org/docs/api/lights/AmbientLight.html) is an omnipresent light, illuminating all the objects on the scene. As such, it casts no shadows
- a [Directional light](https://threejs.org/docs/api/lights/DirectionalLight.html) is a light from a faraway source, illuminating every object from a specific direction
- a [Point light](https://threejs.org/docs/api/lights/PointLight.html) comes from a very specific point in space and emits light in every direction. It's distance and decay properties can be set to get a more realistic simulation



### 04 - let's go VR!
Now, let's go to the point of all this. Fortunately, there's not much code to add to make a VR scene. But first, let's go over the required libraries (which can be found on this repository, on the `lib/` folder):

- [WebVR](https://webvr.info/): library that implements the WebVR API
- [VREffect](https://github.com/mrdoob/three.js/blob/dev/examples/js/effects/VREffect.js): this is a new renderer that needs to be used in order to display in stereo (split screen), and handling that each screen comes from a different eye
- [VRControls](https://github.com/mrdoob/three.js/blob/master/examples/js/controls/VRControls.js): handles the orientation of the device to control the camera
- [webvr-polyfill](https://github.com/immersive-web/webvr-polyfill): library needed to display on unsupported devices/browsers

<br/>
In addition to these libraries, as we're developing in a computer, we'll need the [Chrome WebVR API Emulation](https://chrome.google.com/webstore/detail/webvr-api-emulation/gbdnpaebafagioggnhkacnaaahpiefil). This tool appears on the Developer Tools tab, as the "WebVR" tab. This lets us enter VR mode by emulating a VR display in the browser and control the camera on the sketch.

<br/>
Now, the code.

1. We need to create the new renderer for the VR. This will handle the split screen as well as making the projection matrices to account for the perspective of each eye.
  ```
  effect = new THREE.VREffect(renderer);
  effect.setSize(wid, hei);
  ```
2. Enable the VR mode in threejs.
  ```
  renderer.vr.enabled = true;
  ```
3. Use VRControls to control the camera.
  ```
  controls = new THREE.VRControls( camera );
  controls.standing = true;
  camera.position.y = controls.userHeight;
	controls.update();
  ```
4. Get and setup the VR display. This is one of the key parts of the process. `navigator` is a built-in browser variable, which we ask for a `VRDisplay`, a new built-in class in the Web API. When the [promise](https://developers.google.com/web/fundamentals/primers/promises) is fulfilled, we are returned an array of VRDisplays. Most of the time, we only have one VR display (mobile device or the Chrome extension), but in case you want to add an external device, you can log the displays and their parameters to modify the code accordingly and choose the desired one. Then, we create the "Enter VR mode" button, with the `getButton()` function from the WebVR library.
  ```
  function setupVRStage(){
    // get available displays
    navigator.getVRDisplays().then( function(displays){
      if(displays.length > 0) {
  			// console.log(displays);
        vrDisplay = displays[0];
        // setup button
        vrButton = WEBVR.getButton( vrDisplay, renderer.domElement );
        document.getElementById('vr_button').appendChild( vrButton );
      } else {
        console.log("NO VR DISPLAYS PRESENT");
      }
      update();
    });
  }
  ```
5. Change the rendering pipeline. As stated before, the VR display is what has to ask for new frames to be rendered. VR applications are recommended to run at 90 fps, much faster than the 60 fps of the video game ideal. To be able to know on which mode should we render, we use the boolean parameter `vrDisplay.isPresenting`. If it's true, then we use the VREffect to render, and the VR display is the one that requests the next frame. Otherwise, we use the same code as before.
  ```
  function animate(timestamp) {
    if(vrDisplay.isPresenting){ // VR rendering
      controls.update();
      effect.render(scene, camera);
      vrDisplay.requestAnimationFrame(animate);
    } else {  // browser rendering
  		controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }
  }
  ```

And that's it! Your project can now run in VR mode 😃 A few other details were added to the code, you can inspect and play with it as you wish.

PD: If there's any comment, issue or question, post an issue or send me a message/email.
