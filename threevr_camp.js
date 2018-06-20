// WORKSHOP FILE FOR ITP CAMP 2018
// Thu June 14 2018

// global variables

let scene;
let renderer;
let camera;
let container;
let effect;
let vrDisplay;
let vrButton;

let controls; // to look around
let loader; // to load images, textures
let sphere1, sphere2;
let timekeep = 0;

let scene_objects;
let mouse;
let raycaster;

window.addEventListener('load', init);


// SETUP
function init(){
  console.log("NO EFFECT, NEW THREE TEST v1.1.2");

  container = document.querySelector('#sketch');
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);
  container.appendChild(renderer.domElement);

  // effect = new THREE.VREffect(renderer);
  // effect.setSize(wid, hei);
  renderer.vr.enabled = true;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, wid/hei, 0.1, 5000);
  camera.position.set( 0, 10, 0) ;

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.update();
  // controls = new THREE.VRControls(camera);
  // controls.standing = true;
  // camera.position.y = controls.userHeight;
  // controls.update();

  loader = new THREE.TextureLoader();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('vrdisplaypresentchange', onWindowResize, true);

  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  scene_objects = [];
  createEnvironment();
  setupVRStage();
}

function setupVRStage(){

  vrButton = WEBVR.createButton( renderer );
  document.getElementById('vr_button').appendChild( vrButton );
  animate();

  // get available VR displays
  // navigator.getVRDisplays().then( function(displays){
  //   if(displays.length > 0){
  //     // console.log(displays);
  //     vrDisplay = displays[0];
  //     // setup vrButton
  //     vrButton = WEBVR.createButton( renderer );
  //     document.getElementById('vr_button').appendChild( vrButton );
  //   } else {
  //     console.log("NO VR DISPLAYS AVAILABLE!");
  //   }
  //   animate();
  // } );
}


// DRAW
function animate() {
  renderer.setAnimationLoop( render );
}
function render(){
  // raycasting();

  timekeep += 0.01;

  moveSpheres();

  // controls.update();
  renderer.render( scene, camera );
}

function moveSpheres(){
  sphere1.position.z = Math.sin(timekeep) * 150;
  sphere2.position.x = Math.sin(timekeep) * 150;
}

function raycasting(){
  // set raycaster
  raycaster.setFromCamera(mouse, camera);
  // get intersecting elements
  let intersects = raycaster.intersectObjects( scene_objects );
  // de-scale all objects
  for (var i = 0; i < scene_objects.length; i++) {
    scene_objects[i].scale.set(1, 1, 1);
  }
  // highlight selected elements
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.scale.set(1.2, 1.2, 1.2);
  }
}


// EVENTS
function onWindowResize(){
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  renderer.setSize(wid, hei);
  renderer.setPixelRatio(window.devicePixelRatio);
  // effect.setSize(wid, hei);
  camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}
function onMouseMove( event ){
  // normalize position
  mouse.x = (event.clientX / window.innerWidth) *2 -1;
  mouse.y =-(event.clientY / window.innerHeight)*2 +1;
}


// OBJECT CREATION
function createEnvironment(){
  let sphere_geo = new THREE.SphereGeometry(20, 12, 12);
  let sphere_mat1 = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
    emissive: 0x440044
  });
  let sphere_mat2 = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x002200,
    specular: 0x99ff00
  });

  sphere1 = new THREE.Mesh(sphere_geo, sphere_mat1);
  sphere1.position.set(200, 0, 0);
  scene.add(sphere1);
  scene_objects.push(sphere1);

  sphere2 = new THREE.Mesh(sphere_geo, sphere_mat2);
  sphere2.position.set(0, 0, 200);
  scene.add(sphere2);
  scene_objects.push(sphere2);

  // LIGHT
  let d_light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(d_light);

  // REFERENCE PLANE
  let plane_geo = new THREE.PlaneGeometry(600, 600, 20, 20);
  let plane_mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    side: THREE.DoubleSide
  });
  let plane = new THREE.Mesh(plane_geo, plane_mat);
  plane.rotation.x = Math.PI/2;
  plane.position.set(0, -20, 0);
  scene.add(plane);

  // SKY DOME
  let sky_img = "./imgs/eso0932a_sphere.jpg";
  loader.load(sky_img, function(texture){
    let sky_geo = new THREE.SphereGeometry(1000, 24, 24);
    let sky_mat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    var skydome = new THREE.Mesh(sky_geo, sky_mat);
    scene.add(skydome);
  });

}
