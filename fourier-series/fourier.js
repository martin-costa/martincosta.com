// approximate the integral of f(t)*exp(2*PI*i*t*n) over [0,1]
function computeCn(f, n, M) {
  s = createVector(0,0);
  for (var i = 0; i < M; i++) {
    s.add(p5.Vector.rotate(f[i],2*PI*n*i/M));
  }
  return s.div(M);
}

// approximate funtion with fourier series
function computeApprox(c, N, t) {
  s = createVector(0,0);
  for (var n = -N; n <= N; n++) {
    s.add(p5.Vector.rotate(c[n + N], 2*PI*n*t));
  }
  return s;
}
