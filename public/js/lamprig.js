  import * as LFMaterial from './lfMaterial.js';
  // model that thing that LEDs are fixed on and the LEDs itself
  
  export var lampRig = new THREE.Group();
var linearLedArray = []; // a representation of the LEDs in linear order along the stripe
var segmentedLedArray = []; // a representation of the LEDs as segments

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


  var ledGeometry = new  THREE.BoxGeometry(0.01, 0.01, 0.005);



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
  var sphereInner = new THREE.Mesh(sphereInnerGeometry, LFMaterial.reddishwhite);
  lampRig.add(sphereInner);


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