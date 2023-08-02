var nodeRad = 4
var maxVel = 8
var attach = 80

class Node {

  // creates a node in R^2
  constructor(p) {

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
    this.colors = new Map();

    this.n = 0;
    // this.m = 0;
  }

  // insert a node into the graph
  insertNode(p) {
    var newNode = new Node(p);

    this.nodes.push(newNode);
    this.n = this.n + 1;
  }

  // update the positions and speeds of the nodes
  update(dt) {

    var w = windowWidth*cnvWidth;
    var h = windowHeight*cnvHeight;

    var spatialSym = [createVector(0,0), createVector(w, 0), createVector(-w, 0), createVector(0, h), createVector(0, -h), createVector(w, h), createVector(w, -h), createVector(-w, h), createVector(-w, -h)]

    // compute the accelerations of the nodes
    for (var i = 0; i < this.n; i++) {
      this.nodes[i].acc = createVector(0,0);

      for (var j = 0; j < this.n; j++) {

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

  // draw the graph
  draw(sensitivity, col) {

    for (var i = 0; i < this.nodes.length; i++) {
      for (var j = 0; j < this.nodes.length; j++) {
        if (i != j && p5.Vector.sub(this.nodes[i].pos, this.nodes[j].pos).mag() < max(this.nodes[i].attach, this.nodes[j].attach) + sensitivity) {
          if (!this.colors.has(i + ',' + j)) {
            console.log(i,j);
            var c = [40*random(), 200*random() + 55, 40*random()];
            var f = random([0,1,2]);
            this.colors.set(i + ',' + j, [c[f % 3], c[(f + 1) % 3], c[(f + 2) % 3]]);
          }
          var c = this.colors.get(i + ',' + j);
          stroke(c);
          if (!col) {
            stroke(150);
          }
          strokeWeight(2);
          line(this.nodes[i].pos.x, this.nodes[i].pos.y, this.nodes[j].pos.x, this.nodes[j].pos.y);
        }
        else {
          this.colors.delete(i + ',' + j);
        }
      }
    }

    stroke(200);
    strokeWeight(nodeRad*2);

    for (var i = 0; i < this.n; i++) {
      point(this.nodes[i].pos);
    }
  }
}
