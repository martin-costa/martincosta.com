function drawPoints(pointsSet) {

    m = pointsSet.m;
    n = pointsSet.n;
    points = pointsSet.points;

    // Calculate the maximum size of the grid
    let maxGridSize = Math.min(width, height) / zoom;

    // Calculate the size of each cell to ensure square grids
    let cellSize = maxGridSize / Math.max(m - 1, n - 1);

    // Calculate the actual grid width and height
    let gridWidth = cellSize * (n - 1);
    let gridHeight = cellSize * (m - 1);

    // Calculate the starting position to center the grid
    let startX = (width - gridWidth) / 2;
    let startY = (height - gridHeight) / 2;

    // Draw lines that define the grid [0, m-1] x [0, n-1]
    stroke(150);
    strokeWeight(0.75);
    for (let i = 0; i < m; i++) {
        line(startX, startY + i * cellSize, startX + gridWidth, startY + i * cellSize);
    }
    for (let i = 0; i < n; i++) {
        line(startX + i * cellSize, startY, startX + i * cellSize, startY + gridHeight);
    }

    // Draw the points
    strokeWeight(cellSize/2); // Remove stroke for the circles

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (points[m-i-1][j] == 1) {
                stroke(255); // Set fill color to white
                let x = startX + j * cellSize;
                let y = startY + i * cellSize;
                point(x, y); // Draw a circle with diameter half the cell size
            }
            if (points[m-i-1][j] == 2) {
                stroke(255, 0, 0); // Set fill color to red
                let x = startX + j * cellSize;
                let y = startY + i * cellSize;
                point(x, y); // Draw a circle with diameter half the cell size
            }
        }
    }
}