function drawPoints(pointsSet) {
    let m = pointsSet.m;
    let n = pointsSet.n;
    let points = pointsSet.points;
    let posPoints = pointsSet.positivePoints;
    let negPoints = pointsSet.negativePoints;

    let gridGap = 75/zoom;

    // Calculate the maximum size of the grid
    let maxGridSize = (Math.min(width, height) - gridGap) / (zoom);

    // Calculate the size of each cell to ensure square grids
    let cellSize = maxGridSize / Math.max(m - 1, n - 1);

    // Calculate the actual grid width and height
    let gridWidth = cellSize * (n - 1);
    let gridHeight = cellSize * (m - 1);

    // Calculate the starting positions to center the grids
    let startX1 = (width - 2 * gridWidth - gridGap) / 2;
    let startY1 = (height - gridHeight) / 2;
    let startX2 = startX1 + gridWidth + gridGap;
    let startY2 = startY1;

    // Function to draw a single grid
    function drawGrid(startX, startY, toDraw) {
        // Draw lines that define the grid [0, m-1] x [0, n-1]
        stroke(110);
        strokeWeight(0.75);
        for (let i = 0; i < m; i++) {
            line(startX, startY + i * cellSize, startX + gridWidth, startY + i * cellSize);
        }
        for (let i = 0; i < n; i++) {
            line(startX + i * cellSize, startY, startX + i * cellSize, startY + gridHeight);
        }

        // Draw the points
        strokeWeight(cellSize / 2); // Set stroke weight for the circles
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (points[m - i - 1][j] == 1 && toDraw[0] == 1) {
                    stroke(255); // Set fill color to white
                    let x = startX + j * cellSize;
                    let y = startY + i * cellSize;
                    point(x, y); // Draw a circle with diameter half the cell size
                }
                if (points[m - i - 1][j] == 2 && toDraw[1] == 1) {
                    stroke(0, 255, 0); // Set fill color to green
                    let x = startX + j * cellSize;
                    let y = startY + i * cellSize;
                    point(x, y); // Draw a circle with diameter half the cell size
                }
                if ((negPoints[m - i - 1][j] == 2 || posPoints[m - i - 1][j] == 2) && toDraw[2] == 1) {
                    let makeBlue = negPoints[m - i - 1][j] == 2;
                    let makeRed = posPoints[m - i - 1][j] == 2;
                    if (makeBlue) {
                        stroke(0, 0, 255);
                    }
                    if (makeRed) {
                        stroke(255, 0, 0);
                    }
                    if (makeBlue && makeRed) {
                        stroke(75, 0, 130);
                    }
                    let x = startX + j * cellSize;
                    let y = startY + i * cellSize;
                    point(x, y); // Draw a circle with diameter half the cell size
                }
            }
        }
    }

    // Draw the first grid
    drawGrid(startX1, startY1, [1, 0, 1]);

    // Draw the second grid
    drawGrid(startX2, startY2, [1, 1, 0]);
}