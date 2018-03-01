
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var container, stats;

    var camera, controls, scene, renderer;

    var cross;

    var cube;

    var linearLedArray = []; // a representation of the LEDs in linear order along the stripe
    var segmentedLedArray = []; // a representation of the LEDs as segments


    init();
    animate();

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


      var material1 = new THREE.MeshStandardMaterial({
        color: 0xe65125,
        roughness: 0.2,
        opacity: 0.05,
        transparent: true,
        wireframe: false,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      var material2 = new THREE.MeshStandardMaterial({
        color: 0xfff0f0,
        roughness: 0.4,
        opacity: 0.1,
        transparent: true,
        //  wireframe: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

      var ledGeometry = new  THREE.BoxGeometry(0.01, 0.01, 0.005);

      cube = new THREE.Mesh(cubeGeometry, material1);
      cube.rotation.x = -0;
      scene.add(cube);

      // lrp lampRigParams

      var lrp1 = {
        radius: 0.5,
      start: { y: 0.45}, // -radius <= y <= radius
      end: { y: -0.40}, // -radius <= y <= radius
      segments: [
      {n:48, df:0}, //num LEDs, negative angle deltaPhi of last led in segment
      {n:59, df:0},
      {n:70, df:0},
      {n:75, df:0},
      {n:80, df:0},
      {n:71, df:0},
      {n:61, df:0},
      {n:57, df:0},
      {n:42, df:0},
      {n:37, df:0}, 
      {n:26, df:0},
      {n:17, df:0},
      {n:31, df: -Math.PI * 0}]  // deltaPhi might be important when there are not enough leds
      };

      var lrp = {
        radius: 0.5,
      start: { y: 0.45}, // -radius <= y <= radius
      end: { y: -0.40},  // -radius <= y <= radius
      segments: [
      {n:80, df:0}, //num LEDs, negative angle deltaPhi of last led in segment
      {n:30, df:0},
      {n:40, df:0},
      {n:50, df:0},
      {n:40, df: - Math.PI * 0.25},
      {n:30, df:0},
      {n:20, df: - Math.PI * 0.25}]  // deltaPhi might be important when there are not enough leds
      };

      // model that thing that LEDs are fixed on and the LEDs itself
      var lampRig = new THREE.Group();

      var thetaStart = Math.asin(lrp.start.y/lrp.radius); // pitch angle (between x-z-Plane
                                                          // and vector to upper rim)
      
      var thetaEnd = Math.asin(lrp.end.y/lrp.radius);     // angle between x-z-Plane and
                                                          // vector to lower rim
      
      var numSegments = lrp.segments.length;

      // We assume that all segments have the same height, except the last segment.
      // If there are not enough leds to go fully round, the last segment ist smaller.
      // var relativeHeightofLastSegment = (2*Math.PI+lpr.segments[numSegments-1].df)/2*Math.PI

      var relativeHeightOfLastSegment = 1+lrp.segments[numSegments-1].df/(2*Math.PI);

      var deltaThetaPerSegment = (thetaStart-thetaEnd) / (numSegments-1+relativeHeightOfLastSegment)

      // dotted helper lines and leds
      for (var s = 0; s < numSegments; s++){ // for each segment

        // pitch angle for the segment start and end
        var segmentThetaStart = thetaStart-s*deltaThetaPerSegment;
        var segmentThetaEnd = numSegments-1 == s ? thetaEnd : segmentThetaStart - deltaThetaPerSegment;

        // one dotted circle for start of each segment layer
        lampRig.add(orangeCircle(Math.sin(segmentThetaStart)*lrp.radius,Math.cos(segmentThetaStart)*lrp.radius));

        // final circle for end of last layer (segment might be smaller)
        if (s == numSegments-1){
          lampRig.add(orangeCircle(Math.sin(thetaEnd)*lrp.radius,Math.cos(thetaEnd)*lrp.radius));
        }

        var segmentPhiStart = 0 == s ? 0 : lrp.segments[s-1].df; 
        var segmentPhiEnd = 2 * Math.PI + lrp.segments[s].df;
        var numLedsInSegment = lrp.segments[s].n;
        // yaw angle per led 
        var singeLedAnglePhi =  (segmentPhiEnd-segmentPhiStart)/numLedsInSegment;
        // pitch angle per led
        var singeLedAngleTheta =  (segmentThetaStart-segmentThetaEnd)/numLedsInSegment;
        for (var l = 0; l < numLedsInSegment; l++){
          var newLedMaterial = new THREE.MeshStandardMaterial({
            color: 0x0000ff,
            roughness: 0.2,
            opacity: 1.0,
            transparent: false,
            wireframe: false,
            side: THREE.FrontSide,
            depthWrite: true
          });

          var newLed = new THREE.Mesh(ledGeometry, newLedMaterial); 
          if (0 == l) {
            newLed.material.color = new THREE.Color(0xFF0000);
          }
          if (1 == l) {
            newLed.material.color = new THREE.Color(0x00FF00);
          }
          var newLedTheta = segmentThetaStart - l * singeLedAngleTheta; // x-y-plane (pitch) 
          var newLedPhi = segmentPhiStart + l * singeLedAnglePhi; // yaw
          var y = Math.sin(newLedTheta)*lrp.radius
          var x = Math.cos(newLedPhi)*Math.cos(newLedTheta)*lrp.radius
          var z = -Math.sin(newLedPhi)*Math.cos(newLedTheta)*lrp.radius
          //console.log("numLeds;" +numLedsInSegment + "slaphi " + singeLedAnglePhi);
          //console.log("Phi: " + newLedPhi);
          //console.log(x + ", " + y + ", " + z);
          newLed.position.set(x, y, z);
          newLed.lookAt(0,0,0);
          lampRig.add(newLed);
          linearLedArray.push(newLed);
        }


      }
      // dotted line for zero meridian
      lampRig.add(orangeHalfCircle(lrp.radius,thetaStart, thetaEnd));

      //console.log(linearLedArray);


      var sphereInnerGeometry = new THREE.SphereGeometry(lrp.radius, 30, 30,
        0, Math.PI * 2,
        Math.PI/2-thetaStart,
        thetaStart-thetaEnd);
      var sphereInner = new THREE.Mesh(sphereInnerGeometry, material2);
      lampRig.add(sphereInner);
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
      var lnr = Math.round((animationTick/10) % linearLedArray.length);
      //console.log("LedNr: " + lnr);
      //console.log("array :" + linearLedArray);
//      var aLed = linearLedArray[lnr];
      
//      console.log(aLed.material);
      //linearLedArray[lnr].material.color = 0xFFFFFF;

      //lnr = 0;

      //console.log(lnr);
      var aLed = linearLedArray[lnr];
      console
      if (aLed) {
       // console.log(lnr);
       // aLed.material.color = new THREE.Color(0xFFFF88);
      };

      //console.log(aLed.material);

      render();
      

    }

    function render() {

      renderer.render( scene, camera );
      stats.update();

    }

    function orangeCircle(y, radius){
      var dashMaterial = new THREE.LineDashedMaterial( { color: 0xe65125, dashSize: 2*Math.PI*10/4000, gapSize:2*Math.PI*10/4000, linewidth:2  } );
      var circGeom = new THREE.CircleGeometry(radius, 360);
      circGeom.vertices.shift();
      circGeom.computeLineDistances();
      var circ = new THREE.Line(circGeom, dashMaterial);
      circ.position.y=y;
      circ.rotation.x=Math.PI/2;
      return circ;
    }

    function orangeHalfCircle(radius, tStart, tEnd){
      var dashMaterial = new THREE.LineDashedMaterial( { color: 0xe65125, dashSize: 2*Math.PI*10/4000, gapSize:2*Math.PI*10/4000, linewidth:2  } );
      var circGeom = new THREE.CircleGeometry(radius, 360, tEnd, tStart-tEnd);
      circGeom.vertices.shift();
      circGeom.computeLineDistances();
      var circ = new THREE.Line(circGeom, dashMaterial);
      return circ;
    }
   
      var aLed = linearLedArray[0];
      
      console.log(aLed);

      console.log(aLed.material);
