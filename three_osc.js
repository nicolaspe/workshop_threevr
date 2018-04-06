// three js Open Source Cinema Workshop
// coding along!

let container;
let renderer, camera, scene;
let controls;
let loader;
let sphere1, sphere2;
let timekeep = 0;
let mouse, raycaster;
let scene_objects;
let vrDisplay;

window.addEventListener('load', init);

function init(){
  // THREE JS INIT
  container = document.querySelector("#sketch");
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  renderer = new THREE.WebGLRenderer({});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x222222 );

  camera = new THREE.PerspectiveCamera(60, wid/hei, 0.1, 5000);
  camera.position.set(-10, 0, 0);

  container.appendChild(renderer.domElement);

  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.update();

  loader = new THREE.TextureLoader();

  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  // VR INIT
  effect = new THREE.VREffect(renderer);
  effect.setSize(wid,hei);

  controls = new THREE.VRControls( camera );
  controls.standing = true;
  camera.position.y = controls.userHeight;
  controls.update();

  renderer.vr.enabled = true;
  setupVRStage();


  // OBJECTS
  createEnvironment();



  // EVENT LISTENERS
  window.addEventListener('resize', onWindowResize, true);
  window.addEventListener('mousemove', onMouseMove, false);
  $("#sketch").on("dragenter dragstart dragend dragleave dragover drag drop", function( e ){
    e.preventDefault();
    // get mouse coordinates, and normalize them
    mouse.x =  (e.clientX / window.innerWidth)*2  -1;
    mouse.y = -(e.clientY / window.innerHeight)*2 +1;
    raycasting();
  });
  window.addEventListener('vrdisplaypresentchange', onWindowResize, true);


}

function setupVRStage(){
  navigator.getVRDisplays().then( function(displays){
    if(displays.length > 0){
      console.log(displays);
      vrDisplay = displays[0];
      vrButton = WEBVR.getButton( vrDisplay, renderer.domElement );
      document.getElementById('vr_button').appendChild( vrButton );
    } else {
      console.log("NO VR DISPLAYS PRESENT!!!");
    }
    update();
  } );
}


// EVENTS
function onWindowResize(){
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);

  camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}
function onMouseMove( e ){
  // get mouse coordinates, and normalize them
  mouse.x =  (e.clientX / window.innerWidth)*2  -1;
  mouse.y = -(e.clientY / window.innerHeight)*2 +1;
}


// ANIMATION
function update(){
  window.requestAnimationFrame(animate);
}
function animate(){
  moveSpheres();
  timekeep += 0.01;

  raycasting();

  if(vrDisplay.isPresenting){ // VR RENDERING
    controls.update();
    effect.render(scene, camera);
    vrDisplay.requestAnimationFrame(animate);
  } else {  // BROWSER RENDERING
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }
}

function moveSpheres(){
  sphere1.position.z = Math.sin(timekeep)*150;
  sphere2.position.x = Math.sin(timekeep)*150;
}

function raycasting(){
  // set Raycaster
  raycaster.setFromCamera(mouse, camera);
  // get intersecting elements
  let intersects = raycaster.intersectObjects( scene_objects );
  // return everything to normal
  for (let i = 0; i < scene_objects.length; i++) {
    scene_objects[i].scale.set(1.0, 1.0, 1.0);
  }
  // "highlight" the object by making it a bit bigger
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.scale.set(1.1, 1.1, 1.1);
  }
}



// OBJECT CREATION
function createEnvironment(){
  scene_objects = [];

  // SKYDOME
  let sky_img = "./imgs/eso0932a_sphere.jpg";
  // load texture and create skydome as callback
  loader.load(sky_img, function(texture){
    let sky_mat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    let sky_geo = new THREE.SphereGeometry(600, 24, 24);
    let sky_dome = new THREE.Mesh(sky_geo, sky_mat);
    scene.add(sky_dome);
  })

  // REFERENCE PLANE
  let plane_geo = new THREE.PlaneGeometry(600, 600, 20, 20);
  let plane_mat = new THREE.MeshBasicMaterial({
    color: 0x555555,
    side: THREE.DoubleSide,
    wireframe: true
  });
  let plane = new THREE.Mesh(plane_geo, plane_mat);
  plane.rotation.x = Math.PI/2;
  plane.position.y = -20;
  scene.add(plane);


  // SPHERES
  let sph_geo = new THREE.SphereGeometry(20, 12, 12);
  let sph_mat1 = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
    emissive: 0x440044,
  });
  let sph_mat2 = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x002200,
    specular: 0x99ff00
  });

  sphere1 = new THREE.Mesh(sph_geo, sph_mat1);
  sphere1.position.set(200, 0, 0);
  scene.add(sphere1);
  scene_objects.push(sphere1);

  sphere2 = new THREE.Mesh(sph_geo, sph_mat2);
  sphere2.position.set(0, 0, 200);
  scene.add(sphere2);
  scene_objects.push(sphere2);


  // LIGHTS!
  let d_light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(d_light);

  let p_light = new THREE.PointLight(0xffffff, 1.5 , 1000, 2);
  p_light.position.set(0, 0, 0);
  scene.add(p_light);
}
