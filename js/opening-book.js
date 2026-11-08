import openingDatabaseUrl from '../data/openings/opening-index.json?url';

const fallbackOpenings = [
  ['e4 e5 Nf3 Nc6 Bb5', 'Ruy Lopez'],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5', 'Giuoco Piano'],
  ['e4 e5 Nf3 Nc6 Bc4', 'Italian Game'],
  ['e4 e5 Nf3 Nc6 d4', 'Scotch Game'],
  ['e4 e5 Nc3', 'Vienna Game'],
  ['e4 e5 f4', 'King’s Gambit'],
  ['e4 e5 Nf3 Nc6', 'Four Knights Game'],
  ['e4 e5', 'King’s Pawn Game'],
  ['e4 c5 Nf3 d6 d4', 'Sicilian Defense · Open'],
  ['e4 c5 Nf3', 'Sicilian Defense'],
  ['e4 e6 d4 d5 Nc3', 'French Defense · Winawer'],
  ['e4 e6 d4 d5', 'French Defense'],
  ['e4 c6 d4 d5', 'Caro-Kann Defense'],
  ['e4 d5', 'Scandinavian Defense'],
  ['e4 Nf6', 'Alekhine Defense'],
  ['e4 d6 d4 Nf6', 'Pirc Defense'],
  ['d4 d5 c4 dxc4', 'Queen’s Gambit Accepted'],
  ['d4 d5 c4 c6', 'Slav Defense'],
  ['d4 d5 c4 e6', 'Queen’s Gambit Declined'],
  ['d4 Nf6 c4 e6 Nc3 Bb4', 'Nimzo-Indian Defense'],
  ['d4 Nf6 c4 g6 Nc3 d5', 'Grünfeld Defense'],
  ['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6', 'King’s Indian Defense'],
  ['d4 Nf6 c4 e6', 'Indian Defense'],
  ['d4 Nf6', 'Indian Game'],
  ['c4 e5', 'English Opening · King’s English'],
  ['c4', 'English Opening'],
  ['Nf3 d5 d4', 'Réti Opening'],
  ['Nf3 d5', 'Réti Opening'],
  ['Nf3', 'Réti Opening'],
  ['d4 d5', 'Queen’s Pawn Game'],
  ['d4', 'Queen’s Pawn Game']
];

let openingDatabase = null;
let openingDatabasePromise = null;

export function isOpeningBookReady() {
  return openingDatabase !== null;
}

export function loadOpeningBook() {
  if (!openingDatabasePromise) {
    openingDatabasePromise = fetch(openingDatabaseUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Opening data returned HTTP ${response.status}.`);
        return response.json();
      })
      .then((database) => {
        if (!database || !Number.isInteger(database.openingCount) || !database.positions) {
          throw new Error('The opening database has an invalid format.');
        }
        openingDatabase = database;
        return database;
      });
  }
  return openingDatabasePromise;
}

export function identifyOpening(path) {
  if (openingDatabase) {
    for (let index = path.length - 1; index >= 0; index--) {
      const fen = path[index]?.fen ?? path[index]?.after;
      if (typeof fen !== 'string') continue;
      const positionKey = fen.split(' ').slice(0, 4).join(' ');
      const opening = openingDatabase.positions[positionKey];
      if (opening) return `${opening.eco} · ${opening.name}`;
    }
  }

  const san = path.map((node) => (node?.san ?? '').replace(/[+#?!]+$/g, ''));
  let bestLength = 0;
  let bestName = 'Opening not identified';
  for (const [sequence, name] of fallbackOpenings) {
    const moves = sequence.split(' ');
    if (
      moves.length > bestLength
      && moves.length <= san.length
      && moves.every((move, index) => move === san[index])
    ) {
      bestLength = moves.length;
      bestName = name;
    }
  }
  return bestName;
}
