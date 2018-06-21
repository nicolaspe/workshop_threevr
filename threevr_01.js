/* THREE VR - 01
*	Basic building block for three js
*
* three.VR Workshop
* nicolás escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;

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

	animate();
}


// ANIMATION
function animate() {
  renderer.setAnimationLoop( render );
}
function render(){
  renderer.render( scene, camera );
}
