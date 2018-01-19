/* THREE VR - 03
*	First elements!
*
*	ITP Unconference, Winter 2018
*	Nicolás Peña-Escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;
let controls, loader;

window.addEventListener('load', onLoad);

function onLoad(){
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
	camera = new THREE.PerspectiveCamera(80, wid/hei, 0.1, 1000);
	camera.position.set(0, 0, 0);

	controls = new THREE.VRControls( camera );
  controls.standing = true;
  camera.position.y = controls.userHeight;
	controls.update();

	loader = new THREE.TextureLoader();
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



// ANIMATION
function animate() {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}



// ENVIRONMENT
function createEnvironment(){
	// SKYDOME
	let sky_geo = new THREE.SphereGeometry(600, 24, 24);
	let sky_mat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
		wireframe: true,
	});
	var skydome = new THREE.Mesh(sky_geo, sky_mat);
	scene.add(skydome)

	// SPHERES
	let sp_geo  = new THREE.SphereGeometry(20, 12, 12);
	let sp_mat1 = new THREE.MeshBasicMaterial({
		color: 0x0000ff,
		side: THREE.DoubleSide,
	});
	let sp_mat2 = new THREE.MeshLambertMaterial({
		color: 0x00ff00,
		side: THREE.DoubleSide,
	})

	var sphere1 = new THREE.Mesh(sp_geo, sp_mat1);
	sphere1.position.set(-200, 0, 0);
	scene.add(sphere1);

	var sphere2 = new THREE.Mesh(sp_geo, sp_mat2);
	sphere2.position.set(0, 0, -200);
	scene.add(sphere2);


	// LIGHTS!
	let d_light = new THREE.DirectionalLight(0xffffff, 1);
	scene.add(d_light);

	let p_light = new THREE.PointLight(0xff0000, 1.5, 1000, 2);
	p_light.position.set(0, -100, -100);
	scene.add(p_light);
}
