var cnvWidth = 1, cnvHeight = 1;
var n = 170;
var dt = 1;
var sensitivity = 50
var col = true

function setup() {
  cnv = createCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);

  graph = new Graph();

  for (var i = 0; i < n; i++) {
    graph.insertNode(createVector(random()*windowWidth*cnvWidth, random()*windowHeight*cnvHeight));
  }
}

function draw() {

  // update();

  // reposition canvas
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);
  resizeCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);

  // background color
  background(0, 0, 0);

  // update the graph
  graph.update(dt);

  // draw the graph
  graph.draw(sensitivity, col);

  // words
  textSize(17);
  fill(200, 0, 0, 200);
  stroke(0, 0, 0, 0)
  text('speed = ' + parseFloat(dt).toFixed(3) + ' (press I/U to increase/decrease), ' + 'sensitivity = ' + parseFloat(sensitivity).toFixed(3) + ' (press K/J to increase/decrease) ' + 'color = ' + col + ' (press C to enable/disable) ', 10, windowHeight*cnvHeight - 10);
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
    sensitivity *= 0.95;
  }

  // K
  if (keyCode === 75) {
    sensitivity *= 1.05;
  }

  // C
  if (keyCode === 67) {
    col = !col;
  }
}
