/* THREE VR - Simple VR scene
*
* three.js Workshop
*	Open Source Cinema - ITP
*	nicolás escarpentier
*/

// global threejs variables
let container, renderer, camera, scene;
let controls, loader, effect;

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

	effect = new THREE.VREffect(renderer);
	effect.setSize(wid, hei);

	controls = new THREE.VRControls( camera );
	controls.standing = true;
	camera.position.y = controls.userHeight;
	controls.update();

	loader = new THREE.TextureLoader();
	createEnvironment();

	// Initialize (Web)VR
	renderer.vr.enabled = true;
	setupVRStage();

	window.addEventListener('resize', onWindowResize, true );
	window.addEventListener('vrdisplaypresentchange', onWindowResize, true);
}

// sets up the VR stage + button
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


// EVENTS
function onWindowResize(){
  let wid = window.innerWidth;
  let hei = window.innerHeight;

  effect.setSize(wid, hei);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(wid, hei);
  camera.aspect = wid/hei;
  camera.updateProjectionMatrix();
}


// ANIMATION
function update(){
	window.requestAnimationFrame(animate);
}
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
