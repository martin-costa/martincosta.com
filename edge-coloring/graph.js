var nodeRad = 4
var maxVel = 8
var attach = 50
var decay = 0.75
var tradeoff = 0.1
var palette = [ [255, 0, 0], // red
                [0, 255, 0], // green
                [0, 0, 255], // blue
                [255, 165, 0], // orange
                [255, 255, 0], // yellow
                [255, 20, 147], // deep pink
                [128, 0, 128], // purple
                [0, 255, 255], // cyan
]

class Node {

  // creates a node in R^2
  constructor(p) {

    this.neighbors = new Map();

    this.pos = createVector(0,0);
    this.vel = createVector(random(), random());
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
  insertNode(p) {
    var newNode = new Node(p);

    this.nodes.push(newNode);
    this.degrees.push(0);
    this.n = this.n + 1;
  }

  // update the positions and speeds of the nodes
  update(dt) {

    var w = windowWidth*cnvWidth;
    var h = windowHeight*cnvHeight;

    var spatialSym = [createVector(0,0), createVector(w, 0), createVector(-w, 0), createVector(0, h), createVector(0, -h), createVector(w, h), createVector(w, -h), createVector(-w, h), createVector(-w, -h)]

    // compute the accelerations of the nodes
    // for (var i = 0; i < this.n; i++) {
    //   this.nodes[i].acc = createVector(0,0);
    //
    //   for (var j = 0; j < this.n; j++) {
    //
    //     if (i != j) {
    //       for (var k = 0; k < spatialSym.length; k++) {
    //         var d = p5.Vector.sub(this.nodes[i].pos, p5.Vector.add(this.nodes[j].pos, spatialSym[k]));
    //         var m = d.mag();
    //         d.normalize();
    //         this.nodes[i].acc.add(d.mult(100/(m**2)));
    //       }
    //     }
    //   }
    // }

    var sortedNodes = this.sortNodes();

    var xSorted = sortedNodes[0];
    var ySorted = sortedNodes[1];

    for (var i = 0; i < this.n; i++) {
      this.nodes[i].acc = createVector(0,0);

      var closeNodes = this.getCloseNodes(i, xSorted, ySorted);

      for (var j of closeNodes) {

        if (i != j) {
          for (var k = 0; k < spatialSym.length; k++) {
            var d = p5.Vector.sub(this.nodes[i].pos, p5.Vector.add(this.nodes[j].pos, spatialSym[k]));
            var m = d.mag();
            d.normalize();
            this.nodes[i].acc.add(d.mult(100/(m**2)));
          }
        }
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

  // update the coloring of the graph
  updateEdges() {

    // remove edges no longer in range
    for (var k = 0; k < this.edgeSequence.length; k++) {
      var i = this.edgeSequence[k][0];
      var j = this.edgeSequence[k][1];
      this.timePresent.set(i + ',' + j, this.timePresent.get(i + ',' + j) + dt);

      // if i and j are NOT within range
      if (p5.Vector.sub(this.nodes[i].pos, this.nodes[j].pos).mag() >= max(this.nodes[i].attach, this.nodes[j].attach) + sensitivity) {
        this.colors.delete(i + ',' + j);
        this.colorSequences.delete(i + ',' + j);
        this.nodes[i].neighbors.delete(j);
        this.nodes[j].neighbors.delete(i);
        this.edgeSequence.splice(k, 1);
        k = k - 1;
      }
    }

    // scan over all potential edges and insert new ones
    for (var i = 0; i < this.nodes.length; i++) {
      for (var j = 0; j < this.nodes.length; j++) {

        // if i and j are within range
        if (i != j && p5.Vector.sub(this.nodes[i].pos, this.nodes[j].pos).mag() < max(this.nodes[i].attach, this.nodes[j].attach) + sensitivity) {

          // if they weren't connected before, but are now
          if (!this.nodes[i].neighbors.has(j) && this.nodes[i].neighbors.size < maxDeg && this.nodes[j].neighbors.size < maxDeg) {

            this.nodes[i].neighbors.set(j, 1);
            this.nodes[j].neighbors.set(i, 1);

            var newIndex = int(random(0, this.edgeSequence.length));
            this.edgeSequence.splice(newIndex, 0, [i, j]);

            this.colorSequences.set(i + ',' + j, this.generateColorSeq());
            this.timePresent.set(i + ',' + j, 0);
          }
        }
      }
    }

    // compute the coloring from scratch, tracking changes
    var blockedColors = new Map();

    for (var k = 0; k < this.edgeSequence.length; k++) {
      var i = this.edgeSequence[k][0];
      var j = this.edgeSequence[k][1];
      var seq = this.colorSequences.get(i + ',' + j);

      // find first free color
      var l = 0;
      while (l < seq.length && (blockedColors.has(i + ',' + seq[l]) || blockedColors.has(j + ',' + seq[l]))) {
        l = l + 1;
      }

      // set color a blocked for the endpoints
      if (l < seq.length) {
        blockedColors.set(i + ',' + seq[l], 1);
        blockedColors.set(j + ',' + seq[l], 1);

        // if the edge already had a color
        if (this.colors.has(i + ',' + j) && this.colors.get(i + ',' + j) != seq[l]) {
          this.timePresent.set(i + ',' + j, 0);
        }
        this.colors.set(i + ',' + j, seq[l]);
      }
      else {
        this.colors.set(i + ',' + j, -1);
      }
    }

  }

  // draw the graph
  draw(dt, sensitivity, col, maxDeg) {

    this.updateEdges();

    for (var k = 0; k < this.edgeSequence.length; k++) {
      var i = this.edgeSequence[k][0];
      var j = this.edgeSequence[k][1];
      var l = this.colors.get(i + ',' + j);
      if (l != -1) {
        var c = palette[l];
        var intensity = tradeoff + (1.0 - tradeoff)/(decay*(this.timePresent.get(i + ',' + j) + 1));

        stroke(c[0]*intensity, c[1]*intensity, c[2]*intensity);
        if (!col) {
          stroke(150*intensity);
        }
        strokeWeight(2);
        line(this.nodes[i].pos.x, this.nodes[i].pos.y, this.nodes[j].pos.x, this.nodes[j].pos.y);
      }
    }

    stroke(130);
    strokeWeight(nodeRad*2);

    for (var i = 0; i < this.n; i++) {
      point(this.nodes[i].pos);
    }
  }

  // generate a color sequence
  generateColorSeq() {
    var seq = [];
    var indices = [];
    for (var i = 0; i < palette.length; i++) {
      indices.push(i);
    }

    while (indices.length != 0) {
      var j = int(random(0, indices.length));
      seq.push(j);
      indices.splice(j,1);
    }
    return seq;
  }

  // partitions space into local chunks
  partitionSpace(s, full) {

    var partitions = new Map();

    var spatialSym = [createVector(0,0), createVector(w, 0), createVector(-w, 0), createVector(0, h), createVector(0, -h), createVector(w, h), createVector(w, -h), createVector(-w, h), createVector(-w, -h)];

    if (!full) {
      spatialSym = [createVector(0,0)]
    }

    for (var i = 0; i < nodes.length; i++) {
      for (var k = 0; k < spatialSym.length; k++) {

        var p = p5.Vector.add(this.nodes[j].pos, spatialSym[k]);

        var x = int(p.x/s);
        var y = int(p.y/s);

        if (!partitions.has(x + ',' + y)) {
          partitions.set(x + ',' + y, [])
        }
        partitions.set(x + ',' + y, partitions.get(x + ',' + y).push(nodes[i].pos));
      }
    }
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
  getCloseNodes(i, xSorted, ySorted) {

    var d = attach + sensitivity;

    var closeNodes = [];

    var nodesAdded = new Map();

    var horOffsets = [-width, 0, width];
    var verOffsets = [-height, 0, height];

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
