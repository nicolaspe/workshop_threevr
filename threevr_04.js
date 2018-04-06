/* THREE VR - 04
*	Camera tricks
*
* three.js Workshop
* Open Source Cinema - ITP
* nicolás escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;
let controls, loader;
let sphere1, sphere2;
let timekeep = 0;
let l_fov, l_px, l_py, l_pz, l_rx, l_ry, l_rz, fov_slider;

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
	camera.position.set(-10, 0, 0);
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.update();
	loader = new THREE.TextureLoader();

	addCameraControl();

	createEnvironment();

	window.addEventListener('resize', onWindowResize, true );

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
function addCameraControl(){
	l_fov = document.querySelector("#label_fov");
	l_px  = document.querySelector("#label_px");
	l_py  = document.querySelector("#label_py");
	l_pz  = document.querySelector("#label_pz");
	l_rx  = document.querySelector("#label_rx");
	l_ry  = document.querySelector("#label_ry");
	l_rz  = document.querySelector("#label_rz");

	fov_slider = document.querySelector("#fov_sl");
	fov_slider.addEventListener("change", function() {
		camera.fov = +fov_slider.value;
		camera.updateProjectionMatrix();
	});
}
// function to truncate decimals
function decimalDigits(num, digits){
	return (Math.floor(num * Math.pow(10, digits)))/Math.pow(10, digits);
}


// ANIMATION
function animate() {
	moveSpheres();
	timekeep += 0.01;

	updateCamera();

	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function moveSpheres(){
	sphere1.position.z = Math.sin(timekeep)*150;
	sphere2.position.x = Math.sin(timekeep)*150;
}

function updateCamera(){
	l_fov.textContent = camera.fov;
	l_px.textContent  = decimalDigits(camera.position.x, 2);
	l_py.textContent  = decimalDigits(camera.position.y, 2);
	l_pz.textContent  = decimalDigits(camera.position.z, 2);
	l_rx.textContent  = decimalDigits(camera.rotation.x, 2);
	l_ry.textContent  = decimalDigits(camera.rotation.y, 2);
	l_rz.textContent  = decimalDigits(camera.rotation.z, 2);
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

	sphere2 = new THREE.Mesh(sph_geo, sph_mat2);
	sphere2.position.set(0, 0, 200);
	scene.add(sphere2);


	// LIGHTS!
	let d_light = new THREE.DirectionalLight(0xffffff, 1);
	scene.add(d_light);

	let p_light = new THREE.PointLight(0xffffff, 1.5, 1000, 2);
	p_light.position.set(0, 0, -500);
	scene.add(p_light);
}
