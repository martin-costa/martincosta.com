var nodeRad = 4
var maxVel = 8
var attach = 50
var decay = 0.75
var tradeoff = 0.1
var lambda = 200

class Node {

  // creates a node in R^2
  constructor(p, randomVel) {

    this.neighbors = new Map();

    this.pos = createVector(0,0);

    this.vel = createVector(0,0);
    if (randomVel) {
      this.vel = createVector(random(), random());
    }

    this.acc = createVector(0,0);

    this.attach = random()*attach;

    if (p != null) {
      this.pos = p;
    }
  }
}

class Graph {

  // create a graph in R^2
  constructor() {
    this.nodes = [];

    this.degrees = [];
    this.edgeSequence = [];

    this.colorSequences = new Map();

    this.colors = new Map();
    this.timePresent = new Map();

    this.n = 0;
    // this.m = 0;
  }

  // insert a node into the graph
  insertNode(p, randomVel) {
    var newNode = new Node(p, randomVel);

    this.nodes.push(newNode);
    this.degrees.push(0);
    this.n = this.n + 1;
  }

  // update the positions and speeds of the nodes
  update(dt) {

    var s = attach + sensitivity;

    var partitions = this.partitionSpace(s, s, true);

    for (var i = 0; i < this.n; i++) {
      this.nodes[i].acc = createVector(0,0);

      var closeNodes = this.getCloseNodes2(i, s, s, partitions, true);

      for (var node of closeNodes) {

        var j = node[0];
        var p = node[1];

        if (i != j && p5.Vector.sub(this.nodes[i].pos, this.nodes[j].pos).mag() < max(this.nodes[i].attach, this.nodes[j].attach) + sensitivity) {
          var d = p5.Vector.sub(this.nodes[i].pos, p);
          var m = d.mag();
          d.normalize();
          this.nodes[i].acc.add(d.mult(100/(m**2)));
        }
      }
    }

    // accelerate towards center
    if (space) {
      for (var i = 0; i < this.n; i++) {
        var d = p5.Vector.sub(this.nodes[i].pos, createVector(width/2, height/2));
        var m = d.mag();
        d.normalize();
        this.nodes[i].acc.add(d.mult(100/(m)));
      }
    }

    // update node velocities
    for (var i = 0; i < this.n; i++) {
      this.nodes[i].vel.add(p5.Vector.mult(this.nodes[i].acc, dt));

      if (this.nodes[i].vel.mag() > maxVel) {
        this.nodes[i].vel.setMag(maxVel);
      }
    }

    // update node positions
    for (var i = 0; i < this.n; i++) {
      this.nodes[i].pos.add(p5.Vector.mult(this.nodes[i].vel, dt));

      while (this.nodes[i].pos.x < -nodeRad) {
        this.nodes[i].pos.x += windowWidth*cnvWidth;
      }
      while (this.nodes[i].pos.x > windowWidth*cnvWidth + nodeRad) {
        this.nodes[i].pos.x -= windowWidth*cnvWidth;
      }
      while (this.nodes[i].pos.y < -nodeRad) {
        this.nodes[i].pos.y += windowHeight*cnvHeight;
      }
      while (this.nodes[i].pos.y > windowHeight*cnvHeight + nodeRad) {
        this.nodes[i].pos.y -= windowHeight*cnvHeight;
      }
    }
  }

  // draw the graph
  draw(dt, sensitivity, col, maxDeg, lambda) {

    var radii = [];

    for (var i = 0; i < this.n; i++) {
      radii.push(this.computeR(i, lambda));
    }

    // circles
    stroke(85);
    strokeWeight(1);
    for (var i = 0; i < this.n; i++) {
      fill(0,0,0,0);
      circle(this.nodes[i].pos.x, this.nodes[i].pos.y, 2*radii[i]);
    }

    // lines
    stroke(100);
    strokeWeight(1);

    for (var i = 0; i < this.n; i++) {
      var sortedPoints = this.sortPointsByDistanceFromi(i);

      var j = 0;
      while (j < this.n && sortedPoints[j].val <= radii[i]) {

        var v = p5.Vector.sub(this.nodes[sortedPoints[j].point].pos, this.nodes[i].pos);
        v.normalize();
        v.mult(radii[i] - sortedPoints[j].val);
        v.add(this.nodes[sortedPoints[j].point].pos);

        // connect centers
        stroke(100, 0, 0);
        line(this.nodes[i].pos.x, this.nodes[i].pos.y, this.nodes[sortedPoints[j].point].pos.x, this.nodes[sortedPoints[j].point].pos.y);

        // connect point to outer
        stroke(255);
        line(this.nodes[sortedPoints[j].point].pos.x, this.nodes[sortedPoints[j].point].pos.y, v.x, v.y);

        j = j + 1;
      }
    }

    //points
    stroke(130);
    strokeWeight(nodeRad*2);
    for (var i = 0; i < this.n; i++) {
      point(this.nodes[i].pos);
    }
  }

  // computes the r_i value of a node i in a trivial manner
  computeR(i, lambda) {

    var l = 0;
    var r = this.nodes.length - 1;

    var sortedPoints = this.sortPointsByDistanceFromi(i);

    var mass = this.computeMass(i, this.nodes.length - 1, sortedPoints);

    if (mass < lambda) {
      return this.computeRgivenMaxPoint(i, lambda, this.nodes.length - 1, mass);
    }

    while (l < r) {
      var m = Math.ceil((l + r) / 2);
      mass = this.computeMass(i, m, sortedPoints);

      if (mass < lambda) {
        l = m;
      }
      else {
        r = m - 1;
      }
    }

    return this.computeRgivenMaxPoint(i, lambda, r, this.computeMass(i, r, sortedPoints), sortedPoints);
  }

  // given final point in ball, returns r
  computeRgivenMaxPoint(i, lambda, j, mass, sortedPoints) {
    return sortedPoints[j].val + (lambda - mass)/(j + 1);
  }

  // compute the mass of the ball around i containing the first j points
  computeMass(i, j, sortedPoints) {

    var mass = 0;

    for (var l = 0; l <= j; l++) {
      mass = mass + sortedPoints[j].val - sortedPoints[l].val;
    }
    return mass;
  }

  sortPointsByDistanceFromi(i) {

    var sorted = [];

    for (var j = 0; j < this.nodes.length; j++) {
      sorted.push({point: j, val: p5.Vector.sub(this.nodes[i].pos, this.nodes[j].pos).mag()});
    }

    sorted.sort((a, b) => {
      return a.val - b.val;
    });

    // for (var j = 0; j < this.nodes.length; j++) {
    //   sorted[j] = sorted[j].point;
    // }

    return sorted
  }

  // partitions space into local chunks
  partitionSpace(sw, sh, full) {

    var partitions = new Map();

    var spatialSym = [createVector(0,0), createVector(width, 0), createVector(-width, 0), createVector(0, height), createVector(0, -height), createVector(width, height), createVector(width, -height), createVector(-width, height), createVector(-width, -height)];

    if (!full) {
      spatialSym = [createVector(0,0)]
    }

    for (var i = 0; i < this.nodes.length; i++) {
      for (var k = 0; k < spatialSym.length; k++) {

        var p = p5.Vector.add(this.nodes[i].pos, spatialSym[k]);

        var x = int(p.x/sw);
        var y = int(p.y/sh);

        if (!partitions.has(x + ',' + y)) {
          partitions.set(x + ',' + y, []);
        }
        partitions.get(x + ',' + y).push([i, p]);
        // partitions.set(x + ',' + y, partitions.get(x + ',' + y).push([i, p]));
      }
    }

    return partitions;
  }

  // get close nodes but better
  getCloseNodes2(i, sw, sh, partitions, full) {

    var p = this.nodes[i].pos;

    var closeNodes = [];

    var spatialSym = [createVector(0,0), createVector(width, 0), createVector(-width, 0), createVector(0, height), createVector(0, -height), createVector(width, height), createVector(width, -height), createVector(-width, height), createVector(-width, -height)];

    if (!full) {
      spatialSym = [createVector(0,0)]
    }

    for (var offset of spatialSym) {
      for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {

          if ( partitions.has(int((p.x + offset.x)/sw + i) + ',' + int((p.y + offset.y)/sh + j)) ) {
            closeNodes = closeNodes.concat(partitions.get(int((p.x + offset.x)/sw + i) + ',' + int((p.y + offset.y)/sh + j)));
          }

        }
      }
    }

    // remove duplicates
    var nodesAdded = new Map();

    for (var i = 0; i < closeNodes.length; i++) {
      if (nodesAdded.has(closeNodes[i][0])) {
        closeNodes.splice(i, 1);
        i = i - 1;
      }
      else {
        nodesAdded.set(closeNodes[i][0]);
      }
    }

    if (!full) {
      for (var i = 0; i < closeNodes.length; i++) {
        closeNodes[i] = closeNodes[i][0];
      }
    }

    return closeNodes;
  }

  // sort points by x and y coords
  sortNodes() {
    var xSorted = [];
    var ySorted = [];

    for (var i = 0; i < this.nodes.length; i++) {
      xSorted.push({node: i, val: this.nodes[i].pos.x});
      ySorted.push({node: i, val: this.nodes[i].pos.y});
    }

    xSorted.sort((a, b) => {
      return a.val - b.val;
    });

    ySorted.sort((a, b) => {
      return a.val - b.val;
    });

    // for (var i = 0; i < this.nodes.length; i++) {
    //   xSorted[i] = xSorted[i].node;
    //   ySorted[i] = ySorted[i].node;
    // }

    return [xSorted, ySorted]
  }

  // returns nodes that are within d in L1 norm of i
  getCloseNodes(i, xSorted, ySorted, full) {

    var d = attach + sensitivity;

    var closeNodes = [];

    var nodesAdded = new Map();

    var horOffsets = [-width, 0, width];
    var verOffsets = [-height, 0, height];

    if (!full) {
      horOffsets = [0];
      verOffsets = [0];
    }

    for (var offset of horOffsets) {
      var j = this.binarySearch(xSorted, this.nodes[i].pos.x + offset + d);
      while (j >= 0 && xSorted[j].val >= this.nodes[i].pos.x + offset - d) {
        if (!nodesAdded.has(xSorted[j].node) && xSorted[j].node != i) {
          closeNodes.push(xSorted[j].node);
          nodesAdded.set(xSorted[j].node,1);
        }
        j = j - 1;
      }
    }

    for (var offset of verOffsets) {
      var j = this.binarySearch(ySorted, this.nodes[i].pos.y + offset + d);
      while (j >= 0 && ySorted[j].val >= this.nodes[i].pos.y + offset - d) {
        if (!nodesAdded.has(ySorted[j].node) && ySorted[j].node != i) {
          closeNodes.push(ySorted[j].node);
          nodesAdded.set(ySorted[j].node,1);
        }
        j = j - 1;
      }
    }

    return closeNodes;
  }

  binarySearch(x, val) {

    var l = 0;
    var r = x.length - 1;

    while (l < r) {
      var m = Math.floor((l + r) / 2);

      if (x[m].val < val) {
        l = m + 1;
      }
      else {
        r = m;
      }
    }
    return r;
  }
}
