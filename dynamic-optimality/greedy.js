class AccessSequence {

    // creates a set of points representing the keys and when they must be touched
    constructor(sequence, n) {
      
        // defines keys to be touched: key points[i] must be touched at time i
        this.sequence = sequence;

        // the keys are numbered from 0 to n - 1
        this.n = n;

        // the length of the access sequence
        this.m = sequence.length;
    }
}

class PointSet {

    // creates a set of points representing the keys and when they are touched
    constructor(sequence) {
        
        // the access sequence defining the core points
        this.sequence = sequence;

        // the point set is contained in [0, m - 1] x [0, n - 1]
        this.n = sequence.n;
        this.m = sequence.m;

        // create an array to store the points (using a matrix representation will be inefficient for large m and n) 
        this.points;
        this.negativePoints;
        this.positivePoints;

        // number of points in the set
        this.numPoints = this.m;

        // keep track of number of greedy iterations
        this.greedyIterations;

        this.reset();
    }

    reset() {

        // create an array to store the points (using a matrix representation will be inefficient for large m and n) 
        this.points = [];
        this.negativePoints = [];
        this.positivePoints = [];
        for (let i = 0; i < this.m; i++) {
            this.points[i] = [];
            this.negativePoints[i] = [];
            this.positivePoints[i] = [];
            for (let j = 0; j < this.n; j++) {
                this.points[i][j] = 0;
                this.negativePoints[i][j] = 0;
                this.positivePoints[i][j] = 0;
            }

            // the key at position i of the access sequence must be touched at time i
            this.points[i][this.sequence.sequence[i]] = 1;
            this.negativePoints[i][this.sequence.sequence[i]] = 1;
            this.positivePoints[i][this.sequence.sequence[i]] = 1;
        }

        this.greedyIterations = 0;
    }

    // run the greedy algorithm
    greedy() {
        while (this.greedyIterations < this.m) {
            this.greedyIteration();
        }
    }

    // run an iteration of the greedy algorithm
    greedyIteration() {

        // if the greedy algorithm has already run m iterations, then stop
        if (this.greedyIterations >= this.m) {
            return;
        }

        // the next level to be constructed
        var i_current = this.greedyIterations;

        // find all points in the space below the current level
        var lowerPoints = [];
        var lowerPositivePoints = [];
        var lowerNegativePoints = [];
        for (let i = 0; i < i_current; i++) {
            for (let j = 0; j < this.n; j++) {
                if (this.points[i][j] != 0) {
                    lowerPoints.push([i, j]);
                }
                if (this.positivePoints[i][j] != 0) {
                    lowerPositivePoints.push([i, j]);
                }
                if (this.negativePoints[i][j] != 0) {
                    lowerNegativePoints.push([i, j]);
                }
            }
        }

        // find all points at the current level
        var upperPoints = [];
        var upperPositivePoints = [];
        var upperNegativePoints = [];
        for (let j = 0; j < this.n; j++) {
            if (this.points[i_current][j] != 0) {
                upperPoints.push([i_current, j]);
            }
            if (this.positivePoints[i_current][j] != 0) {
                upperPositivePoints.push([i_current, j]);
            }
            if (this.negativePoints[i_current][j] != 0) {
                upperNegativePoints.push([i_current, j]);
            }
        }

        while (upperPoints.length > 0) {
            // keep track of new points that are created
            var newPoints = [];

            // scan over all pairs of lowerPoints and upperPoints
            for (let l = 0; l < lowerPoints.length; l++) {
                for (let k = 0; k < upperPoints.length; k++) {
                    var q = lowerPoints[l];
                    var p = upperPoints[k];
                    if (!this.arborallySatisfied(q[0], q[1], p[0], p[1], this.points)) {
                        this.points[i_current][q[1]] = 2;
                        newPoints.push([i_current, q[1]]);
                    }
                }
            }
            upperPoints = newPoints;
        }

        while (upperNegativePoints.length > 0) {
            // keep track of new points that are created
            var newNegativePoints = [];

            // scan over all pairs of lowerPoints and upperPoints
            for (let l = 0; l < lowerNegativePoints.length; l++) {
                for (let k = 0; k < upperNegativePoints.length; k++) {
                    var q = lowerNegativePoints[l];
                    var p = upperNegativePoints[k];
                    if (q[1] > p[1] && !this.arborallySatisfied(q[0], q[1], p[0], p[1], this.negativePoints)) {
                        this.negativePoints[i_current][q[1]] = 2;
                        newNegativePoints.push([i_current, q[1]]);
                    }
                }
            }
            upperNegativePoints = newNegativePoints;
        }

        while (upperPositivePoints.length > 0) {
            // keep track of new points that are created
            var newPositivePoints = [];

            // scan over all pairs of lowerPoints and upperPoints
            for (let l = 0; l < lowerPositivePoints.length; l++) {
                for (let k = 0; k < upperPositivePoints.length; k++) {
                    var q = lowerPositivePoints[l];
                    var p = upperPositivePoints[k];
                    if (q[1] < p[1] && !this.arborallySatisfied(q[0], q[1], p[0], p[1], this.positivePoints)) {
                        this.positivePoints[i_current][q[1]] = 2;
                        newPositivePoints.push([i_current, q[1]]);
                    }
                }
            }
            upperPositivePoints = newPositivePoints;
        }

        this.greedyIterations++;
    }

    // check if the pair of points (i1, j1) and (i2, j2) are arborally satisfied
    arborallySatisfied(i1, j1, i2, j2, A) {

        // if the point are on the same vertical or horizontal line, then the pair is arborally satisfied
        if (i1 == i2 || j1 == j2) {
            return true;
        }

        // define the bounding box of the two points
        var i_min = Math.min(i1, i2);
        var i_max = Math.max(i1, i2);
        var j_min = Math.min(j1, j2);
        var j_max = Math.max(j1, j2);

        // if there is another point in the bounding box, then the pair is arborally satisfied
        for (let i = i_min; i <= i_max; i++) {
            for (let j = j_min; j <= j_max; j++) {
                if (A[i][j] != 0 && (i != i1 || j != j1) && (i != i2 || j != j2)) {
                    return true;
                }
            }
        }

        return false;
    }

    // add a point to the set based on a mouse click at (x,y)
    addPoint(x, y) {

        let gridGap = 75/zoom;

        // Calculate the maximum size of the grid
        let maxGridSize = (Math.min(width, height) - gridGap) / (zoom);

        // Calculate the size of each cell to ensure square grids
        let cellSize = maxGridSize / Math.max(this.m - 1, this.n - 1);

        // Calculate the actual grid width and height
        let gridWidth = cellSize * (this.n - 1);
        let gridHeight = cellSize * (this.m - 1);

        // Calculate the starting positions to center the grids
        let startX1 = (width - 2 * gridWidth - gridGap) / 2;
        let startY1 = (height - gridHeight) / 2;

        // calculate the cell coordinates
        let i = this.m - 1 - Math.floor((y - startY1 + cellSize/2) / cellSize);
        let j = Math.floor((x - startX1 + cellSize/2) / cellSize);

        if (j >= this.n) {
            j = Math.floor((x - startX1 - gridWidth - gridGap + cellSize/2) / cellSize);
        }

        // add the point to the set
        if (i >= 0 && i < this.m && j >= 0 && j < this.n) {
            this.sequence.sequence[i] = j;
            this.reset();
            this.greedy();
        }

    }
}