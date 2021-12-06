class Curve {

  constructor() {
    this.points = [];
    this.samples = [];

    this.lenth = 0;

    this.complete = false;
  }

  // param of curve, map from [0, 1] -> curve
  param(t) {
    if (this.complete == false)
      return createVector(0,0);
    if (this.length == 0)
      return this.points[0];

    var target = this.length*t;
    var pos = 0;

    var i = 0;
    while (pos + p5.Vector.sub(this.points[i+1], this.points[i]).mag() <= target) {
      pos = pos + p5.Vector.sub(this.points[i+1], this.points[i]).mag();
      i = i + 1;
    }

    return p5.Vector.add(this.points[i], p5.Vector.sub(this.points[i+1], this.points[i]).normalize().mult(target - pos));
  }

  I(i) {
    if (i < 0) i = i + this.points.length;
    if (i >= this.points.length) i = i - this.points.length;
    return i;
  }

  // add point to curve
  addPoint(p) {
    if (this.points.length == 0) {
      this.points.push(p);
      return true;
    }

    // don't add repeatred points back to back
    if (this.points[this.points.length - 1].equals(p))
      return false;

    this.points.push(p);
    return true;
  }

  finishCurve() {
    if (this.points.length > 0)
      this.addPoint(this.points[0]);
    this.length = this.curveLength();
    this.complete = true;
  }

  // get length of curve
  curveLength() {
    var l = 0;
    for (var i = 0; i < this.points.length - 1; i++) {
      l = l + p5.Vector.mag(p5.Vector.sub(this.points[this.I(i+1)], this.points[i]));
    }
    return l;
  }

  // draw the curve
  draw() {
    for (var i = 0; i < this.points.length - 1; i++) {
      line(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
      //point(this.points[i].x, this.points[i].y);
    }
  }

  // efficiently sample values of the curve
  sample(M) {
    if (this.complete == false)
      return [createVector(0,0)];
    if (this.length == 0)
      return [this.points[0]];

    this.samples = new Array(M);

    var pos = 0;
    var i = 0;

    for (var j = 0; j < M; j++) {
      var target = this.length*(j/M);

      while (pos + p5.Vector.sub(this.points[i+1], this.points[i]).mag() <= target) {
        pos = pos + p5.Vector.sub(this.points[i+1], this.points[i]).mag();
        i = i + 1;
      }

      this.samples[j] = p5.Vector.add(this.points[i], p5.Vector.sub(this.points[i+1], this.points[i]).normalize().mult(target - pos));
    }
    return this.samples;
  }

  // approximates the curvature at point (i) by computing the radius of the circle that goes through
  // the points (i-1), (i) and (i+1) and returning the inverse of the radius of this approximate
  // osculating circle
  static curvature(a, b, c) {
    var s = (a + b + c) / 2.0;
    var A = sqrt(s * (s - a) * (s - b) * (s - c));
    return  (4.0 * A) / (a * b * c);
  }
}
