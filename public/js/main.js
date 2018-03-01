
import * as LFMaterial from './lfMaterial.js';
import {lampRig} from './lamprig.js';


if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;

var cross;

var cube;





function init() {

  // camera

  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(3, 1.9, 4);
  camera.lookAt(0,0,0);

  // drag, pan, zoom controls

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );

  // world

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x162834 );
  scene.fog = new THREE.FogExp2( 0x162834, 0.002 );


  var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);



  cube = new THREE.Mesh(cubeGeometry, LFMaterial.orange);
  cube.rotation.x = -0;
  scene.add(cube);

  scene.add(lampRig);


  // lights

  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  var light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );

  var directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  directionalLight.position.set(3, 3, 5);
  directionalLight.lookAt(0,0,0);
  //scene.add(directionalLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0);
  directionalLight.position.set(-1, 0, 0);
  directionalLight.lookAt(0,0,0);
  //scene.add(directionalLight);

  scene.add(new THREE.AmbientLight(0xffffff));


  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  //

  window.addEventListener( 'resize', onWindowResize, false );
  //

  render();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  controls.handleResize();

  render();

}

var animationTick = 0;

function animate() {

  requestAnimationFrame( animate );
  controls.update();
  cube.rotation.y += 0.005;
  animationTick++;


  //console.log(aLed.material);

  render();
  

}

function render() {

  renderer.render( scene, camera );
  stats.update();

}


init();
animate();

