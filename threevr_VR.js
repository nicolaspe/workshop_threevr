/* THREE VR - basic VR scene
*
* three.VR Workshop
*	nicolás escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;
let controls, loader, effect;

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

	camera = new THREE.PerspectiveCamera(80, wid/hei, 0.1, 1000);
	camera.position.set( 0, 0, 0 );

	loader = new THREE.TextureLoader();

	// Initialize (Web)VR
	renderer.vr.enabled = true;
	vrButton = WEBVR.createButton( renderer );
  document.getElementById('vr_button').appendChild( vrButton );

	// event listeners
	window.addEventListener('resize', onWindowResize, true );
	window.addEventListener('vrdisplaypresentchange', onWindowResize, true);

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


// ANIMATION
function animate() {
  renderer.setAnimationLoop( render );
}
function render(){
  renderer.render( scene, camera );
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
}
