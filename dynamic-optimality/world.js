var cnvWidth = 1, cnvHeight = 1;
var zoom = 1.5;
var greedyIterations = 0;
var greedyDelay = 0.1;
var initTime;

var width;
var height;

function setup() {
  width = windowWidth*cnvWidth;
  height = windowHeight*cnvHeight;

  cnv = createCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);

  createInstance();
}

function createInstance() {

  n = 20;
  m = 20;

  // create a random access sequence

  seq = [];
  for (let i = 0; i < m; i++) {
    seq.push(Math.floor(Math.random()*n));
  }

  sequence = new AccessSequence(seq, n);

  // n = 10;
  // sequence = new AccessSequence([7,0,6,3,5,2,9,8,1,4], n);

  pointSet = new PointSet(sequence);

  initTime = millis();

  greedyIterations = 0;
  // greedyIterations = Math.floor(millis() / (1000 * greedyDelay));
}

function windowResized() {
  setup();
}

function draw() {

  if ((millis() - initTime) / (1000 * greedyDelay) > greedyIterations) {
    pointSet.greedyIteration();
    greedyIterations++;
  }

  // reposition canvas
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);
  resizeCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);

  // background color
  background(0, 0, 0);

  // draw the points
  drawPoints(pointSet);

  // fill(200, 0, 0, 200);
  // stroke(0, 0, 0, 0)
  // text('An visualization of the greedy algorithm for dynamically maintaining a binary search tree.', 10, windowHeight*cnvHeight - 5);

  if (keyIsDown(DOWN_ARROW) === true) {
    zoom *= 1.02;
  }

  if (keyIsDown(UP_ARROW) === true) {
    zoom *= 0.98;
  }

  if (greedyIterations >= m) {
    createInstance();
  }
}

function keyPressed() {

  if (keyCode == 82) {
    setup();
  }

}
