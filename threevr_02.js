/* THREE VR - 02
*	Some other basic elements and organizing the code
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
	camera = new THREE.PerspectiveCamera(80, wid/hei, 0.1, 1000);
	camera.position.set(0, 0, 0);

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.update();

	loader = new THREE.TextureLoader();

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
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
