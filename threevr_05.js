/* THREE VR - 05
*	Raycasting
*
* three.VR Workshop
*	nicolás escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;
let controls, loader;
let sphere1, sphere2;
let timekeep = 0;
let scene_objects;
let mouse, raycaster;

window.addEventListener('load', init);

function init(){
	container = document.querySelector('#sketch');
	let wid = window.innerWidth;
	let hei = window.innerHeight;

	// THREE INITIALIZATION
	renderer = new THREE.WebGLRenderer({ });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(wid, hei);
	container.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x222222 );

	camera = new THREE.PerspectiveCamera(60, wid/hei, 0.1, 5000);
	camera.position.set( -10, 0, 0 );

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.update();

	loader = new THREE.TextureLoader();

	// more INITIALIZATION > RAYCASTING variables
	mouse     = new THREE.Vector2();
	raycaster = new THREE.Raycaster();

	// event listeners
	window.addEventListener('resize', onWindowResize, true );
	window.addEventListener('mousemove', onMouseMove, false);

	// OBJECT CREATION
	scene_objects = [];
	createEnvironment();
	animate();
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
function onMouseMove( event ) {
  // mouse position in normalized coordinates
  mouse.x =  (event.clientX / window.innerWidth) *2 -1;
  mouse.y = -(event.clientY / window.innerHeight)*2 +1;
}



// ANIMATION
function animate() {
  renderer.setAnimationLoop( render );
}
function render(){
	timekeep += 0.01;

	moveSpheres();

	controls.update();
  raycasting();

  renderer.render( scene, camera );
}

function moveSpheres(){
	sphere1.position.z = Math.sin(timekeep)*150;
	sphere2.position.x = Math.sin(timekeep)*150;
}

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



// ENVIRONMENT
function createEnvironment(){
	// SKYDOME
	let sky_img = "./imgs/eso0932a_sphere.jpg"
	// load the texture and create the element as a callback
	loader.load(sky_img, function(texture){
		let sky_geo = new THREE.SphereGeometry(600, 24, 24);
		let sky_mat = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.BackSide,
		});
		var skydome = new THREE.Mesh(sky_geo, sky_mat);
		scene.add(skydome);
	});


	// REFERENCE PLANE
	let plane_geo = new THREE.PlaneGeometry(400, 400, 20, 20);
	let plane_mat = new THREE.MeshBasicMaterial({
		color: 0x555555,
		side: THREE.DoubleSide,
		wireframe: true
	});
	let ref_plane = new THREE.Mesh(plane_geo, plane_mat);
	ref_plane.rotation.x = Math.PI/2;
	ref_plane.position.set(0, -20, 0);
	scene.add(ref_plane);


	// SPHERES
	let sph_geo  = new THREE.SphereGeometry(20, 12, 12);
	let sph_mat1 = new THREE.MeshLambertMaterial({
		color: 0x0000ff,
		emissive: 0x440044
	});
	let sph_mat2 = new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		emissive: 0x002200,
		specular: 0x99ff00
	})

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

	let p_light = new THREE.PointLight(0xffffff, 1.5, 1000, 2);
	p_light.position.set(0, 0, -500);
	scene.add(p_light);
}
