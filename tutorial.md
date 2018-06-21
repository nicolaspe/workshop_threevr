# Chapter 01: Basic three.js building block

## Introduction
So, what is three.js? It is a JavaScript 3D library, which wants to -in their own words- "create an easy to use, lightweight, 3D library". It has a great community that provide good [documentation](https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene) and resources. It can also get as complex as you want, just have a look at the [featured examples in their website](https://threejs.org)!!!


## Essential elements
There are some elements that we always need for three.js to run:

#### [`scene`](https://threejs.org/docs/#api/scenes/Scene)
It is where you place all your objects, lights, cameras and such. Think of it as a toy box or a dollhouse: a space ready for you to place anything you want.

(TIP: You can have as many scenes as you want, and switch between them later in the code.)


#### [`camera`](https://threejs.org/docs/#api/cameras/Camera)
This is how we look at the scenes. We can choose between perspective (most common one, and the one you'll use the most), orthographic and more.

Let's break down the parameters needed to initialize the camera:
```JavaScript
camera = new THREE.PerspectiveCamera(45, wid/hei, 0.1, 1000);
```
1. **Field of View:** The angle of the camera "lens". It is how much the camera "sees" and what it displays on the scene. The value is in degrees.
2. **Aspect Ratio:** It is almost always the ratio between the width and height of the three.js canvas. Otherwise, the picture looks distorted.
3. **Near:** How near can an object be before being clipped by the camera. Objects closer than this won't be displayed.
4. **Far:** How far can an object be before being clipped by the camera. Objects further than this won't be displayed.


#### [`renderer`](https://threejs.org/docs/#api/renderers/WebGLRenderer)
This is the WebGL renderer in charge of displaying the scenes. Has different parameter options, such as size, pixel ratio, etc. We won't go into much detail here, but has great options to get better image quality or to downgrade it if you need it to be less intense.


#### animation loop **(new syntax!)**
For things to be rendered in three.js, it is necessary to set an animation loop that [updates your objects](https://threejs.org/docs/#manual/introduction/How-to-update-things) to animate them and calls the renderer to display the updated frame.

  `renderer.setAnimationLoop( render )` is what tells the renderer which function to call every time it wants to show a new frame. Once this function is called, it does not need to be called again. (On previous versions of three.js, we had to call the `requestAnimationFrame()` function, but this is not needed anymore)

  `renderer.render( scene, camera )` is the part that displays the scene according to the camera's parameters. In case we want to change scenes, this would be where it is reflected.

  ```JavaScript
  // ANIMATION
  function animate() {
    renderer.setAnimationLoop( render );
  }
  function render(){
    updateObjects();
    renderer.render( scene, camera );
  }
  animate();
  ```



## Other useful components
There are also some not-so-essential (global JavaScript code) ones that I always include:

#### `container`
A call to the HTML element that will contain the canvas by using `container.appendChild(renderer.domElement);`. On certain occasions it is useful to have the HTML element in a variable


#### `resize` event listener
In case you have a full sized sketch, you need to update the display area and adjust the camera accordingly whenever the window size is modified (this includes going fullscreen!)

  ```JavaScript
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


#### `init` function
In the same way p5 has the `setup` function, I create a single function to run all the initialization code for three.js. Note that it is not necessary (like the setup function in p5), but it makes everything much more organized. To make this function run after the entire webpage has loaded, add `window.addEventListener('load', init);`




# Chapter 02 - Object creation and textures

## Some more useful elements
#### `controls`
This is used to control the camera. Some usual controls are the [OrbitControls](https://threejs.org/docs/#examples/controls/OrbitControls) and [FlyControls](https://threejs.org/examples/misc_controls_fly.html). They need to be constantly updated on the *animation loop*.

#### `loader`
A [texture loader](https://threejs.org/docs/#api/loaders/TextureLoader). It needs to be created only once to be used whenever.

Note that this is only to load images (textures), but there are many different loaders for [animations](https://threejs.org/docs/#api/loaders/AnimationLoader), [audio](https://threejs.org/docs/#api/loaders/AudioLoader), [3D obj files](https://threejs.org/docs/#examples/loaders/OBJLoader) and more!


## Object creation
To create an element (or a [Mesh](https://threejs.org/docs/#api/objects/Mesh)) in three.js you need two essential parts: a [geometry](https://threejs.org/docs/#api/core/Geometry) and a mesh [material](https://threejs.org/docs/#api/constants/Materials).

- A **geometry** is a set of *vertices* (points in space) and *faces* (sets of 3 vertices that form a plane). Luckily, three.js has A LOT of built in shapes for our convenience (i.e: [sphere](https://threejs.org/docs/api/geometries/SphereGeometry.html), [box](https://threejs.org/docs/api/geometries/BoxGeometry.html), [torus](https://threejs.org/docs/#api/geometries/TorusGeometry), etc).

- A mesh **material** is a set of properties that give a basic texture to the material. Depending on the properties we want, we could use a [Basic material](https://threejs.org/docs/api/materials/MeshBasicMaterial.html) (which is flat and unaffected by lights), a [Lambert material](https://threejs.org/docs/api/materials/MeshLambertMaterial.html) (which is reflectant, but not shiny), a [Phong material](https://threejs.org/docs/api/materials/MeshPhongMaterial.html) (very shiny!), or others. We can also specify other properties, as a mapped texture, specular or emissive properties, the side of the material (it can be displayed inside for a sky dome -an enormous sphere that acts as the sky- , or only on the outside for a normal object), to display only the wireframe, etc.

After defining this elements, to create the object you simply assign them to a Mesh, set its position and rotation, and add them to the scene:
  ```JavaScript
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




# Chapter 03 - Animation

In order to add some animation to the sketch, we need to modify our objects in every frame. The place to do this is the function we set up as the animation loop referenced earlier.

In order to move, rotate or scale an object (or modify any [property](https://threejs.org/docs/#api/core/Object3D)), we can access each coordinate of the parameters individually or set them all at once.
```JavaScript
obj.position.x = 0;
obj.rotation.set( 0, 0.2, 0.5 );
```

It is useful to have a way to keep track of the time (or frames) passed. It can be as simple as having a counter go up every loop, or use the JavaScript built in function [`performance.now()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).

```JavaScript
let timekeep = 0;

function render(){
	timekeep += 0.01;
  let time = performance.now() * 0.00002;
	moveSpheres();

	controls.update();
  renderer.render( scene, camera );
}

function moveSpheres(){
	sphere1.position.z = Math.sin(timekeep)*150;
	sphere2.position.x = Math.sin(timekeep)*150;
}
```



# Chapter 04 - Playing with the camera

This example can be seen [here](https://nicolaspe.github.io/workshop_threevr/camera.html).

On chapter 1, we saw the basic parameters to set up a camera, but what do they do? How do they change when the camera moves?

In order to understand how some parameters of the camera work, it's easier seeing it in action. Whenever the camera moves, the `position` and `rotation` of the camera changes. The position can be altered manually on the code, but the rotation works differently, and has to be corrected by changing the [`quaternion`](https://threejs.org/docs/#api/math/Quaternion).

When talking about the *field of view* things are more complicated. How it works is rather simple, but changing it requires an additional step: updating the camera's projection matrix. Without this update, the change on the *fov* will not be reflected on the sketch.
```JavaScript
fov_slider = document.querySelector("#fov_sl");
fov_slider.addEventListener("change", function() {
  camera.fov = +fov_slider.value;
  camera.updateProjectionMatrix();
});
```




# Chapter 05 - Mouse interaction: Raycasting

In order to make an interactive experience, we need to be able to capture the user's input, like the mouse (standard for web experiences). For a 2D sketch it is easy to figure out, as the we can always relate the mouse position to the objects on the sketch. However, on a 3D sketch, the third dimension and depth make it very hard to calculate whether the mouse is on top of an object of not. That's where [raycasting](https://en.wikipedia.org/wiki/Ray_casting) comes in to help us.

In three.js, we use the [Raycaster object](https://threejs.org/docs/#api/core/Raycaster) takes into account the position of the mouse, the camera position and orientation and traces a line on the scene to returns an array of the objects that were intersected.

## Mouse tracking
The first step is to keep track of the mouse as it moves around the sketch. This information is stored in a two-dimensional vector (position x and y of the mouse). In order to do so, it is necessary to listen to the event `mousemove`, and setup a callback function (in this case, `onMouseMove`).

Finally, the raycaster needs the mouse position as normalized coordinates (ranging from -1 to 1). As the width and height of the sketch are arbitrary, we need to give the function values that relate to the overall position.
```JavaScript
let mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove( event ) {
  // mouse position in normalized coordinates
  mouse.x =  (event.clientX / window.innerWidth) *2 -1;
  mouse.y = -(event.clientY / window.innerHeight)*2 +1;
}
```

## Keeping track of (some of) the objects
When raycasting, we have to give the function an array of the objects it can intersect. A fast way of doing it would be with `scene.children`, which lets you access all the objects on a scene. However, there are things we might not want to interact with (i.e: the background skydome, a reference plane, walls, etc). With this in mind, we can create a `scene_objects` array where we `push` every object created that can be selected with the raycaster. This gives us more control over our sketch.

```JavaScript
let scene_objects = [];

let obj = new Mesh(obj_geometry, obj_material);
scene.add(obj);
scene_objects.push(obj);
```

## Raycasting
Finally, we can start with the raycasting. The raycaster needs to be set from the camera and normalized mouse positions, and from that we can give it the array of "intersect-able" objects and get the intersected ones.

Now, in order to have a successful interaction, we need a way to tell the user the mouse is on top and can select an object. Possible ways of showing this are changing the color or material, or scaling it to have a magnification effect. Whatever is chosen, we must remember to return the object to the original state if it's not selected.

```JavaScript
let raycaster = new THREE.Raycaster();

function raycasting(){
	// set raycaster
  raycaster.setFromCamera( mouse, camera );
  // get intersecting elements
  let intersects = raycaster.intersectObjects( scene_objects );
  // return all elements scale
  for (let i = 0; i < scene_objects.length; i++) {
    scene_objects[i].scale.set(1.0, 1.0, 1.0);
  }
  // "highlight" by scaling intersected elements
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.scale.set(1.1, 1.1, 1.1);
  }
}
```




# Chapter 06 - WebVR!!!

Now, let's go to the point of all this. Fortunately, there's not much code to add to make a VR scene work!

## [Origin Trials](https://bit.ly/OriginTrials)
But first, we need to sign up for the Origin Trial. This allows developers to try out experimental features and give feedback about them. All you need to do is [request a token for your site](http://bit.ly/OriginTrialSignup) and add the tag on your website (just follow the instructions on the site and email).

## Libraries
But first, let's go over the required libraries (which can be found on this repository, on the `lib/` folder or linked to the latest build):

- [WebVR](https://webvr.info/): library that implements the WebVR API
- [webvr-polyfill](https://github.com/immersive-web/webvr-polyfill) & [webxr-polyfill](https://github.com/immersive-web/webxr-polyfill): libraries needed to display on unsupported devices/browsers

There are two libraries that were needed before, but have been added to the basic renderer and APIs of three.js and WebVR: `VREffect` and `VRControls`.

<br/>
In addition to these libraries, as we're developing in a computer, we'll need the [Chrome WebVR API Emulation](https://chrome.google.com/webstore/detail/webvr-api-emulation/gbdnpaebafagioggnhkacnaaahpiefil). This tool appears on the Developer Tools tab, as the "WebVR" tab. This lets us enter VR mode by emulating a VR display in the browser and control the camera on the sketch. Sadly, with the latest changes this doesn't always work on web projects, only when accessing it locally (localhost).

## Implementation
Things change quickly with implementations of emerging technologies like this one. On the downside, code you previously had stops working, libraries and functions get deprecated and even the platform might change and break everything. But, on the upside, experiments get stable releases and extra code gets incorporated into the basic libraries. This is the case with WebVR: while version 2.0 got merged into [WebXR](https://immersive-web.github.io/webxr/), we still have [version 1.1](https://immersive-web.github.io/webvr/spec/1.1/)

1. Enable the VR mode on the renderer.
  ```JavaScript
  renderer.vr.enabled = true;
  ```
2. Create the "Enter VR" button. This is part of the WebVR API library and deals with getting the `VRDisplay` and setting up the callback function for it to start presenting.
  ```JavaScript
  vrButton = WEBVR.createButton( renderer );
  document.getElementById('vr_button').appendChild( vrButton );
  ```

And that's it! Your project can now run in VR mode 😃 A few other details were added to the code, you can inspect and play with it as you wish.
