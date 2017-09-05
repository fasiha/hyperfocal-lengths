var fs = require('fs');

function nearFar(lensFocalLength, focusDistance, fstop, circleOfConfusion) {
  const hyperfocalDist =
      lensFocalLength * lensFocalLength / (fstop * circleOfConfusion) +
      lensFocalLength;
  const numerator = focusDistance * (hyperfocalDist - lensFocalLength);
  const near =
      numerator / (hyperfocalDist + focusDistance - 2 * lensFocalLength);
  const far = numerator / (hyperfocalDist - focusDistance);
  return [ near, far < 0 ? Infinity : far ];
}

var d40c = 0.02;
var feetpermm = 5 / 1524;

function logspace(lo, hi, n) {
  const loglo = Math.log10(lo);
  const loghi = Math.log10(hi);
  const bins = n - 1;
  const delta = (loghi - loglo) / bins;
  return Array.from(Array(n), (_, idx) => Math.pow(10, loglo + idx * delta));
}

var fstops = [ 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5.0, 5.6, 6.3, 7.1, 8 ];
var distances = logspace(3, 300, 20);

var table = distances.map(
    ft => fstops.map(
        f => nearFar(35, ft / feetpermm, f, d40c).map(mm => mm * feetpermm)));

for (const focal of [35, 50, 55, 70]) {
  let minFstop = focal < 55 ? 0 : 4;
  let minfstops = fstops.filter(f => f >= minFstop);

  var tableNear = distances.map(
      ft => minfstops.map(f => ft - nearFar(focal, ft / feetpermm, f, d40c)[0] *
                                        feetpermm));

  var printed = '-\t' + minfstops.map(x => 'f/' + x).join('\t');
  printed += '\n';
  printed += tableNear
                 .map((row, idx) => `${distances[idx].toFixed(1)}'\t` +
                                    row.map(x => x.toFixed(2) + "'").join('\t'))
                 .join('\n');

  fs.writeFileSync(`printed-${focal}.tsv`, printed)
}
