const fs = require('node:fs');
const path = require('node:path');
const { Chess } = require('chess.js');

const root = path.resolve(__dirname, '..');
const volumes = ['a', 'b', 'c', 'd', 'e'];
const positions = new Map();
let openingCount = 0;

function getPositionKey(fen) {
  return fen.split(' ').slice(0, 4).join(' ');
}

function isMoreSpecific(candidate, current) {
  const candidateSeparators = (candidate.name.match(/[:,]/g) ?? []).length;
  const currentSeparators = (current.name.match(/[:,]/g) ?? []).length;
  if (candidateSeparators !== currentSeparators) {
    return candidateSeparators > currentSeparators;
  }
  if (candidate.name.length !== current.name.length) {
    return candidate.name.length > current.name.length;
  }
  return candidate.eco < current.eco;
}

for (const volume of volumes) {
  const sourcePath = path.join(root, 'data', 'openings', `${volume}.tsv`);
  const rows = fs.readFileSync(sourcePath, 'utf8').trim().split(/\r?\n/).slice(1);
  for (const [index, row] of rows.entries()) {
    const [eco, name, pgn] = row.split('\t');
    if (!eco || !name || !pgn) {
      throw new Error(`Invalid opening record in ${volume}.tsv at line ${index + 2}.`);
    }

    const chess = new Chess();
    chess.loadPgn(pgn);
    const key = getPositionKey(chess.fen());
    const candidate = { eco, name };
    const existing = positions.get(key);
    if (!existing || isMoreSpecific(candidate, existing)) positions.set(key, candidate);
    openingCount++;
  }
}

const outputPath = path.join(root, 'data', 'openings', 'opening-index.json');
const data = {
  source: 'lichess-org/chess-openings',
  license: 'CC0-1.0',
  openingCount,
  positionCount: positions.size,
  positions: Object.fromEntries([...positions.entries()].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0
  ))
};
fs.writeFileSync(outputPath, `${JSON.stringify(data)}\n`);
console.log(`Indexed ${openingCount} opening records across ${positions.size} distinct positions.`);
