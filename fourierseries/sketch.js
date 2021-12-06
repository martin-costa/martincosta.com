var cnvWidth = 0.75, cnvHeight = 0.75;
var t = 0;
var N = 30;

function setup() {
  cnv = createCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);

  drawing = false;
  done = false;

  c = [];
  mycurve = new Curve();
  approxCurve = new Curve();
}

function mousePressed() {

}

function draw() {

  update();

  // reposition canvas
  cnv.position(0.5*(1 - cnvWidth)*windowWidth, 0.5*(1 - cnvHeight)*windowHeight);
  resizeCanvas(windowWidth*cnvWidth, windowHeight*cnvHeight);

  // background color
  background(0, 0, 0);

  // draw circle
  // var u = mycurve.param(t);
  // circle(u.x, u.y, 15);

  //let rot = p5.Vector.rotate();

  // draw curve
  stroke(255);
  if (done) {
    approxCurve.draw();

    // draw circles
    noFill();
    stroke(200, 0, 0);

    s = createVector(0, 0);
    //circle(s.x, s.y, 2*c[N].mag());
    s.add(c[N]);
    for (var i = 1; i <= N; i++) {

      r = p5.Vector.rotate(c[N+i],2*PI*i*t);
      circle(s.x, s.y, 2*r.mag());
      s1 = p5.Vector.add(s,r);
      line(s.x, s.y, s1.x, s1.y);
      s.add(r);

      r = p5.Vector.rotate(c[N-i],-2*PI*i*t);
      circle(s.x, s.y, 2*r.mag());
      s1 = p5.Vector.add(s,r);
      line(s.x, s.y, s1.x, s1.y);
      s.add(r);
    }

    stroke(120);
  }
  mycurve.draw();

}

function update() {

  t = t + 0.002;
  if (t > 1)
    t = t - 1;

  // start darwing curve
  if (mouseIsPressed && !drawing) {
    drawing = true;
    done = false;
    mycurve = new Curve();
  }

  // stop drawing curve
  if (!mouseIsPressed && drawing) {
    mycurve.finishCurve();
    drawing = false;
    done = true;

    c = [];
    samples = mycurve.sample(1000);

    for (var i = 0; i < 2*N + 1; i++) {
      c.push(computeCn(samples, i-N, 1000));
    }

    approxCurve = new Curve();
    for (var i = 0; i < 1000; i++) {
      approxCurve.addPoint(computeApprox(c, N, i/1000));
    }
    approxCurve.finishCurve();
  }

  if (drawing) {
    mycurve.addPoint(createVector(mouseX, mouseY));
  }
}
