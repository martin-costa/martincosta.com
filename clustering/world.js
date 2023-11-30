var cnvWidth = 1, cnvHeight = 1;
var nDensity = 0.00004;
var dt = 1;
var sensitivity = 70;
var col = true;
var maxDeg = 10;
var space = false;
var lambda = 300;

var width;
var height;

var width;
var height;

function setup() {
  width = windowWidth*cnvWidth;
  height = windowHeight*cnvHeight;

  cnv = createCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);

  graph = new Graph();

  for (var i = 0; i < nDensity*width*height; i++) {
    graph.insertNode(createVector(random()*windowWidth*cnvWidth, random()*windowHeight*cnvHeight), true);
  }
}

function windowResized() {
  setup();
}

function draw() {

  // reposition canvas
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);
  resizeCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);

  // background color
  background(0, 0, 0);

  // update the graph
  graph.update(dt);

  // draw the graph
  graph.draw(dt, sensitivity, col, maxDeg, lambda);

  // words
  // textSize(12);
  // fill(200, 0, 0, 200);
  // stroke(0, 0, 0, 0)
  // text('speed = ' + parseFloat(dt).toFixed(3) + ' (U/I), ' + 'sensitivity = ' + parseFloat(sensitivity).toFixed(3) + ' (J/K), ' + 'color = ' + col + ' (C), ' + 'max degree = ' + maxDeg + ' (D/F)', 10, windowHeight*cnvHeight - 5);
}

function mousePressed() {
  graph.insertNode(createVector(mouseX, mouseY), false);
}

function keyPressed() {

  // change value of dt

  // U
  if (keyCode === 85) {
    dt *= 0.9;
  }

  // I
  if (keyCode === 73) {
    dt *= 1.1;
  }

  // change network sensitivity

  // J
  if (keyCode === 74) {
    lambda *= 0.95;
  }

  // K
  if (keyCode === 75) {
    lambda *= 1.05;
  }

  // space
  if (keyCode === 32) {
    space = !space;
  }
}
