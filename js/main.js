import { Chess } from 'chess.js';
import { supabase, supabaseConfigured, supabaseConfigurationError } from './supabase.js';
import { identifyOpening, isOpeningBookReady, loadOpeningBook } from './opening-book.js';

let game = new Chess();
let currentUser = null;
let loadedCloudUserId = null;
let isSignUpMode = false;
let collectionItems = [];
let reviewEntries = [];
let gameLibrary = [];
let studyGoals = { reviews: 3, mistakes: 5, openings: 3 };
let cloudGamesColumnAvailable = true;
let cloudStudyGoalsColumnAvailable = true;
let cloudWriteQueue = Promise.resolve();
const board = document.getElementById('chessboard');
const status = document.getElementById('game-status');
const moveHistory = document.getElementById('move-history');
const moveCount = document.getElementById('move-count');
const historyEmpty = document.getElementById('history-empty');
const currentPly = document.getElementById('current-ply');
const variationsTree = document.getElementById('variations-tree');
const commentForm = document.getElementById('comment-form');
const positionComment = document.getElementById('position-comment');
const commentStatus = document.getElementById('comment-status');
const evaluationValue = document.getElementById('evaluation-value');
const evaluationMeter = document.getElementById('evaluation-meter');
const evaluationFill = document.getElementById('evaluation-fill');
const engineStatus = document.getElementById('engine-status');
const multipvSelect = document.getElementById('multipv-select');
const engineDepthInput = document.getElementById('engine-depth');
const engineDepthValue = document.getElementById('engine-depth-value');
const candidateLinesElement = document.getElementById('candidate-lines');
const linesStatus = document.getElementById('lines-status');
const reviewStatus = document.getElementById('review-status');
const reviewSummary = document.getElementById('review-summary');
const reviewReport = document.getElementById('review-report');
const reviewMoments = document.getElementById('review-moments');
const mistakePracticeSection = document.getElementById('mistake-practice-section');
const mistakePracticeQueue = document.getElementById('mistake-practice-queue');
const openingNotation = document.getElementById('opening-notation');
const showTacticsButton = document.getElementById('show-tactics-button');
const promotionDialog = document.getElementById('promotion-dialog');
const promotionChoice = document.getElementById('promotion-choice');
const practiceStatus = document.getElementById('practice-status');
const fenForm = document.getElementById('fen-form');
const fenInput = document.getElementById('fen-input');
const pgnForm = document.getElementById('pgn-form');
const pgnInput = document.getElementById('pgn-input');
const loadStatus = document.getElementById('load-status');
const explorerSummary = document.getElementById('explorer-summary');
const explorerMoves = document.getElementById('explorer-moves');
const explorerGames = document.getElementById('explorer-games');
const explorerAuthForm = document.getElementById('explorer-auth-form');
const explorerTokenInput = document.getElementById('explorer-token');
const explorerDisconnectButton = document.getElementById('explorer-disconnect-button');
const annotationStatus = document.getElementById('annotation-status');
const annotationColor = document.getElementById('annotation-color');
const collectionForm = document.getElementById('collection-form');
const collectionName = document.getElementById('collection-name');
const collectionList = document.getElementById('collection-list');
const collectionStatus = document.getElementById('collection-status');
const insightHistory = document.getElementById('insight-history');
const gameLibraryForm = document.getElementById('game-library-form');
const gameLibraryPgn = document.getElementById('game-library-pgn');
const gameLibraryPlayer = document.getElementById('game-library-player');
const gameLibraryStatus = document.getElementById('game-library-status');
const gameLibrarySyncWarning = document.getElementById('game-library-sync-warning');
const gameLibraryInsights = document.getElementById('game-library-insights');
const gameLibraryList = document.getElementById('game-library-list');
const openingTrainerSelect = document.getElementById('opening-trainer-select');
const openingTrainerStartButton = document.getElementById('opening-trainer-start');
const openingTrainerHintButton = document.getElementById('opening-trainer-hint');
const openingTrainerStatus = document.getElementById('opening-trainer-status');
const progressDashboard = document.getElementById('progress-dashboard');
const studyGoalsForm = document.getElementById('study-goals-form');
const studyGoalReviewsInput = document.getElementById('study-goal-reviews');
const studyGoalMistakesInput = document.getElementById('study-goal-mistakes');
const studyGoalOpeningsInput = document.getElementById('study-goal-openings');
const studyGoalsProgress = document.getElementById('study-goals-progress');
const studyGoalsStatus = document.getElementById('study-goals-status');
const gameAccountImportForm = document.getElementById('game-account-import-form');
const tablebaseStatus = document.getElementById('tablebase-status');
const tablebaseMoves = document.getElementById('tablebase-moves');
const positionInsights = document.getElementById('position-insights');
const setupPiece = document.getElementById('setup-piece');
const setupColor = document.getElementById('setup-color');
const setupTurn = document.getElementById('setup-turn');
const setupEnPassant = document.getElementById('setup-en-passant');
const setupStatus = document.getElementById('setup-status');
const accountForm = document.getElementById('account-form');
const accountNameField = document.getElementById('account-name-field');
const accountNameInput = document.getElementById('account-name');
const accountEmailInput = document.getElementById('account-email');
const accountPasswordInput = document.getElementById('account-password');
const accountSubmitButton = document.getElementById('account-submit-button');
const accountModeButton = document.getElementById('account-mode-button');
const accountResetButton = document.getElementById('account-reset-button');
const accountStatus = document.getElementById('account-status');
const accountSignedIn = document.getElementById('account-signed-in');
const accountIdentity = document.getElementById('account-identity');
const accountSignoutButton = document.getElementById('account-signout-button');
const accountPasswordForm = document.getElementById('account-password-form');
const accountNewPassword = document.getElementById('account-new-password');
const accountChangePasswordToggle = document.getElementById('account-change-password-toggle');
const files = 'abcdefgh';
const pieceNames = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn'
};
let selectedSquare = null;
let legalMoves = [];
let stockfishWorker = null;
let engineReady = false;
let engineFailed = false;
let configuredMultiPv = null;
let reconfigureAfterStop = false;
let multiPv = Number(multipvSelect.value);
let engineDepth = Number(engineDepthInput.value);
let activeFen = null;
let activeDepth = Number(engineDepthInput.value);
const pendingFens = [];
let stopRequested = false;
let rootNode = createRootNode(game.fen());
let currentNode = rootNode;
let nextNodeId = 1;
let currentLines = new Map();
const linesByFen = new Map();
const candidateLineCache = new Map();
let explorerController = null;
let explorerFen = null;
let explorerAccessToken = '';
let tablebaseController = null;
let tablebaseFen = null;
let annotationTool = null;
let pendingArrowFrom = null;
let setupMode = false;
let setupPosition = null;
let practiceTargetNode = null;
let practiceSessionContext = null;
let openingTrainerSession = null;
let openingHintVisible = false;
let currentLibraryGameId = null;
const openingClassificationCache = new Map();
let reviewRequested = false;
let showTactics = false;
let tacticalIdeas = [];
const evaluations = new Map();
const bestMoves = new Map();
const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

function updateEvaluationBar(whiteAdvantage) {
  const clampedAdvantage = Math.max(0, Math.min(100, whiteAdvantage));
  evaluationFill.style.setProperty('--evaluation-fill', `${clampedAdvantage}%`);
}

function createChessBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.square = `${files[col]}${8 - row}`;
      board.appendChild(square);
    }
  }

  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.classList.add('board-annotation-overlay');
  overlay.setAttribute('viewBox', '0 0 800 800');
  overlay.setAttribute('preserveAspectRatio', 'none');
  overlay.setAttribute('aria-hidden', 'true');
  board.appendChild(overlay);
}

function updateStatus() {
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White';
    status.textContent = `Checkmate — ${winner} wins!`;
  } else if (game.isDraw()) {
    status.textContent = 'Draw';
  } else {
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    status.textContent = `${turn} to move${game.isCheck() ? ' — Check!' : ''}`;
  }
}

function updateMoveHistory() {
  const path = getDisplayedPath(currentNode);
  const currentPath = getNodePath(currentNode);
  moveHistory.replaceChildren();
  moveCount.textContent = String(path.length);
  currentPly.textContent = currentPath.length
    ? `Move ${Math.ceil(currentPath.length / 2)}${currentPath.length % 2 ? '…' : ''}`
    : 'Start position';
  historyEmpty.hidden = path.length > 0;
  openingNotation.querySelector('strong').textContent = identifyOpening(path);

  for (let index = 0; index < path.length; index += 2) {
    const row = document.createElement('li');
    row.classList.add('move-row');

    const moveNumber = document.createElement('span');
    moveNumber.classList.add('move-number');
    moveNumber.textContent = `${path[index].moveNumber}.`;

    const whiteMove = document.createElement('span');
    whiteMove.classList.add('move-notation');
    whiteMove.textContent = path[index].san;

    row.append(moveNumber, createAnnotatedMove(whiteMove, path[index]));

    if (path[index + 1]) {
      const blackMove = document.createElement('span');
      blackMove.classList.add('move-notation');
      blackMove.textContent = path[index + 1].san;
      row.appendChild(createAnnotatedMove(blackMove, path[index + 1]));
    }

    if (index + 2 >= path.length) row.classList.add('latest-move');
    if (path.slice(index, index + 2).includes(currentNode)) row.classList.add('current-move-row');

    moveHistory.appendChild(row);
  }

  moveHistory.querySelector('.current-history-move')?.scrollIntoView({ block: 'nearest' });
  renderVariationsTree();
  positionComment.value = currentNode.comment ?? '';
  commentStatus.textContent = 'Attached to this position; save the collection to persist it.';
}

function getDisplayedPath(node) {
  const path = getNodePath(node);
  while (node.preferredChild ?? node.children[0]) {
    node = node.preferredChild ?? node.children[0];
    path.push(node);
  }
  return path;
}

function getPgnSections(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const games = trimmed.split(/(?=^\[Event\s)/m).map((pgn) => pgn.trim()).filter(Boolean);
  return games;
}

function createImportedGame(pgn, index, playerName) {
  const parsedGame = new Chess();
  parsedGame.loadPgn(pgn);
  const history = parsedGame.history({ verbose: true });
  if (!history.length) throw new Error('The PGN contains no moves.');
  const headers = parsedGame.getHeaders();
  const name = playerName.trim().toLocaleLowerCase();
  const white = headers.White ?? 'White';
  const black = headers.Black ?? 'Black';
  const playerColor = name && white.toLocaleLowerCase() === name
    ? 'w'
    : name && black.toLocaleLowerCase() === name
      ? 'b'
      : null;
  const result = ['1-0', '0-1', '1/2-1/2'].includes(headers.Result) ? headers.Result : '*';
  const playerResult = playerColor && result !== '*'
    ? result === '1/2-1/2'
      ? 'draw'
      : (result === '1-0') === (playerColor === 'w')
        ? 'win'
        : 'loss'
    : null;
  const normalizedPgn = pgn.trim();
  const date = headers.UTCDate || (headers.Date === '????.??.??' ? '' : headers.Date) || '';
  let hash = 2166136261;
  for (let char = 0; char < normalizedPgn.length; char++) {
    hash = Math.imul(hash ^ normalizedPgn.charCodeAt(char), 16777619);
  }
  return {
    id: `pgn-${(hash >>> 0).toString(16)}`,
    pgn: normalizedPgn,
    event: headers.Event || `Imported game ${index + 1}`,
    date,
    white,
    black,
    result,
    opening: identifyOpening(history),
    moveCount: history.length,
    moves: history.map((move) => ({
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ''}`
    })),
    importedAt: new Date().toISOString(),
    source: 'pgn',
    sourceUsername: '',
    playerColor,
    playerResult
  };
}

async function importPgnBatch(rawPgn, playerName, source = 'pgn') {
  const trimmedPgn = rawPgn.trim();
  if (!trimmedPgn) throw new Error('No PGN games were found to import.');
  if (trimmedPgn.length > 500000) throw new Error('The PGN exceeds the 500,000-character limit.');
  const pgnSections = getPgnSections(trimmedPgn);
  if (pgnSections.length > 100) throw new Error('Import up to 100 games at a time.');
  const ownerId = currentUser?.id ?? null;
  const previousGames = gameLibrary;
  const imported = [];
  const errors = [];
  pgnSections.forEach((pgn, index) => {
    try {
      imported.push({
        ...createImportedGame(pgn, index, playerName),
        source,
        sourceUsername: playerName.trim()
      });
    } catch (error) {
      errors.push(`Game ${index + 1}: ${error.message}`);
    }
  });
  if (!imported.length) {
    const detail = errors.slice(0, 3).join(' ');
    throw new Error(detail || 'No games were found to import.');
  }

  const existingIds = new Set(gameLibrary.map((entry) => entry.id));
  const uniqueGames = imported.filter((entry) => {
    if (existingIds.has(entry.id)) return false;
    existingIds.add(entry.id);
    return true;
  });
  const duplicates = imported.length - uniqueGames.length;
  gameLibrary = [...gameLibrary, ...uniqueGames].slice(-100);
  try {
    await persistUserData();
    renderGameLibrary();
    const savedLocation = ownerId ? 'to your account' : 'in this browser';
    const detail = [
      `${uniqueGames.length} new game${uniqueGames.length === 1 ? '' : 's'} imported ${savedLocation}.`,
      duplicates ? `${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped.` : '',
      errors.length ? `${errors.length} invalid game${errors.length === 1 ? '' : 's'} skipped: ${errors.slice(0, 2).join(' ')}` : ''
    ].filter(Boolean);
    return { imported: uniqueGames.length, duplicates, errors: errors.length, message: detail.join(' ') };
  } catch (error) {
    if ((currentUser?.id ?? null) === ownerId) gameLibrary = previousGames;
    renderGameLibrary();
    throw new Error(`Could not save imported games: ${error.message}`);
  }
}

function renderGameLibrary() {
  if (isOpeningBookReady()) {
    gameLibrary = gameLibrary.map((entry) => {
      let cached = openingClassificationCache.get(entry.id);
      if (!cached || cached.pgn !== entry.pgn) {
        try {
          const parsed = new Chess();
          parsed.loadPgn(entry.pgn);
          cached = { pgn: entry.pgn, opening: identifyOpening(parsed.history({ verbose: true })) };
          openingClassificationCache.set(entry.id, cached);
        } catch (error) {
          console.error(`Could not classify the opening in game ${entry.id}.`, error);
          return entry;
        }
      }
      return entry.opening === cached.opening ? entry : { ...entry, opening: cached.opening };
    });
  }
  const personalGames = gameLibrary.filter((entry) => entry.playerResult);
  const reviewedGames = gameLibrary.filter((entry) => entry.review && typeof entry.review === 'object');
  const wins = personalGames.filter((entry) => entry.playerResult === 'win').length;
  const draws = personalGames.filter((entry) => entry.playerResult === 'draw').length;
  const losses = personalGames.filter((entry) => entry.playerResult === 'loss').length;
  const openingCounts = new Map();
  for (const entry of gameLibrary) {
    const opening = openingCounts.get(entry.opening) ?? { total: 0, wins: 0, draws: 0, losses: 0, rated: 0 };
    opening.total++;
    if (entry.playerResult) {
      opening.rated++;
      opening[entry.playerResult === 'win' ? 'wins' : entry.playerResult === 'draw' ? 'draws' : 'losses']++;
    }
    openingCounts.set(entry.opening, opening);
  }

  gameLibraryInsights.replaceChildren();
  if (!gameLibrary.length) {
    gameLibraryInsights.textContent = 'Import PGNs to build an opening and results profile from your games.';
  } else {
    const formatResultCount = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
    const summary = document.createElement('p');
    summary.classList.add('game-library-summary');
    summary.textContent = personalGames.length
      ? `${gameLibrary.length} games · Personal record ${formatResultCount(wins, 'win', 'wins')}, ${formatResultCount(draws, 'draw', 'draws')}, ${formatResultCount(losses, 'loss', 'losses')}`
      : `${gameLibrary.length} games imported · Add your exact PGN player name on import to see your personal results`;
    gameLibraryInsights.appendChild(summary);

    if (reviewedGames.length) {
      const savedAccuracies = reviewedGames
        .map((entry) => entry.review.playerAccuracy)
        .filter((accuracy) => Number.isFinite(accuracy));
      const analysisSummary = document.createElement('p');
      analysisSummary.classList.add('game-library-summary', 'game-library-review-summary');
      analysisSummary.textContent = savedAccuracies.length
        ? `${reviewedGames.length} Stockfish review${reviewedGames.length === 1 ? '' : 's'} saved · ${savedAccuracies.length === 1 ? 'Average estimated accuracy' : 'Average estimated personal accuracy'} ${(
          savedAccuracies.reduce((total, accuracy) => total + accuracy, 0) / savedAccuracies.length
        ).toFixed(1)}%`
        : `${reviewedGames.length} Stockfish review${reviewedGames.length === 1 ? '' : 's'} saved`;
      gameLibraryInsights.appendChild(analysisSummary);

      const recurringThemes = new Map();
      for (const entry of reviewedGames) {
        for (const [category, count] of Object.entries(entry.review.categoryCounts ?? {})) {
          recurringThemes.set(category, (recurringThemes.get(category) ?? 0) + Number(count));
        }
      }
      const practiceCategories = ['Miss', 'Blunder', 'Mistake', 'Inaccuracy'];
      const practiceTheme = practiceCategories
        .map((category) => [category, recurringThemes.get(category) ?? 0])
        .sort((left, right) => right[1] - left[1])
        .find(([, count]) => count > 0);
      if (practiceTheme) {
        const practiceNote = document.createElement('p');
        practiceNote.classList.add('game-library-tip');
        practiceNote.textContent = `Review theme: ${practiceTheme[0]} labels appeared ${practiceTheme[1]} time${practiceTheme[1] === 1 ? '' : 's'} across saved Stockfish reviews. Revisit those positions and try the suggested moves.`;
        gameLibraryInsights.appendChild(practiceNote);
      }
    }

    const openingTitle = document.createElement('h3');
    openingTitle.textContent = 'Opening patterns';
    const openingList = document.createElement('ul');
    openingList.classList.add('opening-insight-list');
    const topOpenings = [...openingCounts.entries()]
      .sort((left, right) => right[1].total - left[1].total || left[0].localeCompare(right[0]))
      .slice(0, 5);
    for (const [opening, stats] of topOpenings) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = opening;
      const detail = document.createElement('span');
      detail.textContent = stats.rated
        ? `${stats.total} game${stats.total === 1 ? '' : 's'} · ${stats.wins}W ${stats.draws}D ${stats.losses}L as you`
        : `${stats.total} game${stats.total === 1 ? '' : 's'}`;
      item.append(name, detail);
      openingList.appendChild(item);
    }
    gameLibraryInsights.append(openingTitle, openingList);
    const practiceTip = document.createElement('p');
    practiceTip.classList.add('game-library-tip');
    const weakestOpening = topOpenings
      .filter(([, stats]) => stats.rated >= 2 && stats.losses > stats.wins)
      .sort((left, right) => (right[1].losses - right[1].wins) - (left[1].losses - left[1].wins))[0];
    practiceTip.textContent = weakestOpening
      ? `Practice idea: review your ${weakestOpening[0]} games. Your imported results show more losses than wins in this opening.`
      : 'Practice idea: import more completed games to reveal openings where your results could improve.';
    gameLibraryInsights.appendChild(practiceTip);
  }

  gameLibraryList.replaceChildren();
  for (const entry of gameLibrary.slice(-20).reverse()) {
    const item = document.createElement('li');
    item.classList.add('game-library-item');
    const info = document.createElement('div');
    info.classList.add('game-library-game-info');
    const title = document.createElement('strong');
    title.textContent = `${entry.white} vs ${entry.black}`;
    const detail = document.createElement('span');
    const savedReview = entry.review
      ? ` · Reviewed${Number.isFinite(entry.review.playerAccuracy) ? ` · ${entry.review.playerAccuracy.toFixed(1)}% estimated accuracy` : ''}`
      : '';
    detail.textContent = `${entry.opening} · ${entry.result} · ${entry.moveCount} plies${entry.date ? ` · ${entry.date}` : ''}${savedReview}`;
    info.append(title, detail);
    const actions = document.createElement('div');
    actions.classList.add('game-library-actions');
    const reviewButton = document.createElement('button');
    reviewButton.type = 'button';
    reviewButton.classList.add('secondary-button');
    reviewButton.dataset.gameAction = 'review';
    reviewButton.dataset.gameId = entry.id;
    reviewButton.textContent = 'Review';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('secondary-button');
    removeButton.dataset.gameAction = 'remove';
    removeButton.dataset.gameId = entry.id;
    removeButton.textContent = 'Remove';
    actions.append(reviewButton, removeButton);
    item.append(info, actions);
    gameLibraryList.appendChild(item);
  }
  if (gameLibrary.length > 20) {
    const note = document.createElement('li');
    note.classList.add('tool-description');
    note.textContent = `Showing the 20 most recently imported games of ${gameLibrary.length}.`;
    gameLibraryList.appendChild(note);
  }
  renderGameLibrarySyncState();
  renderMistakePracticeQueue();
  renderOpeningTrainer();
  renderProgressDashboard();
}

function renderMistakePracticeQueue() {
  const mistakes = gameLibrary.flatMap((entry) =>
    (Array.isArray(entry.review?.mistakes) ? entry.review.mistakes : [])
      .filter((mistake) => !mistake.solved)
      .map((mistake) => ({ game: entry, mistake }))
  );
  const solvedCount = gameLibrary.reduce((total, entry) =>
    total + (entry.review?.mistakes ?? []).filter((mistake) => mistake.solved).length, 0
  );
  mistakePracticeQueue.replaceChildren();
  mistakePracticeSection.hidden = !mistakes.length && !solvedCount;
  for (const { game: entry, mistake } of mistakes.slice(0, 10)) {
    const item = document.createElement('li');
    item.classList.add('mistake-practice-item');
    const description = document.createElement('div');
    description.classList.add('mistake-practice-description');
    const label = document.createElement('strong');
    label.textContent = `${entry.white} vs ${entry.black} · ${mistake.moveNumber}${mistake.color === 'b' ? '…' : '.'} ${mistake.san}`;
    const detail = document.createElement('span');
    detail.textContent = `${mistake.category} · ${entry.opening}${mistake.attempts ? ` · ${mistake.attempts} attempt${mistake.attempts === 1 ? '' : 's'}` : ''}`;
    description.append(label, detail);
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('secondary-button');
    button.dataset.practiceGameId = entry.id;
    button.dataset.practiceMistakeId = mistake.id;
    button.textContent = 'Practice';
    item.append(description, button);
    mistakePracticeQueue.appendChild(item);
  }
  if (!mistakes.length && solvedCount) {
    const complete = document.createElement('li');
    complete.classList.add('practice-queue-complete');
    complete.textContent = `All caught up — ${solvedCount} position${solvedCount === 1 ? '' : 's'} solved.`;
    mistakePracticeQueue.appendChild(complete);
  } else if (mistakes.length > 10) {
    const remaining = document.createElement('li');
    remaining.classList.add('practice-queue-complete');
    remaining.textContent = `${mistakes.length - 10} more position${mistakes.length - 10 === 1 ? '' : 's'} waiting in your queue.`;
    mistakePracticeQueue.appendChild(remaining);
  }
}

function getOpeningTrainingLines() {
  const linesByOpening = new Map();
  for (const entry of gameLibrary) {
    try {
      const source = new Chess();
      source.loadPgn(entry.pgn);
      const moves = source.history({ verbose: true }).slice(0, 12).map((move) => ({
        san: move.san,
        uci: `${move.from}${move.to}${move.promotion ?? ''}`
      }));
      if (moves.length < 4) continue;
      const opening = entry.opening || 'Opening not identified';
      const lines = linesByOpening.get(opening) ?? [];
      const lineKey = moves.map((move) => move.uci).join(' ');
      if (!lines.some((line) => line.key === lineKey)) {
        lines.push({ key: lineKey, gameId: entry.id, pgn: entry.pgn, moves });
      }
      linesByOpening.set(opening, lines);
    } catch (error) {
      console.error(`Could not create an opening line from game ${entry.id}.`, error);
    }
  }
  return linesByOpening;
}

function renderOpeningTrainer() {
  const selectedOpening = openingTrainerSelect.value;
  const linesByOpening = getOpeningTrainingLines();
  openingTrainerSelect.replaceChildren();
  if (!linesByOpening.size) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Import games to build your repertoire';
    openingTrainerSelect.appendChild(option);
    openingTrainerSelect.disabled = true;
    openingTrainerStartButton.disabled = true;
    openingTrainerHintButton.disabled = true;
    openingTrainerStatus.textContent = openingTrainerSession
      ? openingTrainerStatus.textContent
      : 'Import PGN games with at least four moves to build opening lines from your own play.';
    return;
  }

  openingTrainerSelect.disabled = false;
  for (const [opening, lines] of linesByOpening) {
    const option = document.createElement('option');
    option.value = opening;
    const practiced = gameLibrary.reduce((total, entry) =>
      total + (entry.opening === opening ? Number(entry.openingPractice?.completedLines ?? 0) : 0), 0
    );
    option.textContent = `${opening} · ${lines.length} line${lines.length === 1 ? '' : 's'}${practiced ? ` · ${practiced} completed` : ''}`;
    openingTrainerSelect.appendChild(option);
  }
  if (linesByOpening.has(selectedOpening)) openingTrainerSelect.value = selectedOpening;
  openingTrainerStartButton.disabled = false;
  if (!openingTrainerSession) openingTrainerStatus.textContent = 'Choose an opening and start a recall session on the board.';
}

function getMondayStart(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isThisWeek(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= getMondayStart() && date <= new Date();
}

function renderProgressDashboard() {
  progressDashboard.replaceChildren();
  const completedMistakes = gameLibrary.reduce((total, entry) =>
    total + (entry.review?.mistakes ?? []).filter((mistake) => mistake.solved).length, 0
  );
  const reviews = reviewEntries.filter((entry) => Number.isFinite(entry.playerAccuracy));
  const averageAccuracy = reviews.length
    ? reviews.reduce((total, entry) => total + entry.playerAccuracy, 0) / reviews.length
    : null;
  const metrics = [
    ['Games in library', String(gameLibrary.length)],
    ['Est. avg. personal accuracy', averageAccuracy === null ? '—' : `${averageAccuracy.toFixed(1)}%`],
    ['Practice positions solved', String(completedMistakes)]
  ];
  const metricGrid = document.createElement('div');
  metricGrid.classList.add('progress-metrics');
  for (const [label, value] of metrics) {
    const metric = document.createElement('div');
    metric.classList.add('progress-metric');
    const metricValue = document.createElement('strong');
    metricValue.textContent = value;
    const metricLabel = document.createElement('span');
    metricLabel.textContent = label;
    metric.append(metricValue, metricLabel);
    metricGrid.appendChild(metric);
  }
  progressDashboard.appendChild(metricGrid);

  const recentReviews = reviewEntries.filter((entry) => Number.isFinite(entry.playerAccuracy)).slice(-7);
  if (recentReviews.length >= 2) {
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = 'Estimated accuracy over recent reviews';
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chart.classList.add('progress-chart');
    chart.setAttribute('viewBox', '0 0 640 130');
    chart.setAttribute('role', 'img');
    chart.setAttribute('aria-label', 'Estimated accuracy across recent saved game reviews');
    const points = recentReviews.map((entry, index) => {
      const accuracy = entry.playerAccuracy;
      return {
        x: 28 + index * 584 / Math.max(1, recentReviews.length - 1),
        y: 106 - Math.max(0, Math.min(100, accuracy)) * 0.82,
        accuracy,
        savedAt: entry.savedAt
      };
    }).filter((point) => Number.isFinite(point.accuracy));
    const baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseline.setAttribute('x1', '28');
    baseline.setAttribute('x2', '612');
    baseline.setAttribute('y1', '106');
    baseline.setAttribute('y2', '106');
    baseline.classList.add('progress-chart-baseline');
    chart.appendChild(baseline);
    if (points.length > 1) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('points', points.map((point) => `${point.x},${point.y}`).join(' '));
      line.classList.add('progress-chart-line');
      chart.appendChild(line);
    }
    for (const point of points) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', String(point.x));
      dot.setAttribute('cy', String(point.y));
      dot.setAttribute('r', '4');
      dot.setAttribute('aria-label', `${point.accuracy.toFixed(1)} percent on ${new Date(point.savedAt).toLocaleDateString()}`);
      dot.classList.add('progress-chart-point');
      chart.appendChild(dot);
    }
    progressDashboard.append(chartTitle, chart);
  } else {
    const empty = document.createElement('p');
    empty.classList.add('tool-description');
    empty.textContent = 'Save reviews of more games to see your accuracy trend here.';
    progressDashboard.appendChild(empty);
  }

  const themes = new Map();
  for (const entry of gameLibrary) {
    for (const [category, count] of Object.entries(entry.review?.categoryCounts ?? {})) {
      themes.set(category, (themes.get(category) ?? 0) + Number(count));
    }
  }
  const weakest = [...themes.entries()]
    .filter(([category]) => ['Miss', 'Blunder', 'Mistake', 'Inaccuracy'].includes(category))
    .sort((left, right) => right[1] - left[1])[0];
  const focus = document.createElement('p');
  focus.classList.add('game-library-tip');
  focus.textContent = weakest
    ? `Suggested focus: review ${weakest[0].toLowerCase()} positions (${weakest[1]} recorded across saved reviews). Accuracy and move labels are estimates.`
    : 'Review and save imported games to uncover your most common mistakes and track progress over time.';
  progressDashboard.appendChild(focus);
  renderStudyGoals();
}

function renderStudyGoals() {
  studyGoalReviewsInput.value = String(studyGoals.reviews);
  studyGoalMistakesInput.value = String(studyGoals.mistakes);
  studyGoalOpeningsInput.value = String(studyGoals.openings);
  studyGoalsProgress.replaceChildren();
  const reviewsThisWeek = reviewEntries.filter((entry) => isThisWeek(entry.savedAt)).length;
  const mistakesThisWeek = gameLibrary.reduce((total, entry) =>
    total + (entry.review?.mistakes ?? []).filter((mistake) => mistake.solved && isThisWeek(mistake.solvedAt)).length, 0
  );
  const openingsThisWeek = gameLibrary.reduce((total, entry) =>
    total + (entry.openingPractice?.sessionDates ?? []).filter(isThisWeek).length, 0
  );
  const goals = [
    ['Game reviews', reviewsThisWeek, studyGoals.reviews],
    ['Mistakes solved', mistakesThisWeek, studyGoals.mistakes],
    ['Opening sessions', openingsThisWeek, studyGoals.openings]
  ];
  for (const [label, progress, target] of goals) {
    const item = document.createElement('div');
    item.classList.add('study-goal-item');
    const heading = document.createElement('div');
    heading.classList.add('study-goal-heading');
    const name = document.createElement('strong');
    name.textContent = label;
    const count = document.createElement('span');
    count.textContent = `${Math.min(progress, target)} / ${target}`;
    heading.append(name, count);
    const meter = document.createElement('progress');
    meter.max = target;
    meter.value = Math.min(progress, target);
    meter.setAttribute('aria-label', `${label}: ${Math.min(progress, target)} of ${target} this week`);
    item.append(heading, meter);
    studyGoalsProgress.appendChild(item);
  }
}

function loadPgnText(pgn, libraryGameId = null) {
  const nextGame = new Chess();
  nextGame.loadPgn(pgn.trim());
  const movesLoaded = nextGame.history().length;
  game = nextGame;
  fenInput.value = nextGame.fen();
  setupMode = false;
  setupPosition = null;
  reviewRequested = false;
  practiceTargetNode = null;
  practiceSessionContext = null;
  openingTrainerSession = null;
  openingTrainerHintButton.disabled = true;
  openingTrainerHintButton.textContent = 'Show hint';
  selectedSquare = null;
  legalMoves = [];
  pendingFens.length = 0;
  currentLines.clear();
  explorerFen = null;
  tablebaseFen = null;
  currentLibraryGameId = libraryGameId;
  buildTreeFromGame(nextGame);
  loadStatus.textContent = `PGN loaded: ${movesLoaded} half-move${movesLoaded === 1 ? '' : 's'}.`;
  renderBoard();
  renderGameReview();
}

function createAnnotatedMove(notation, node) {
  const cell = document.createElement('span');
  cell.classList.add('move-cell');
  const moveButton = document.createElement('button');
  moveButton.classList.add('history-move-button');
  moveButton.type = 'button';
  moveButton.dataset.nodeId = String(node.id);
  moveButton.textContent = notation.textContent;
  moveButton.setAttribute('aria-label', `Go to ${notation.textContent}`);
  if (node.annotation?.label) moveButton.title = node.annotation.label;
  if (node === currentNode) moveButton.classList.add('current-history-move');
  cell.appendChild(moveButton);

  const annotation = node.annotation;
  if (annotation?.category) {
    const marker = document.createElement('span');
    marker.classList.add('move-quality');
    marker.classList.add(`quality-${annotation.category.toLowerCase()}`);
    marker.textContent = annotation.symbol || '·';
    marker.title = annotation.label;
    marker.setAttribute('aria-label', annotation.label);
    cell.appendChild(marker);
  }

  return cell;
}

function createRootNode(fen) {
  return {
    id: 0,
    fen,
    parent: null,
    children: [],
    preferredChild: null,
    comment: '',
    highlights: [],
    arrows: []
  };
}

function getNodePath(node) {
  const path = [];
  while (node?.parent) {
    path.push(node);
    node = node.parent;
  }
  return path.reverse();
}

function findNodeById(node, id) {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function renderVariationBranch(parent, list) {
  for (const child of parent.children) {
    const item = document.createElement('li');
    item.classList.add('variation-item');
    const moveButton = document.createElement('button');
    moveButton.classList.add('variation-move');
    moveButton.type = 'button';
    moveButton.dataset.nodeId = String(child.id);
    moveButton.textContent = `${child.color === 'b' ? `${child.moveNumber}… ` : `${child.moveNumber}. `}${child.san}`;
    if (child.annotation?.category) {
      moveButton.textContent += ` · ${child.annotation.category}`;
      if (child.annotation.symbol) moveButton.textContent += ` ${child.annotation.symbol}`;
      moveButton.title = child.annotation.label;
    }
    if (child === currentNode) moveButton.classList.add('current-variation-move');
    if (child.comment) {
      moveButton.title = child.comment;
      moveButton.classList.add('has-comment');
    }

    item.appendChild(moveButton);
    if (child.children.length) {
      const continuation = document.createElement('ol');
      continuation.classList.add('variation-children');
      renderVariationBranch(child, continuation);
      item.appendChild(continuation);
    }
    list.appendChild(item);
  }
}

function renderVariationsTree() {
  variationsTree.replaceChildren();
  const list = document.createElement('ol');
  list.classList.add('variation-root');
  renderVariationBranch(rootNode, list);
  if (list.childElementCount) variationsTree.appendChild(list);
}

function renderBoardArrows() {
  const overlay = board.querySelector('.board-annotation-overlay');
  if (!overlay) return;
  overlay.replaceChildren();
  if (setupMode) return;

  for (const arrow of currentNode.arrows ?? []) {
    appendBoardArrow(overlay, arrow.from, arrow.to, 'annotation-arrow');
  }
  if (showTactics) {
    for (const idea of tacticalIdeas) {
      if (idea.from && idea.to) appendBoardArrow(overlay, idea.from, idea.to, `tactic-arrow-${idea.type}`);
      if (idea.square) {
        const mark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        mark.setAttribute('cx', String(files.indexOf(idea.square[0]) * 100 + 50));
        mark.setAttribute('cy', String((8 - Number(idea.square[1])) * 100 + 50));
        mark.setAttribute('r', '39');
        mark.classList.add('tactic-mark', `tactic-mark-${idea.type}`);
        overlay.appendChild(mark);
      }
    }
  }
}

function appendBoardArrow(overlay, from, to, className) {
  const startX = files.indexOf(from[0]) * 100 + 50;
  const startY = (8 - Number(from[1])) * 100 + 50;
  const endX = files.indexOf(to[0]) * 100 + 50;
  const endY = (8 - Number(to[1])) * 100 + 50;
  const length = Math.hypot(endX - startX, endY - startY);
  if (length === 0) return;

  const inset = Math.min(20, length / 3);
  const unitX = (endX - startX) / length;
  const unitY = (endY - startY) / length;
  const tipX = endX - unitX * inset;
  const tipY = endY - unitY * inset;
  const baseX = tipX - unitX * 26;
  const baseY = tipY - unitY * 26;
  const perpendicularX = -unitY * 10;
  const perpendicularY = unitX * 10;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(startX + unitX * inset));
  line.setAttribute('y1', String(startY + unitY * inset));
  line.setAttribute('x2', String(baseX));
  line.setAttribute('y2', String(baseY));
  line.classList.add('analysis-arrow', className);
  overlay.appendChild(line);

  const head = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  head.setAttribute(
    'd',
    `M ${tipX} ${tipY} L ${baseX + perpendicularX} ${baseY + perpendicularY} L ${baseX - perpendicularX} ${baseY - perpendicularY} Z`
  );
  head.classList.add('analysis-arrow-head', className);
  overlay.appendChild(head);
}

function renderPositionInsights() {
  positionInsights.replaceChildren();
  tacticalIdeas = [];
  if (setupMode || game.isGameOver()) {
    const message = document.createElement('p');
    message.textContent = setupMode ? 'Finish position setup to see tactical insights.' : 'No tactical continuations in a finished game.';
    positionInsights.appendChild(message);
    renderBoardArrows();
    return;
  }

  const boardPieces = game.board().flat().filter(Boolean);
  const nonKingCount = boardPieces.filter((piece) => piece.type !== 'k').length;
  const phase = nonKingCount <= 6 ? 'Endgame' : game.moveNumber() <= 10 ? 'Opening' : 'Middlegame';
  const addInsight = (text, className = '') => {
    const item = document.createElement('p');
    item.classList.add('insight-item');
    if (className) item.classList.add(className);
    item.textContent = text;
    positionInsights.appendChild(item);
  };
  addInsight(`${phase} position · ${boardPieces.length} pieces on the board`, 'insight-phase');

  const sideToMove = game.turn();
  const opponent = sideToMove === 'w' ? 'b' : 'w';
  const exposed = [];
  for (const [rankIndex, rank] of game.board().entries()) {
    for (const [fileIndex, piece] of rank.entries()) {
      if (!piece || piece.color !== opponent || piece.type === 'k') continue;
      const square = `${files[fileIndex]}${8 - rankIndex}`;
      if (game.isAttacked(square, sideToMove)) {
        exposed.push({ square, piece, defended: game.isAttacked(square, opponent) });
      }
    }
  }
  const undefended = exposed.filter(({ defended }) => !defended);
  if (undefended.length) {
    addInsight(
      `${sideToMove === 'w' ? 'White' : 'Black'} may have a hanging target: ${undefended.map(({ piece, square }) => `${piece.type.toUpperCase()} on ${square}`).join(', ')} is attacked without a visible defender.`
    );
    tacticalIdeas.push(...undefended.map(({ square }) => ({ type: 'hanging', square })));
  } else if (exposed.length) {
    addInsight(`The side to move is attacking ${exposed.length} opposing piece${exposed.length === 1 ? '' : 's'}; check for tactical captures.`);
  }

  const positionBoard = game.board();
  const enemyKing = positionBoard.flatMap((rank, rankIndex) =>
    rank.map((piece, fileIndex) =>
      piece?.color === opponent && piece.type === 'k'
        ? { square: `${files[fileIndex]}${8 - rankIndex}`, rank: rankIndex, file: fileIndex }
        : null
    )
  ).find(Boolean);
  if (enemyKing) {
    const directions = [
      [-1, 0, ['r', 'q']], [1, 0, ['r', 'q']], [0, -1, ['r', 'q']], [0, 1, ['r', 'q']],
      [-1, -1, ['b', 'q']], [-1, 1, ['b', 'q']], [1, -1, ['b', 'q']], [1, 1, ['b', 'q']]
    ];
    let pinnedPiece = null;
    for (const [rankStep, fileStep, sliders] of directions) {
      let rank = enemyKing.rank + rankStep;
      let file = enemyKing.file + fileStep;
      let candidate = null;
      while (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
        const piece = positionBoard[rank][file];
        if (piece) {
          if (!candidate && piece.color === opponent) {
            candidate = { square: `${files[file]}${8 - rank}`, piece };
          } else if (candidate) {
            if (piece.color === sideToMove && sliders.includes(piece.type)) pinnedPiece = candidate;
            break;
          } else {
            break;
          }
        }
        rank += rankStep;
        file += fileStep;
      }
      if (pinnedPiece) break;
    }
    if (pinnedPiece) {
      addInsight(`${pinnedPiece.piece.type.toUpperCase()} on ${pinnedPiece.square} is pinned to its king.`);
      tacticalIdeas.push({ type: 'pin', from: pinnedPiece.square, to: enemyKing.square });
    }
  }

  const topLine = currentLines.get(1);
  const mateScore = topLine?.score.match(/^(-?)M(\d+)$/);
  const isSideToMoveMating = mateScore
    && Number(mateScore[2]) === 1
    && ((sideToMove === 'w' && !mateScore[1]) || (sideToMove === 'b' && Boolean(mateScore[1])));
  if (isSideToMoveMating && topLine.firstMove) {
    const mate = topLine.firstMove;
    addInsight(`Mate in 1 is available: ${mate.san} checkmates immediately.`, 'insight-tactic');
    tacticalIdeas.push({ type: 'mate', from: mate.from, to: mate.to });
  }

  const forks = [];
  const legalMovesNow = game.moves({ verbose: true });
  for (const move of legalMovesNow) {
    const played = game.move(move);
    const targets = [];
    for (const [rankIndex, rank] of game.board().entries()) {
      for (const [fileIndex, piece] of rank.entries()) {
        if (!piece || piece.color !== opponent || piece.type === 'k') continue;
        const square = `${files[fileIndex]}${8 - rankIndex}`;
        if (
          square !== move.to
          && pieceValues[piece.type] >= 3
          && game.isAttacked(square, sideToMove)
        ) targets.push(piece);
      }
    }
    if (targets.length >= 2 && !played.san.endsWith('#')) {
      forks.push({ san: played.san, count: targets.length, from: move.from, to: move.to });
    }
    game.undo();
  }
  if (forks.length) {
    addInsight(`Fork idea: ${forks[0].san} attacks ${forks[0].count} valuable targets.`);
    tacticalIdeas.push({ type: 'fork', from: forks[0].from, to: forks[0].to });
  }

  const reviewedMoves = getReviewMoves();
  const phaseLosses = new Map([['Opening', []], ['Middlegame', []], ['Endgame', []]]);
  for (const { node, loss } of reviewedMoves) {
    const position = new Chess(node.annotation.beforeFen);
    const material = position.board().flat().filter((piece) => piece && piece.type !== 'k').length;
    const movePhase = material <= 6 ? 'Endgame' : node.moveNumber <= 10 ? 'Opening' : 'Middlegame';
    phaseLosses.get(movePhase).push(loss);
  }
  const phaseScores = [...phaseLosses]
    .map(([name, losses]) => [name, estimateAccuracy(losses)])
    .filter(([, score]) => score !== null);
  if (phaseScores.length) {
    addInsight(
      `Estimated accuracy by phase: ${phaseScores.map(([name, score]) => `${name} ${score.toFixed(0)}%`).join(' · ')}.`
    );
  }

  if (positionInsights.childElementCount === 1) {
    addInsight('No immediate fork or undefended target was detected. Always verify tactics with the engine.');
  }
  renderBoardArrows();
}

function countFenPieces(fen) {
  return (fen.split(' ')[0].match(/[prnbqk]/gi) ?? []).length;
}

async function updateTablebase() {
  const fen = game.fen();
  if (fen === tablebaseFen) return;
  tablebaseFen = fen;
  tablebaseController?.abort();
  tablebaseController = null;
  tablebaseMoves.replaceChildren();
  const pieceCount = countFenPieces(fen);
  if (pieceCount > 7) {
    tablebaseStatus.textContent = `This position has ${pieceCount} pieces; Syzygy covers positions with up to 7.`;
    return;
  }
  if (setupMode) {
    tablebaseStatus.textContent = 'Finish custom position setup to query the tablebase.';
    return;
  }

  tablebaseController = new AbortController();
  tablebaseStatus.textContent = 'Querying the public Syzygy tablebase…';
  const query = new URLSearchParams({ fen });
  try {
    const response = await fetch(`https://tablebase.lichess.ovh/standard?${query}`, {
      headers: { Accept: 'application/json' },
      signal: tablebaseController.signal
    });
    if (!response.ok) throw new Error(`Tablebase returned HTTP ${response.status}`);
    const result = await response.json();
    if (fen !== game.fen()) return;

    const category = String(result.category ?? 'unknown').replaceAll('-', ' ');
    const dtz = Number.isFinite(result.dtz) ? ` · DTZ ${result.dtz}` : '';
    tablebaseStatus.textContent = `${category[0].toUpperCase()}${category.slice(1)} for the side to move${dtz}.`;
    for (const [index, move] of (result.moves ?? []).slice(0, 5).entries()) {
      const row = document.createElement('li');
      row.classList.add('candidate-line');
      const san = document.createElement('strong');
      san.classList.add('candidate-score');
      san.textContent = move.san ?? move.uci;
      const details = document.createElement('span');
      details.classList.add('candidate-pv');
      details.textContent = `${String(move.category ?? 'unknown').replaceAll('-', ' ')}${Number.isFinite(move.dtz) ? ` · DTZ ${move.dtz}` : ''}`;
      row.append(san, details);
      if (index === 0 && move.uci) {
        const play = document.createElement('button');
        play.type = 'button';
        play.classList.add('line-play-button', 'tablebase-play-button');
        play.dataset.uci = move.uci;
        play.dataset.fen = fen;
        play.textContent = 'Play best move';
        row.appendChild(play);
      }
      tablebaseMoves.appendChild(row);
    }
    if (!result.moves?.length) tablebaseStatus.textContent = 'No tablebase moves are available for this position.';
  } catch (error) {
    if (error.name === 'AbortError') return;
    if (fen !== game.fen()) return;
    tablebaseStatus.textContent = `Tablebase unavailable: ${error.message}`;
    console.error('Could not load Syzygy tablebase data.', error);
  }
}

function beginPositionSetup() {
  setupPosition = game.board().map((rank) => rank.map((piece) => piece ? { ...piece } : null));
  const fenFields = game.fen().split(' ');
  setupTurn.value = fenFields[1];
  for (const right of ['K', 'Q', 'k', 'q']) {
    document.getElementById(`setup-castle-${right}`).checked = fenFields[2].includes(right);
  }
  setupEnPassant.value = fenFields[3] === '-' ? '' : fenFields[3];
  setupMode = true;
  practiceTargetNode = null;
  pendingArrowFrom = null;
  practiceStatus.textContent = 'Practice cancelled.';
  annotationTool = null;
  selectedSquare = null;
  legalMoves = [];
  document.getElementById('setup-apply-button').disabled = false;
  document.getElementById('setup-cancel-button').hidden = false;
  renderBoard();
}

function clearSetupPosition() {
  if (!setupMode) beginPositionSetup();
  setupPosition = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const right of ['K', 'Q', 'k', 'q']) {
    document.getElementById(`setup-castle-${right}`).checked = false;
  }
  setupEnPassant.value = '';
  renderBoard();
}

function finishPositionSetup() {
  if (!setupPosition) return;
  const ranks = setupPosition.map((rank) => {
    let empty = 0;
    let notation = '';
    for (const piece of rank) {
      if (!piece) {
        empty += 1;
      } else {
        if (empty) notation += String(empty);
        empty = 0;
        notation += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
      }
    }
    if (empty) notation += String(empty);
    return notation;
  });
  const castling = ['K', 'Q', 'k', 'q']
    .filter((right) => document.getElementById(`setup-castle-${right}`).checked)
    .join('') || '-';
  const enPassant = setupEnPassant.value.trim() || '-';
  const fen = `${ranks.join('/')} ${setupTurn.value} ${castling} ${enPassant} 0 1`;
  try {
    replaceGame(new Chess(fen), 'Custom position loaded.');
    fenInput.value = fen;
    document.getElementById('setup-apply-button').disabled = true;
    document.getElementById('setup-cancel-button').hidden = true;
    setupStatus.textContent = 'Custom position loaded with the selected turn and position rights.';
  } catch (error) {
    setupStatus.textContent = `Position is not valid: ${error.message}`;
  }
}

function getEvaluationCentipawns(scoreType, score) {
  return scoreType === 'mate'
    ? Math.sign(score) * (30000 - Math.min(Math.abs(score), 1000))
    : score;
}

function classifyMove(annotation, beforeScore, afterScore) {
  if (annotation.checkmate) {
    return { category: 'Best', symbol: '✓', label: 'Best — checkmate' };
  }

  const centipawnLoss = beforeScore + afterScore;
  if (annotation.sacrifice && centipawnLoss <= 30) {
    return {
      category: 'Brilliant',
      symbol: '!!',
      label: 'Brilliant — sound sacrifice by engine estimate'
    };
  }
  if (beforeScore >= 300 && centipawnLoss >= 150) {
    return { category: 'Miss', symbol: '??', label: 'Miss — a winning chance was lost' };
  }
  if (centipawnLoss <= 10) return { category: 'Best', symbol: '✓', label: 'Best move' };
  if (centipawnLoss <= 30) return { category: 'Great', symbol: '!', label: 'Great move' };
  if (centipawnLoss <= 60) return { category: 'Good', symbol: '=', label: 'Good move' };
  if (centipawnLoss <= 100) return { category: 'Inaccuracy', symbol: '?!', label: 'Inaccuracy' };
  if (centipawnLoss <= 200) return { category: 'Mistake', symbol: '?', label: 'Mistake' };
  return { category: 'Blunder', symbol: '??', label: 'Blunder' };
}

function isSoundSacrificeCandidate(move, afterFen) {
  const position = new Chess(afterFen);
  const movedPiece = position.get(move.to);
  return Boolean(
    movedPiece
    && pieceValues[movedPiece.type] > pieceValues.p
    && position.moves({ verbose: true }).some((reply) =>
      reply.to === move.to && reply.captured
    )
  );
}

function createMoveAnnotation(move) {
  return {
    beforeFen: move.before,
    afterFen: move.after,
    from: move.from,
    to: move.to,
    sacrifice: isSoundSacrificeCandidate(move, move.after),
    checkmate: new Chess(move.after).isCheckmate(),
    category: '',
    symbol: '',
    label: ''
  };
}

function recordMove(move, beforeFen) {
  let node = currentNode.children.find((child) =>
    child.from === move.from
    && child.to === move.to
    && child.promotion === move.promotion
  );

  if (!node) {
    node = {
      id: nextNodeId++,
      parent: currentNode,
      children: [],
      preferredChild: null,
      fen: game.fen(),
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      color: move.color,
      moveNumber: Number(beforeFen.split(' ')[5]),
      comment: '',
      highlights: [],
      arrows: [],
      annotation: createMoveAnnotation({
        ...move,
        before: beforeFen,
        after: game.fen()
      })
    };
    currentNode.children.push(node);
  }

  currentNode.preferredChild = node;
  currentNode = node;
  pendingArrowFrom = null;
}

function playMove(move) {
  const beforeFen = game.fen();
  const playedMove = game.move(move);
  if (openingTrainerSession) {
    const target = openingTrainerSession.moves[openingTrainerSession.index];
    const attemptedMove = `${playedMove.from}${playedMove.to}${playedMove.promotion ?? ''}`;
    if (!target || target.uci !== attemptedMove) {
      game.undo();
      openingTrainerStatus.textContent = openingHintVisible
        ? `Not quite. The next move is ${target?.san ?? 'not available'}; try it on the board.`
        : 'Not quite. Try another move, or reveal a hint.';
      selectedSquare = null;
      legalMoves = [];
      renderBoard();
      return false;
    }
    openingTrainerSession.index++;
  }
  if (practiceTargetNode) {
    const expectedMove = bestMoves.get(beforeFen);
    const attemptedMove = `${playedMove.from}${playedMove.to}${playedMove.promotion ?? ''}`;
    if (expectedMove !== attemptedMove) {
      game.undo();
      practiceStatus.textContent = 'Not the engine’s top move. Try another move from the same position.';
      void recordMistakePracticeAttempt(false);
      selectedSquare = null;
      legalMoves = [];
      renderBoard();
      return false;
    }

    practiceStatus.textContent = `Correct — ${playedMove.san} matches Stockfish’s top move.`;
    practiceTargetNode = null;
    void recordMistakePracticeAttempt(true);
  }
  recordMove(playedMove, beforeFen);
  fenInput.value = game.fen();
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
  renderGameReview();
  if (openingTrainerSession) {
    const session = openingTrainerSession;
    const completed = session.index >= session.moves.length;
    openingTrainerStatus.textContent = completed
      ? `Repertoire complete — you recalled ${session.opening}.`
      : `Correct: ${playedMove.san}. Find move ${session.index + 1} of ${session.moves.length}.`;
    void updateOpeningPracticeProgress(session.gameId, { correctMove: true, completed });
    if (completed) {
      openingTrainerSession = null;
      openingTrainerHintButton.disabled = true;
      openingTrainerHintButton.textContent = 'Show hint';
    }
  }
  return true;
}

function navigateByKeyboard(direction) {
  if (setupMode || practiceTargetNode) return;
  if (direction === 'ArrowLeft' && currentNode.parent) {
    navigateToNode(currentNode.parent);
  } else if (direction === 'ArrowRight') {
    const nextNode = currentNode.preferredChild ?? currentNode.children[0];
    if (nextNode) navigateToNode(nextNode);
  } else if (direction === 'ArrowUp') {
    navigateToNode(rootNode);
  } else if (direction === 'ArrowDown') {
    let node = currentNode;
    while (node.preferredChild ?? node.children[0]) {
      node = node.preferredChild ?? node.children[0];
    }
    if (node !== currentNode) navigateToNode(node);
  }
}

function navigateToNode(node) {
  if (practiceTargetNode && node !== practiceTargetNode.parent) {
    practiceTargetNode = null;
    practiceSessionContext = null;
    practiceStatus.textContent = 'Practice cancelled.';
  }
  const path = getNodePath(node);
  const nextGame = new Chess(rootNode.fen);
  for (const move of path) {
    nextGame.move({
      from: move.from,
      to: move.to,
      ...(move.promotion ? { promotion: move.promotion } : {})
    });
  }
  game = nextGame;
  currentNode = node;
  fenInput.value = game.fen();
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
  renderGameReview();
}

function updateMoveAnnotations() {
  let changed = false;

  function visit(parent) {
    for (const child of parent.children) {
      const annotation = child.annotation;
      const beforeScore = evaluations.get(annotation.beforeFen);
      const afterScore = evaluations.get(annotation.afterFen);
      const bestMove = bestMoves.get(annotation.beforeFen);
      if (beforeScore !== undefined && afterScore !== undefined && bestMove) {
        const classification = classifyMove(annotation, beforeScore, afterScore);
        const symbol = classification?.symbol ?? '';
        const label = classification?.label ?? '';
        const category = classification?.category ?? '';
        if (
          annotation.symbol !== symbol
          || annotation.label !== label
          || annotation.category !== category
        ) {
          annotation.symbol = symbol;
          annotation.label = label;
          annotation.category = category;
          changed = true;
        }
      }
      visit(child);
    }
  }

  visit(rootNode);
  if (changed) {
    updateMoveHistory();
    renderVariationsTree();
  }
  renderGameReview();
}

function clearMoveRatings(node) {
  for (const child of node.children) {
    child.annotation.category = '';
    child.annotation.symbol = '';
    child.annotation.label = '';
    clearMoveRatings(child);
  }
}

function getBestMoveSan(fen, uci) {
  const match = uci?.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return '';
  const position = new Chess(fen);
  const move = position.move({
    from: match[1],
    to: match[2],
    ...(match[3] ? { promotion: match[3] } : {})
  });
  return move?.san ?? '';
}

function getReviewMoves() {
  const moves = [];
  function collect(parent) {
    for (const node of parent.children) {
      const beforeScore = evaluations.get(node.annotation.beforeFen);
      const afterScore = evaluations.get(node.annotation.afterFen);
      const bestMove = bestMoves.get(node.annotation.beforeFen);
      if (beforeScore !== undefined && afterScore !== undefined && bestMove) {
        const classification = classifyMove(node.annotation, beforeScore, afterScore);
        const bestSan = getBestMoveSan(node.annotation.beforeFen, bestMove);
        moves.push({
          node,
          classification,
          loss: Math.max(0, beforeScore + afterScore),
          beforeScore,
          afterScore,
          bestMove,
          bestSan,
          missedMateInOne: !node.annotation.checkmate && bestSan.endsWith('#')
        });
      }
      collect(node);
    }
  }
  collect(rootNode);
  return moves;
}

function estimateAccuracy(losses) {
  if (!losses.length) return null;
  const averageLoss = losses.reduce((total, loss) => total + Math.min(loss, 1000), 0) / losses.length;
  return Math.max(0, Math.min(100, 100 * Math.exp(-averageLoss / 400)));
}

function renderGameReview() {
  const reviewedMoves = getReviewMoves();
  renderReviewReport(reviewedMoves);
  const moves = { w: [], b: [] };
  for (const review of reviewedMoves) moves[review.node.color].push(review.loss);
  const whiteAccuracy = estimateAccuracy(moves.w);
  const blackAccuracy = estimateAccuracy(moves.b);
  reviewSummary.replaceChildren();

  if (!reviewedMoves.length) {
    reviewStatus.textContent = 'Analyze game positions to estimate move quality and accuracy.';
    reviewMoments.replaceChildren();
    return;
  }

  const pending = [];
  function collectPending(node) {
    for (const child of node.children) {
      if (
        !evaluations.has(child.annotation.beforeFen)
        || !evaluations.has(child.annotation.afterFen)
        || !bestMoves.has(child.annotation.beforeFen)
      ) pending.push(child);
      collectPending(child);
    }
  }
  collectPending(rootNode);

  const metrics = [
    ['White accuracy', whiteAccuracy, moves.w.length],
    ['Black accuracy', blackAccuracy, moves.b.length]
  ];
  for (const [label, accuracy, count] of metrics) {
    const metric = document.createElement('div');
    metric.classList.add('review-metric');
    const name = document.createElement('span');
    name.textContent = label;
    const value = document.createElement('strong');
    value.textContent = accuracy === null ? '—' : `${accuracy.toFixed(1)}%`;
    const detail = document.createElement('small');
    detail.textContent = `${count} move${count === 1 ? '' : 's'} reviewed`;
    metric.append(name, value, detail);
    reviewSummary.appendChild(metric);
  }

  reviewStatus.textContent = pending.length
    ? `${reviewedMoves.length} moves reviewed · ${pending.length} position${pending.length === 1 ? '' : 's'} still need analysis.`
    : `${reviewedMoves.length} moves reviewed at Stockfish depth ${engineDepth}.`;

  const criticalMoments = reviewedMoves
    .filter(({ classification, missedMateInOne }) =>
      missedMateInOne || ['Miss', 'Blunder', 'Mistake', 'Inaccuracy'].includes(classification?.category)
    )
    .sort((a, b) => Number(b.missedMateInOne) - Number(a.missedMateInOne) || b.loss - a.loss)
    .slice(0, 8);
  reviewMoments.replaceChildren();

  for (const { node, classification, loss, beforeScore, afterScore, bestMove, bestSan, missedMateInOne } of criticalMoments) {
    const item = document.createElement('li');
    item.classList.add('review-moment');
    const title = document.createElement('strong');
    title.textContent = `${node.moveNumber}${node.color === 'b' ? '…' : '.'} ${node.san} · ${missedMateInOne ? 'Missed mate in one' : classification.category}`;
    const coachLabel = document.createElement('span');
    coachLabel.classList.add('coach-label');
    coachLabel.textContent = 'Coach insight';
    const explanation = document.createElement('p');
    const bestReplyCapture = getBestReplyCapture(
      node.annotation.afterFen,
      bestMoves.get(node.annotation.afterFen),
      node.color
    );
    const bestFork = getForkThreatAfterMove(node.annotation.beforeFen, bestMove);
    explanation.textContent = explainCriticalMove(
      missedMateInOne ? 'Miss' : classification.category,
      node.color,
      bestSan,
      loss,
      beforeScore,
      afterScore,
      bestReplyCapture,
      bestFork
    );
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.classList.add('secondary-button', 'practice-move-button');
    retry.dataset.nodeId = String(node.id);
    retry.disabled = !bestSan;
    retry.textContent = 'Retry this position';
    item.append(title, coachLabel, explanation, retry);
    reviewMoments.appendChild(item);
  }

  if (!criticalMoments.length) {
    const note = document.createElement('p');
    note.classList.add('tool-description');
    note.textContent = pending.length
      ? 'Critical moments will appear as analysis completes.'
      : 'No major inaccuracies were found in the analyzed lines.';
    reviewMoments.appendChild(note);
  }
}

function renderReviewReport(reviewedMoves) {
  reviewReport.replaceChildren();
  if (!reviewedMoves.length) return;

  const reportTitle = document.createElement('h3');
  reportTitle.textContent = 'Game report';
  const whiteAccuracy = estimateAccuracy(reviewedMoves.filter(({ node }) => node.color === 'w').map(({ loss }) => loss));
  const blackAccuracy = estimateAccuracy(reviewedMoves.filter(({ node }) => node.color === 'b').map(({ loss }) => loss));
  const accuracySummary = document.createElement('p');
  accuracySummary.classList.add('report-caption');
  accuracySummary.textContent = `Estimated accuracy · White ${whiteAccuracy === null ? '—' : `${whiteAccuracy.toFixed(1)}%`} · Black ${blackAccuracy === null ? '—' : `${blackAccuracy.toFixed(1)}%`}`;
  const chartLabel = document.createElement('p');
  chartLabel.classList.add('report-caption');
  chartLabel.textContent = 'Evaluation by move · White’s perspective';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('evaluation-chart');
  svg.setAttribute('viewBox', '0 0 680 190');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Evaluation graph across the selected game line');

  const plot = getDisplayedPath(currentNode)
    .map((node) => {
      const score = evaluations.get(node.annotation.afterFen);
      if (score === undefined) return null;
      return {
        node,
        score: node.annotation.afterFen.split(' ')[1] === 'w' ? score : -score
      };
    })
    .filter(Boolean);
  const rootScore = evaluations.get(rootNode.fen);
  if (rootScore !== undefined) {
    plot.unshift({
      node: null,
      score: rootNode.fen.split(' ')[1] === 'w' ? rootScore : -rootScore
    });
  }

  if (plot.length) {
    const width = 680;
    const height = 190;
    const left = 38;
    const right = 12;
    const top = 14;
    const bottom = 22;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const zeroY = top + innerHeight / 2;
    const zeroLine = document.createElementNS(svg.namespaceURI, 'line');
    zeroLine.setAttribute('x1', String(left));
    zeroLine.setAttribute('x2', String(width - right));
    zeroLine.setAttribute('y1', String(zeroY));
    zeroLine.setAttribute('y2', String(zeroY));
    zeroLine.classList.add('evaluation-zero-line');
    svg.appendChild(zeroLine);
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('x', '2');
    label.setAttribute('y', String(zeroY + 4));
    label.classList.add('evaluation-axis-label');
    label.textContent = '0.0';
    svg.appendChild(label);

    const points = plot.map((point, index) => {
      const x = plot.length === 1 ? left + innerWidth / 2 : left + index / (plot.length - 1) * innerWidth;
      const boundedScore = Math.max(-600, Math.min(600, point.score));
      const y = top + (600 - boundedScore) / 1200 * innerHeight;
      return { ...point, x, y };
    });
    const line = document.createElementNS(svg.namespaceURI, 'polyline');
    line.setAttribute('points', points.map(({ x, y }) => `${x},${y}`).join(' '));
    line.classList.add('evaluation-graph-line');
    svg.appendChild(line);

    for (const point of points) {
      const circle = document.createElementNS(svg.namespaceURI, 'circle');
      circle.setAttribute('cx', String(point.x));
      circle.setAttribute('cy', String(point.y));
      circle.setAttribute('r', '3');
      circle.classList.add('evaluation-graph-point');
      const title = document.createElementNS(svg.namespaceURI, 'title');
      const moveName = point.node ? `${point.node.moveNumber}${point.node.color === 'b' ? '…' : '.'} ${point.node.san}` : 'Start';
      title.textContent = `${moveName}: ${point.score > 0 ? '+' : ''}${(point.score / 100).toFixed(1)}`;
      circle.appendChild(title);
      svg.appendChild(circle);
    }
  } else {
    const empty = document.createElement('p');
    empty.classList.add('tool-description');
    empty.textContent = 'Evaluation graph will appear as positions finish analyzing.';
    reviewReport.append(reportTitle, accuracySummary, chartLabel, empty);
  }

  const stats = document.createElement('div');
  stats.classList.add('move-type-counts');
  const counts = ['Brilliant', 'Great', 'Best', 'Good', 'Inaccuracy', 'Mistake', 'Blunder', 'Miss'];
  for (const category of counts) {
    const white = reviewedMoves.filter(({ node, classification }) => node.color === 'w' && classification.category === category).length;
    const black = reviewedMoves.filter(({ node, classification }) => node.color === 'b' && classification.category === category).length;
    const item = document.createElement('span');
    item.classList.add(`quality-${category.toLowerCase()}`);
    item.title = `${category}: White ${white}, Black ${black}`;
    item.textContent = `${classificationSymbol(category)} ${category}: ${white + black} (W ${white} · B ${black})`;
    stats.appendChild(item);
  }
  if (plot.length) reviewReport.append(reportTitle, accuracySummary, chartLabel, svg, stats);
  else reviewReport.append(stats);
}

function classificationSymbol(category) {
  return {
    Brilliant: '!!',
    Great: '!',
    Best: '✓',
    Good: '=',
    Inaccuracy: '?!',
    Mistake: '?',
    Blunder: '??',
    Miss: '??'
  }[category] ?? '·';
}

function getForkThreatAfterMove(fen, uci) {
  const match = uci?.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return null;
  const position = new Chess(fen);
  const mover = position.turn();
  const move = position.move({
    from: match[1],
    to: match[2],
    ...(match[3] ? { promotion: match[3] } : {})
  });
  if (!move) return null;

  const targets = [];
  for (const [rankIndex, rank] of position.board().entries()) {
    for (const [fileIndex, piece] of rank.entries()) {
      if (!piece || piece.color === mover || piece.type === 'k' || pieceValues[piece.type] < 3) continue;
      const square = `${files[fileIndex]}${8 - rankIndex}`;
      if (square !== move.to && position.isAttacked(square, mover)) {
        targets.push(`${pieceNames[piece.type]} on ${square}`);
      }
    }
  }
  return targets.length >= 2 ? targets : null;
}

function getBestReplyCapture(fen, bestMove, capturedColor) {
  const match = bestMove?.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return null;

  const position = new Chess(fen);
  const move = position.move({
    from: match[1],
    to: match[2],
    ...(match[3] ? { promotion: match[3] } : {})
  });
  if (!move.captured) return null;

  const capturedSquare = move.flags.includes('e') ? `${move.to[0]}${move.from[1]}` : move.to;
  const capturedPiece = new Chess(fen).get(capturedSquare);
  if (!capturedPiece || capturedPiece.color !== capturedColor) return null;

  return {
    piece: pieceNames[capturedPiece.type],
    square: capturedSquare,
    san: move.san
  };
}

function explainCriticalMove(category, color, bestSan, loss, beforeScore, afterScore, bestReplyCapture, bestFork) {
  const mover = color === 'w' ? 'White' : 'Black';
  const opponent = color === 'w' ? 'Black' : 'White';
  const afterForMover = -afterScore;
  const best = bestSan && !bestSan.endsWith('#') ? `Stockfish preferred ${bestSan}. ` : '';
  let impact;

  if (bestSan.endsWith('#')) {
    impact = `Missed mate in one: ${bestSan} would have checkmated immediately.`;
  } else if (bestReplyCapture) {
    impact = `Your move leaves your ${bestReplyCapture.piece} on ${bestReplyCapture.square} capturable; Stockfish's top reply is ${bestReplyCapture.san}.`;
  } else if (bestFork) {
    impact = `The stronger move ${bestSan} creates a fork, attacking ${bestFork.join(' and ')} at once.`;
  } else if (beforeScore >= 25000 && afterScore < 25000) {
    impact = 'There was a forced mate, but this move let the winning chance slip away.';
  } else if (afterScore >= 25000) {
    impact = `This lets ${opponent} force checkmate.`;
  } else if (beforeScore > 150 && afterForMover < -150) {
    impact = `The evaluation swung from a promising position for ${mover} to an advantage for ${opponent}.`;
  } else if (beforeScore < -150 && afterForMover > 150) {
    impact = `The move missed a chance to improve a difficult position for ${mover}.`;
  } else if (category === 'Inaccuracy') {
    impact = 'The position is still playable, but the move gives up some of its advantage.';
  } else if (category === 'Miss') {
    impact = 'A stronger tactical or positional opportunity was available.';
  } else if (category === 'Mistake') {
    impact = `This makes ${mover}'s position noticeably harder to play.`;
  } else {
    impact = `This gives ${opponent} a much stronger position.`;
  }

  const size = Math.abs(beforeScore) >= 25000 || Math.abs(afterScore) >= 25000
    ? ''
    : ` Estimated evaluation loss: ${(loss / 100).toFixed(1)} pawns.`;
  return `${category}: ${best}${impact}${size} Before committing, check your opponent’s threats and look for forcing checks, captures, and attacks.`;
}

function formatEngineScore(scoreType, score, fen) {
  const whiteScore = fen.split(' ')[1] === 'w' ? score : -score;
  return scoreType === 'mate'
    ? `${whiteScore < 0 ? '-M' : 'M'}${Math.abs(whiteScore)}`
    : `${whiteScore > 0 ? '+' : ''}${(whiteScore / 100).toFixed(1)}`;
}

function formatPrincipalVariation(fen, uciMoves) {
  const variation = new Chess(fen);
  const notation = [];
  let moveNumber = Number(fen.split(' ')[5]);
  let sideToMove = fen.split(' ')[1];
  let firstMove = null;

  for (const uci of uciMoves) {
    const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
    if (!match) break;

    try {
      const move = variation.move({
        from: match[1],
        to: match[2],
        ...(match[3] ? { promotion: match[3] } : {})
      });
      if (!firstMove) firstMove = move;
      if (sideToMove === 'w') {
        notation.push(`${moveNumber}. ${move.san}`);
      } else if (notation.length === 0) {
        notation.push(`${moveNumber}... ${move.san}`);
      } else {
        notation[notation.length - 1] += ` ${move.san}`;
      }
      if (sideToMove === 'b') moveNumber += 1;
      sideToMove = sideToMove === 'w' ? 'b' : 'w';
    } catch {
      break;
    }
  }

  return { san: notation.join(' '), firstMove };
}

function renderCandidateLines() {
  candidateLinesElement.replaceChildren();
  const lines = [...currentLines.entries()].sort(([a], [b]) => a - b);

  for (const [rank, line] of lines) {
    const row = document.createElement('li');
    row.classList.add('candidate-line');

    const score = document.createElement('span');
    score.classList.add('candidate-score');
    score.textContent = line.score;

    const pv = document.createElement('span');
    pv.classList.add('candidate-pv');
    pv.textContent = line.san || 'No continuation available';

    const playButton = document.createElement('button');
    playButton.classList.add('line-play-button');
    playButton.type = 'button';
    playButton.textContent = 'Play first move';
    playButton.disabled = !line.firstMove;
    playButton.dataset.from = line.firstMove?.from ?? '';
    playButton.dataset.to = line.firstMove?.to ?? '';
    playButton.dataset.promotion = line.firstMove?.promotion ?? '';
    playButton.dataset.fen = game.fen();
    playButton.setAttribute('aria-label', `Play candidate line ${rank}'s first move`);

    row.append(score, pv, playButton);
    candidateLinesElement.appendChild(row);
  }

  if (lines.length === 0) {
    linesStatus.textContent = engineFailed
      ? 'Stockfish is unavailable. Check the engine files and reload.'
      : 'Analyzing the current position…';
  } else {
    linesStatus.textContent = `Showing ${lines.length} candidate line${lines.length === 1 ? '' : 's'} · depth ${lines[0][1].depth}`;
  }
}

function getLineCacheKey(fen) {
  return `${multiPv}:${engineDepth}:${fen}`;
}

function updateEvaluation(line) {
  if (activeDepth !== engineDepth) return;
  const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)\b/);
  if (!scoreMatch || !activeFen) return;

  const scoreType = scoreMatch[1];
  const score = Number(scoreMatch[2]);
  const scoreInCentipawns = getEvaluationCentipawns(scoreType, score);
  const multipvMatch = line.match(/\bmultipv (\d+)\b/);
  const rank = multipvMatch ? Number(multipvMatch[1]) : 1;
  const depthMatch = line.match(/\bdepth (\d+)\b/);
  const pvMatch = line.match(/\bpv (.+)$/);
  const pv = formatPrincipalVariation(activeFen, pvMatch?.[1].trim().split(/\s+/) ?? []);
  const fenLines = linesByFen.get(activeFen) ?? new Map();
  fenLines.set(rank, {
    score: formatEngineScore(scoreType, score, activeFen),
    san: pv.san,
    firstMove: pv.firstMove,
    depth: depthMatch ? Number(depthMatch[1]) : 0
  });
  linesByFen.set(activeFen, fenLines);
  candidateLineCache.set(getLineCacheKey(activeFen), new Map(fenLines));

  if (rank === 1) {
    evaluations.set(activeFen, scoreInCentipawns);
    updateMoveAnnotations();
  }

  if (activeFen !== game.fen()) return;

  currentLines = new Map(fenLines);
  renderCandidateLines();

  const sideToMove = activeFen.split(' ')[1];
  const whiteScore = sideToMove === 'w' ? score : -score;
  const isMate = scoreType === 'mate';
  const clampedScore = Math.max(-1000, Math.min(1000, whiteScore));
  const whiteAdvantage = isMate
    ? (whiteScore > 0 ? 100 : 0)
    : 100 / (1 + 10 ** (-clampedScore / 400));

  evaluationValue.textContent = isMate
    ? `${whiteScore < 0 ? '-' : ''}M${Math.abs(whiteScore)}`
    : `${whiteScore > 0 ? '+' : ''}${(whiteScore / 100).toFixed(1)}`;
  updateEvaluationBar(whiteAdvantage);
  evaluationMeter.setAttribute('aria-valuenow', String(clampedScore));
  evaluationMeter.setAttribute(
    'aria-valuetext',
    isMate
      ? `${whiteScore > 0 ? 'White' : 'Black'} can force checkmate in ${Math.abs(whiteScore)} moves`
      : `${evaluationValue.textContent} pawns from White's perspective`
  );

  engineStatus.textContent = depthMatch
    ? `Depth ${depthMatch[1]} · Stockfish 19 Lite`
    : 'Stockfish 19 Lite';
}

function startPendingAnalysis() {
  if (!engineReady || activeFen || !pendingFens.length || engineFailed) return;

  activeFen = pendingFens.shift();
  activeDepth = engineDepth;
  linesByFen.set(activeFen, new Map());
  if (activeFen === game.fen()) {
    currentLines.clear();
    renderCandidateLines();
  }
  stopRequested = false;
  stockfishWorker.postMessage(`position fen ${activeFen}`);
  stockfishWorker.postMessage(`go depth ${engineDepth}`);
}

function configureEngine() {
  if (!stockfishWorker || engineFailed) return;
  engineReady = false;
  configuredMultiPv = multiPv;
  stockfishWorker.postMessage(`setoption name MultiPV value ${multiPv}`);
  stockfishWorker.postMessage('isready');
}

function requestAnalysis() {
  if (engineFailed) return;

  if (game.isGameOver()) {
    pendingFens.length = 0;
    currentLines.clear();
    renderCandidateLines();
    linesStatus.textContent = game.isCheckmate()
      ? 'This position is checkmate; there are no candidate moves.'
      : 'This position is drawn; there are no candidate moves.';
    if (activeFen && !stopRequested) {
      stopRequested = true;
      stockfishWorker.postMessage('stop');
    }

    if (game.isCheckmate()) {
      const whiteWon = game.turn() === 'b';
      evaluations.set(game.fen(), -30000);
      bestMoves.set(game.fen(), '0000');
      evaluationValue.textContent = whiteWon ? 'M0' : '-M0';
      updateEvaluationBar(whiteWon ? 100 : 0);
      evaluationMeter.setAttribute('aria-valuenow', whiteWon ? '1000' : '-1000');
      evaluationMeter.setAttribute(
        'aria-valuetext',
        `${whiteWon ? 'White' : 'Black'} won by checkmate`
      );
      engineStatus.textContent = 'Checkmate · Stockfish 19 Lite';
    } else {
      evaluations.set(game.fen(), 0);
      bestMoves.set(game.fen(), '0000');
      evaluationValue.textContent = '0.0';
      updateEvaluationBar(50);
      evaluationMeter.setAttribute('aria-valuenow', '0');
      evaluationMeter.setAttribute('aria-valuetext', 'Draw');
      engineStatus.textContent = 'Draw · Stockfish 19 Lite';
    }
    updateMoveAnnotations();
    return;
  }

  const fen = game.fen();
  if (fen === activeFen || pendingFens.includes(fen)) return;

  const cachedLines = candidateLineCache.get(getLineCacheKey(fen));
  if (cachedLines && !activeFen) {
    currentLines = new Map(cachedLines);
    renderCandidateLines();
    if (evaluations.has(fen) && bestMoves.has(fen)) return;
  } else {
    currentLines.clear();
    renderCandidateLines();
  }

  pendingFens.push(fen);
  if (!currentLines.size) linesStatus.textContent = 'Analyzing the current position…';
  if (!engineReady) return;

  if (activeFen) {
    if (!stopRequested) {
      stopRequested = true;
      stockfishWorker.postMessage('stop');
    }
    return;
  }

  startPendingAnalysis();
}

function handleEngineMessage(line) {
  if (line === 'uciok') {
    configureEngine();
    return;
  }

  if (line === 'readyok') {
    if (configuredMultiPv !== multiPv) {
      configureEngine();
      return;
    }
    engineReady = true;
    engineStatus.textContent = 'Analyzing…';
    startPendingAnalysis();
    return;
  }

  if (line.startsWith('info ')) {
    updateEvaluation(line);
    return;
  }

  if (line.startsWith('bestmove ')) {
    const bestMove = line.match(/^bestmove\s+(\S+)/)?.[1];
    const completedFen = activeFen;
    const completedDepth = activeDepth;
    if (bestMove && completedFen && completedDepth === engineDepth) {
      bestMoves.set(completedFen, bestMove);
    }
    if (completedFen && completedDepth === engineDepth && currentLines.size) {
      candidateLineCache.set(getLineCacheKey(completedFen), new Map(currentLines));
    }
    activeFen = null;
    stopRequested = false;
    updateMoveAnnotations();
    renderPositionInsights();
    if (reconfigureAfterStop || configuredMultiPv !== multiPv) {
      reconfigureAfterStop = false;
      configureEngine();
    } else {
      startPendingAnalysis();
    }
  }
}

function startEngine() {
  try {
    stockfishWorker = new Worker(
      new URL('stockfish/stockfish-19-lite-single.js', document.baseURI)
    );
  } catch (error) {
    engineFailed = true;
    engineStatus.textContent = 'Engine unavailable';
    console.error('Could not start the Stockfish worker.', error);
    return;
  }

  stockfishWorker.addEventListener('message', (event) => {
    handleEngineMessage(String(event.data));
  });
  stockfishWorker.addEventListener('error', (event) => {
    engineFailed = true;
    engineReady = false;
    engineStatus.textContent = 'Engine failed to load';
    evaluationValue.textContent = '—';
    linesStatus.textContent = 'Stockfish failed to load. Check the engine files and reload.';
    console.error('Stockfish worker error:', event.message);
  });
  stockfishWorker.postMessage('uci');
}

function renderBoard() {
  const position = setupMode ? setupPosition : game.board();
  const squares = board.querySelectorAll('.square');

  squares.forEach((square, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const piece = position[row][col];
    const squareMoves = legalMoves.filter((move) => move.to === square.dataset.square);

    square.replaceChildren();
    square.classList.toggle('selected-square', square.dataset.square === selectedSquare);
    square.classList.toggle('legal-move', squareMoves.length > 0);
    square.classList.toggle(
      'capture-target',
      squareMoves.some((move) => Boolean(move.captured))
    );
    const highlight = (currentNode.highlights ?? []).find((mark) =>
      (typeof mark === 'string' ? mark : mark.square) === square.dataset.square
    );
    square.classList.toggle('analysis-highlight', !setupMode && Boolean(highlight));
    for (const color of ['gold', 'green', 'red']) {
      square.classList.toggle(
        `analysis-highlight-${color}`,
        !setupMode && Boolean(highlight)
        && (typeof highlight === 'string' ? 'gold' : highlight.color) === color
      );
    }
    if (piece) {
      const pieceElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      pieceElement.classList.add(
        'chess-piece',
        piece.color === 'w' ? 'white-piece' : 'black-piece'
      );
      pieceElement.setAttribute('viewBox', '0 0 100 100');
      pieceElement.setAttribute('aria-label', `${piece.color === 'w' ? 'White' : 'Black'} ${pieceNames[piece.type]}`);
      pieceElement.setAttribute('role', 'img');
      pieceElement.setAttribute('focusable', 'false');
      if (square.dataset.square === selectedSquare) {
        pieceElement.classList.add('selected');
      }

      const artwork = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      artwork.setAttribute('href', `#piece-${piece.type}`);
      pieceElement.appendChild(artwork);
      square.appendChild(pieceElement);
    }
  });

  renderBoardArrows();
  if (setupMode) {
    status.textContent = 'Editing custom position';
    setupStatus.textContent = 'Click squares to place or remove the selected piece.';
    return;
  }
  updateStatus();
  updateMoveHistory();
  requestAnalysis();
  updateOpeningExplorer();
  updateTablebase();
  renderPositionInsights();
}

function replaceGame(nextGame, message) {
  game = nextGame;
  currentLibraryGameId = null;
  setupMode = false;
  setupPosition = null;
  reviewRequested = false;
  practiceTargetNode = null;
  pendingArrowFrom = null;
  practiceStatus.textContent = 'Choose a mistake to retry its position.';
  selectedSquare = null;
  legalMoves = [];
  pendingFens.length = 0;
  rootNode = createRootNode(nextGame.history({ verbose: true })[0]?.before ?? nextGame.fen());
  currentNode = rootNode;
  nextNodeId = 1;
  currentLines.clear();
  explorerFen = null;
  tablebaseFen = null;
  fenInput.value = nextGame.fen();
  loadStatus.textContent = message;
  renderBoard();
  renderGameReview();
}

function buildTreeFromGame(nextGame) {
  const history = nextGame.history({ verbose: true });
  rootNode = createRootNode(history[0]?.before ?? nextGame.fen());
  currentNode = rootNode;
  nextNodeId = 1;

  for (const move of history) {
    const node = {
      id: nextNodeId++,
      parent: currentNode,
      children: [],
      preferredChild: null,
      fen: move.after,
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      color: move.color,
      moveNumber: Number(move.before.split(' ')[5]),
      comment: move.comment ?? '',
      highlights: [],
      arrows: [],
      annotation: createMoveAnnotation(move)
    };
    currentNode.children.push(node);
    currentNode.preferredChild = node;
    currentNode = node;
  }
}

function renderExplorer(data, fen) {
  explorerMoves.replaceChildren();
  explorerGames.replaceChildren();
  const totalGames = Number(data.white ?? 0) + Number(data.draws ?? 0) + Number(data.black ?? 0);
  explorerSummary.textContent = totalGames
    ? `${totalGames.toLocaleString()} master games · White ${Math.round(data.white / totalGames * 100)}% · Draw ${Math.round(data.draws / totalGames * 100)}% · Black ${Math.round(data.black / totalGames * 100)}%`
    : 'No master games found for this position.';

  for (const move of data.moves ?? []) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.classList.add('explorer-move');
    button.type = 'button';
    button.dataset.uci = move.uci;
    button.dataset.fen = fen;

    const san = document.createElement('span');
    san.classList.add('explorer-san');
    san.textContent = move.san;

    const moveGames = Number(move.white ?? 0) + Number(move.draws ?? 0) + Number(move.black ?? 0);
    const statistics = document.createElement('span');
    statistics.classList.add('explorer-statistics');
    statistics.textContent = `${Math.round(move.white / Math.max(1, moveGames) * 100)}% W · ${Math.round(move.draws / Math.max(1, moveGames) * 100)}% D · ${Math.round(move.black / Math.max(1, moveGames) * 100)}% B`;

    const percentage = document.createElement('span');
    percentage.classList.add('explorer-percentage');
    percentage.textContent = moveGames.toLocaleString();
    percentage.title = 'Master games in this move sample';

    button.append(san, statistics, percentage);
    row.appendChild(button);
    explorerMoves.appendChild(row);
  }

  for (const game of data.topGames ?? []) {
    const row = document.createElement('li');
    const white = `${game.white?.name ?? 'White'}${game.white?.rating ? ` (${game.white.rating})` : ''}`;
    const black = `${game.black?.name ?? 'Black'}${game.black?.rating ? ` (${game.black.rating})` : ''}`;
    const players = `${white} – ${black} · ${game.year ?? 'Year unknown'}${game.month ? `/${game.month}` : ''}`;
    if (game.id) {
      const link = document.createElement('a');
      link.href = `https://lichess.org/${encodeURIComponent(game.id)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = players;
      row.appendChild(link);
    } else {
      row.textContent = players;
    }
    if (game.winner) row.setAttribute('aria-label', `${players}; ${game.winner} won`);
    explorerGames.appendChild(row);
  }
  if (!explorerGames.childElementCount) {
    const empty = document.createElement('li');
    empty.textContent = 'No sample games returned for this position.';
    explorerGames.appendChild(empty);
  }
}

async function updateOpeningExplorer() {
  const fen = game.fen();
  if (fen === explorerFen) return;

  explorerFen = fen;
  explorerController?.abort();
  explorerMoves.replaceChildren();
  explorerGames.replaceChildren();
  if (!explorerAccessToken) {
    explorerSummary.textContent = 'Lichess now requires a personal token for live Masters data. Add one above; it is kept only until you refresh.';
    const fallback = document.createElement('a');
    fallback.href = `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Open this position on Lichess';
    explorerGames.appendChild(fallback);
    return;
  }

  explorerController = new AbortController();
  explorerSummary.textContent = 'Searching Lichess Masters…';

  const query = new URLSearchParams({ fen, moves: '8', topGames: '5' });
  try {
    const response = await fetch(`https://explorer.lichess.org/masters?${query}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${explorerAccessToken}`
      },
      signal: explorerController.signal
    });
    if (response.status === 401 || response.status === 403) {
      explorerAccessToken = '';
      explorerDisconnectButton.hidden = true;
      throw new Error('Lichess rejected this token. Check it and make sure it grants access to the Masters explorer.');
    }
    if (!response.ok) throw new Error(`Lichess returned HTTP ${response.status}`);

    const data = await response.json();
    if (
      fen === game.fen()
      && Array.isArray(data.moves)
      && Array.isArray(data.topGames)
    ) {
      renderExplorer(data, fen);
    } else if (fen === game.fen()) {
      throw new Error('Lichess returned an unexpected opening-data response.');
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    if (fen !== game.fen()) return;
    explorerGames.replaceChildren();
    explorerSummary.textContent = `Opening data unavailable: ${error.message}`;
    const fallback = document.createElement('a');
    fallback.href = `https://lichess.org/analysis/standard/${encodeURIComponent(fen)}`;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Open this position on Lichess';
    explorerGames.appendChild(fallback);
  }
}

function analyzeGamePositions() {
  reviewRequested = true;
  const positions = [];
  function collectPositions(node) {
    positions.push(node.fen);
    node.children.forEach(collectPositions);
  }
  collectPositions(rootNode);

  pendingFens.length = 0;
  for (const fen of new Set(positions)) {
    if (new Chess(fen).isGameOver()) continue;
    if (
      !evaluations.has(fen)
      || !bestMoves.has(fen)
      || !candidateLineCache.has(getLineCacheKey(fen))
    ) {
      pendingFens.push(fen);
    }
  }

  if (!pendingFens.length) {
    linesStatus.textContent = 'All game positions have already been analyzed.';
    renderGameReview();
    return;
  }

  linesStatus.textContent = `Analyzing ${pendingFens.length} position${pendingFens.length === 1 ? '' : 's'}…`;
  if (activeFen && !stopRequested) {
    stopRequested = true;
    stockfishWorker.postMessage('stop');
  } else {
    startPendingAnalysis();
  }
}

function readStorageArray(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error(`Saved data in ${key} is not a list.`);
  return value;
}

function isMissingGamesColumnError(error) {
  const message = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase();
  return ['42703', 'pgrst204'].includes(String(error?.code ?? '').toLowerCase())
    && message.includes('games');
}

function isMissingStudyGoalsColumnError(error) {
  const message = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase();
  return ['42703', 'pgrst204'].includes(String(error?.code ?? '').toLowerCase())
    && message.includes('study_goals');
}

function getStudyGoalsStorageKey() {
  return currentUser?.id
    ? `chess-analysis-study-goals-${currentUser.id}`
    : 'chess-analysis-study-goals';
}

function readStudyGoals(value) {
  const defaults = { reviews: 3, mistakes: 5, openings: 3 };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  return {
    reviews: Number.isInteger(value.reviews) ? Math.min(50, Math.max(1, value.reviews)) : defaults.reviews,
    mistakes: Number.isInteger(value.mistakes) ? Math.min(100, Math.max(1, value.mistakes)) : defaults.mistakes,
    openings: Number.isInteger(value.openings) ? Math.min(50, Math.max(1, value.openings)) : defaults.openings
  };
}

function setAccountStatus(message, isError = false) {
  accountStatus.textContent = message;
  accountStatus.dataset.error = String(isError);
}

function renderGameLibrarySyncState() {
  const missingFeatures = [
    ...(!cloudGamesColumnAvailable ? ['imported game syncing'] : []),
    ...(!cloudStudyGoalsColumnAvailable ? ['study-goal syncing'] : [])
  ];
  const needsSchemaUpdate = Boolean(currentUser && missingFeatures.length);
  gameLibrarySyncWarning.hidden = !needsSchemaUpdate;
  if (needsSchemaUpdate) {
    gameLibrarySyncWarning.textContent = `Your account is using an older database schema. ${missingFeatures.join(' and ')} will work after you run the latest supabase/schema.sql in your Supabase SQL Editor. Collections and review history continue syncing; unsupported data stays saved in this browser.`;
  }
}

function renderAccountState() {
  const signedIn = Boolean(currentUser);
  accountForm.hidden = signedIn || !supabaseConfigured;
  accountSignedIn.hidden = !signedIn;
  if (!signedIn) accountPasswordForm.hidden = true;
  if (currentUser) {
    accountIdentity.textContent = currentUser.user_metadata?.display_name || currentUser.email;
    accountIdentity.title = currentUser.email ?? '';
  }
}

function renderCollectionList() {
  collectionList.replaceChildren();
  for (const item of collectionItems) {
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') {
      collectionStatus.textContent = 'A saved collection entry is invalid.';
      continue;
    }
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    collectionList.appendChild(option);
  }
  if (currentUser) {
    collectionStatus.textContent = `${collectionList.options.length} cloud collection${collectionList.options.length === 1 ? '' : 's'} saved to your account.`;
  } else {
    collectionStatus.textContent = collectionList.options.length
      ? `${collectionList.options.length} collection${collectionList.options.length === 1 ? '' : 's'} saved in this browser. Sign in to sync across devices.`
      : 'Collections are stored in this browser. Sign in to sync across devices.';
  }
}

function renderInsightHistory() {
  const history = reviewEntries.slice(-5).reverse();
  insightHistory.textContent = history.length
    ? history.map((entry) =>
      `${new Date(entry.savedAt).toLocaleDateString()} · White ${Number(entry.whiteAccuracy).toFixed(1)}% / Black ${Number(entry.blackAccuracy).toFixed(1)}%`
    ).join(' | ')
    : 'Review snapshots will appear here.';
}

async function loadBrowserData() {
  collectionItems = readStorageArray('chess-analysis-collections');
  reviewEntries = readStorageArray('chess-analysis-insight-history');
  gameLibrary = readStorageArray('chess-analysis-games');
  const savedGoals = localStorage.getItem(getStudyGoalsStorageKey());
  studyGoals = readStudyGoals(savedGoals ? JSON.parse(savedGoals) : null);
  renderCollectionList();
  renderInsightHistory();
  renderGameLibrary();
}

async function writeCloudData(userId, collections, history, games = gameLibrary) {
  if (supabase) {
    const row = {
      user_id: userId,
      collections: structuredClone(collections),
      review_history: structuredClone(history),
      ...(cloudGamesColumnAvailable ? { games: structuredClone(games) } : {}),
      ...(cloudStudyGoalsColumnAvailable ? { study_goals: structuredClone(studyGoals) } : {}),
      updated_at: new Date().toISOString()
    };
    const write = cloudWriteQueue.catch(() => {}).then(async () => {
      const payload = { ...row };
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error } = await supabase
          .from('chess_user_data')
          .upsert(payload, { onConflict: 'user_id' });
        if (!error) return;
        if (cloudGamesColumnAvailable && isMissingGamesColumnError(error)) {
          cloudGamesColumnAvailable = false;
          delete payload.games;
          renderGameLibrarySyncState();
          continue;
        }
        if (cloudStudyGoalsColumnAvailable && isMissingStudyGoalsColumnError(error)) {
          cloudStudyGoalsColumnAvailable = false;
          delete payload.study_goals;
          renderGameLibrarySyncState();
          continue;
        }
        throw error;
      }
      throw new Error('Could not sync account data after updating the database compatibility settings.');
    });
    cloudWriteQueue = write;
    await write;
  }
}

async function persistUserData() {
  if (currentUser && supabase) {
    await writeCloudData(currentUser.id, collectionItems, reviewEntries, gameLibrary);
    if (!cloudGamesColumnAvailable) {
      localStorage.setItem('chess-analysis-games', JSON.stringify(gameLibrary));
    }
    if (!cloudStudyGoalsColumnAvailable) {
      localStorage.setItem(getStudyGoalsStorageKey(), JSON.stringify(studyGoals));
    }
  } else {
    localStorage.setItem('chess-analysis-collections', JSON.stringify(collectionItems));
    localStorage.setItem('chess-analysis-insight-history', JSON.stringify(reviewEntries));
    localStorage.setItem('chess-analysis-games', JSON.stringify(gameLibrary));
    localStorage.setItem(getStudyGoalsStorageKey(), JSON.stringify(studyGoals));
  }
}

async function loadCloudData(user) {
  if (!supabase) return;
  let data;
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    const columns = [
      'collections',
      'review_history',
      ...(cloudGamesColumnAvailable ? ['games'] : []),
      ...(cloudStudyGoalsColumnAvailable ? ['study_goals'] : [])
    ];
    ({ data, error } = await supabase
      .from('chess_user_data')
      .select(columns.join(', '))
      .eq('user_id', user.id)
      .maybeSingle());
    if (!error) break;
    if (cloudGamesColumnAvailable && isMissingGamesColumnError(error)) {
      cloudGamesColumnAvailable = false;
      continue;
    }
    if (cloudStudyGoalsColumnAvailable && isMissingStudyGoalsColumnError(error)) {
      cloudStudyGoalsColumnAvailable = false;
      continue;
    }
    break;
  }
  if (error) throw error;
  if (currentUser?.id !== user.id) return;

  const cloudCollections = Array.isArray(data?.collections) ? data.collections : [];
  const cloudHistory = Array.isArray(data?.review_history) ? data.review_history : [];
  const cloudGames = Array.isArray(data?.games) ? data.games : [];
  const defaultGoals = { reviews: 3, mistakes: 5, openings: 3 };
  studyGoals = readStudyGoals(data?.study_goals);
  const goalsMigrationKey = `chess-analysis-goals-migrated-${user.id}`;
  let browserGoalsToMigrate = false;
  if (!cloudStudyGoalsColumnAvailable) {
    const savedGoals = localStorage.getItem(getStudyGoalsStorageKey());
    if (savedGoals) studyGoals = readStudyGoals(JSON.parse(savedGoals));
  } else if (!localStorage.getItem(goalsMigrationKey)) {
    const savedGoals = localStorage.getItem(getStudyGoalsStorageKey())
      ?? localStorage.getItem('chess-analysis-study-goals');
    if (savedGoals) {
      const localGoals = readStudyGoals(JSON.parse(savedGoals));
      const goalsAreDefault = Object.keys(defaultGoals).every((key) => studyGoals[key] === defaultGoals[key]);
      const localGoalsAreDefault = Object.keys(defaultGoals).every((key) => localGoals[key] === defaultGoals[key]);
      if (goalsAreDefault && !localGoalsAreDefault) {
        studyGoals = localGoals;
        browserGoalsToMigrate = true;
      }
    }
  }
  const migrationKey = `chess-analysis-cloud-migrated-${user.id}`;
  let migrated = false;
  let nextCollections = cloudCollections;
  let nextHistory = cloudHistory;
  if (!localStorage.getItem(migrationKey)) {
    try {
      const localCollections = readStorageArray('chess-analysis-collections');
      const localHistory = readStorageArray('chess-analysis-insight-history');
      const collectionIds = new Set(cloudCollections.map((item) => item?.id));
      nextCollections = [
        ...cloudCollections,
        ...localCollections.filter((item) => item && !collectionIds.has(item.id))
      ];
      const historyIds = new Set(cloudHistory.map((item) => `${item?.savedAt}:${item?.moveCount}`));
      nextHistory = [
        ...cloudHistory,
        ...localHistory.filter((item) => item && !historyIds.has(`${item.savedAt}:${item.moveCount}`))
      ].slice(-20);
      if (localCollections.length || localHistory.length) {
        await writeCloudData(user.id, nextCollections, nextHistory, cloudGames);
        migrated = true;
      }
      localStorage.setItem(migrationKey, 'true');
    } catch (error) {
      nextCollections = cloudCollections;
      nextHistory = cloudHistory;
      setAccountStatus(`Your cloud data loaded, but browser data could not be imported: ${error.message}`, true);
      console.error('Could not migrate browser chess data to the signed-in account.', error);
    }
  }

  let nextGames = cloudGames;
  const gamesMigrationKey = `chess-analysis-games-migrated-${user.id}`;
  let gamesMigrated = false;
  if (!localStorage.getItem(gamesMigrationKey)) {
    try {
      const localGames = readStorageArray('chess-analysis-games');
      const gameIds = new Set(cloudGames.map((entry) => entry?.id));
      nextGames = [
        ...cloudGames,
        ...localGames.filter((entry) => entry && !gameIds.has(entry.id))
      ].slice(-100);
      if (localGames.length) {
        if (cloudGamesColumnAvailable) {
          await writeCloudData(user.id, nextCollections, nextHistory, nextGames);
          gamesMigrated = cloudGamesColumnAvailable;
        }
      }
      if (cloudGamesColumnAvailable) {
        localStorage.setItem(gamesMigrationKey, 'true');
      }
    } catch (error) {
      nextGames = cloudGames;
      setAccountStatus(`Your account data loaded, but browser games could not be imported: ${error.message}`, true);
      console.error('Could not migrate browser chess games to the signed-in account.', error);
    }
  }

  if (currentUser?.id !== user.id) return;
  collectionItems = nextCollections;
  reviewEntries = nextHistory;
  gameLibrary = nextGames;
  if (browserGoalsToMigrate && cloudStudyGoalsColumnAvailable) {
    try {
      await writeCloudData(user.id, collectionItems, reviewEntries, gameLibrary);
      localStorage.setItem(goalsMigrationKey, 'true');
    } catch (error) {
      setAccountStatus(`Your account loaded, but browser study goals could not be imported: ${error.message}`, true);
      console.error('Could not migrate browser study goals to the signed-in account.', error);
    }
  } else if (cloudStudyGoalsColumnAvailable) {
    localStorage.setItem(goalsMigrationKey, 'true');
  }
  renderCollectionList();
  renderInsightHistory();
  renderGameLibrary();
  renderGameLibrarySyncState();
  if (!cloudGamesColumnAvailable || !cloudStudyGoalsColumnAvailable) {
    const featuresToUpdate = [
      ...(!cloudGamesColumnAvailable ? ['game syncing'] : []),
      ...(!cloudStudyGoalsColumnAvailable ? ['study-goal syncing'] : [])
    ].join(' and ');
    setAccountStatus(`Signed in. Collections and review history sync normally. ${featuresToUpdate} will be enabled after you run the latest supabase/schema.sql.`);
  } else if (migrated || gamesMigrated) {
    setAccountStatus('Signed in. Your existing browser studies and games were imported into your account.');
  }
}

async function handleAuthSession(session, eventType = '') {
  const user = session?.user ?? null;
  if (eventType === 'PASSWORD_RECOVERY') {
    accountPasswordForm.hidden = false;
    setAccountStatus('Choose a new password to finish resetting your account.');
  }
  if (user?.id === loadedCloudUserId) return;
  currentUser = user;
  cloudGamesColumnAvailable = true;
  cloudStudyGoalsColumnAvailable = true;
  renderAccountState();

  if (user && supabase) {
    loadedCloudUserId = user.id;
    setAccountStatus('Loading your saved studies…');
    collectionItems = [];
    reviewEntries = [];
    gameLibrary = [];
    renderCollectionList();
    renderInsightHistory();
    renderGameLibrary();
    try {
      await loadCloudData(user);
      if (accountStatus.textContent === 'Loading your saved studies…') {
        setAccountStatus(`Signed in as ${user.email}. Your studies sync to your account.`);
      }
    } catch (error) {
      if (currentUser?.id !== user.id) return;
      setAccountStatus(`Could not load your account data: ${error.message}. Check that the Supabase table and row-level security policies are configured.`, true);
      collectionStatus.textContent = 'Cloud data is unavailable. Your account data has not been replaced.';
      console.error('Could not load Supabase chess data.', error);
    }
    return;
  }

  loadedCloudUserId = null;
  try {
    await loadBrowserData();
    if (supabaseConfigured) setAccountStatus('Signed out. Collections and review snapshots are saved in this browser.');
  } catch (error) {
    collectionItems = [];
    reviewEntries = [];
    gameLibrary = [];
    renderCollectionList();
    renderInsightHistory();
    renderGameLibrary();
    collectionStatus.textContent = `Could not read browser data: ${error.message}`;
    console.error('Could not read local chess data.', error);
  }
}

function initializeAccount() {
  renderAccountState();
  if (!supabaseConfigured || !supabase) {
    accountForm.hidden = false;
    accountForm.querySelectorAll('input, button').forEach((control) => {
      control.disabled = true;
    });
    setAccountStatus(`${supabaseConfigurationError} Edit .env.local, then stop and restart Vite. Browser-only saving remains available.`, true);
    void loadBrowserData().catch((error) => {
      collectionStatus.textContent = `Could not read browser data: ${error.message}`;
      console.error('Could not read local chess data.', error);
    });
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      void handleAuthSession(session, event);
    }, 0);
  });
  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) throw error;
    return handleAuthSession(data.session);
  }).catch((error) => {
    setAccountStatus(`Could not restore your sign-in: ${error.message}`, true);
    console.error('Could not restore Supabase auth session.', error);
  });
}

function serializeNode(node) {
  return {
    id: node.id,
    fen: node.fen,
    from: node.from,
    to: node.to,
    promotion: node.promotion,
    san: node.san,
    color: node.color,
    moveNumber: node.moveNumber,
    comment: node.comment ?? '',
    highlights: node.highlights ?? [],
    arrows: node.arrows ?? [],
    annotation: node.annotation ?? null,
    preferredChildId: node.preferredChild?.id ?? null,
    children: node.children.map(serializeNode)
  };
}

function deserializeNode(data, parent = null) {
  if (
    !data
    || !Number.isInteger(data.id)
    || typeof data.fen !== 'string'
    || !Array.isArray(data.children)
  ) throw new Error('Saved collection contains an invalid move node.');
  new Chess(data.fen);
  const node = {
    id: data.id,
    fen: data.fen,
    parent,
    children: [],
    preferredChild: null,
    from: data.from,
    to: data.to,
    promotion: data.promotion,
    san: data.san,
    color: data.color,
    moveNumber: data.moveNumber,
    comment: typeof data.comment === 'string' ? data.comment : '',
    highlights: Array.isArray(data.highlights)
      ? data.highlights.map((mark) => {
        const square = typeof mark === 'string' ? mark : mark?.square;
        const color = ['gold', 'green', 'red'].includes(mark?.color) ? mark.color : 'gold';
        return /^[a-h][1-8]$/.test(square) ? { square, color } : null;
      }).filter(Boolean)
      : [],
    arrows: Array.isArray(data.arrows)
      ? data.arrows.filter((arrow) =>
        arrow && /^[a-h][1-8]$/.test(arrow.from) && /^[a-h][1-8]$/.test(arrow.to)
      )
      : [],
    annotation: data.annotation && typeof data.annotation === 'object'
      ? data.annotation
      : null,
    preferredChildId: Number.isInteger(data.preferredChildId) ? data.preferredChildId : null
  };
  node.children = data.children.map((child) => deserializeNode(child, node));
  node.preferredChild = node.children.find((child) => child.id === node.preferredChildId) ?? null;
  delete node.preferredChildId;
  return node;
}

function startPractice(node) {
  const bestMove = bestMoves.get(node.parent?.fen);
  if (!node.parent || !bestMove || !getBestMoveSan(node.parent.fen, bestMove)) {
    practiceStatus.textContent = 'Analyze this position first to load Stockfish’s recommended move.';
    return;
  }
  practiceTargetNode = node;
  navigateToNode(node.parent);
  practiceStatus.textContent = `Retry move ${node.moveNumber}${node.color === 'b' ? '…' : '.'} ${node.san}. Find Stockfish’s top move.`;
}

function startOpeningPractice() {
  const lines = getOpeningTrainingLines().get(openingTrainerSelect.value) ?? [];
  if (!lines.length) {
    openingTrainerStatus.textContent = 'Import a game in this opening before starting practice.';
    return;
  }
  const line = lines[Math.floor(Math.random() * lines.length)];
  try {
    practiceTargetNode = null;
    practiceSessionContext = null;
    loadPgnText(line.pgn, line.gameId);
    const practiceLength = Math.min(line.moves.length, 8);
    const startIndex = Math.floor(Math.random() * practiceLength);
    let node = rootNode;
    for (let index = 0; index < startIndex; index++) {
      node = node.children[0];
      if (!node) throw new Error('The saved opening line is incomplete.');
    }
    navigateToNode(node);
    openingTrainerSession = {
      gameId: line.gameId,
      opening: openingTrainerSelect.value,
      moves: line.moves,
      index: startIndex
    };
    openingHintVisible = false;
    openingTrainerHintButton.disabled = false;
    openingTrainerHintButton.textContent = 'Show hint';
    openingTrainerStatus.textContent = `Your turn to recall ${game.turn() === 'w' ? 'White’s' : 'Black’s'} next move in the ${openingTrainerSession.opening}.`;
    void updateOpeningPracticeProgress(line.gameId, { started: true });
    document.getElementById('game-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    openingTrainerSession = null;
    openingTrainerHintButton.disabled = true;
    openingTrainerStatus.textContent = `Could not start opening practice: ${error.message}`;
  }
}

async function updateOpeningPracticeProgress(gameId, { started = false, correctMove = false, completed = false } = {}) {
  const previousGames = gameLibrary;
  const now = new Date().toISOString();
  gameLibrary = gameLibrary.map((entry) => {
    if (entry.id !== gameId) return entry;
    const progress = entry.openingPractice ?? { sessions: 0, correctMoves: 0, completedLines: 0, sessionDates: [] };
    return {
      ...entry,
      openingPractice: {
        ...progress,
        sessions: Number(progress.sessions ?? 0) + Number(started),
        correctMoves: Number(progress.correctMoves ?? 0) + Number(correctMove),
        completedLines: Number(progress.completedLines ?? 0) + Number(completed),
        sessionDates: started ? [...(progress.sessionDates ?? []), now].slice(-200) : (progress.sessionDates ?? [])
      }
    };
  });
  renderOpeningTrainer();
  renderProgressDashboard();
  try {
    await persistUserData();
  } catch (error) {
    gameLibrary = previousGames;
    renderOpeningTrainer();
    renderProgressDashboard();
    openingTrainerStatus.textContent = `Opening practice progress could not be saved: ${error.message}`;
    console.error('Could not save opening training progress.', error);
  }
}

function findMistakeNode(mistake) {
  let match = null;
  function visit(parent) {
    for (const child of parent.children) {
      if (
        child.annotation.beforeFen === mistake.fen
        && child.san === mistake.san
        && child.color === mistake.color
      ) match = child;
      visit(child);
    }
  }
  visit(rootNode);
  return match;
}

function startSavedMistake(gameEntry, mistake) {
  try {
    loadPgnText(gameEntry.pgn, gameEntry.id);
    const node = findMistakeNode(mistake);
    if (!node) throw new Error('The saved mistake position could not be found in this PGN.');
    bestMoves.set(mistake.fen, mistake.bestMove);
    practiceSessionContext = { gameId: gameEntry.id, mistakeId: mistake.id };
    startPractice(node);
  } catch (error) {
    practiceSessionContext = null;
    practiceStatus.textContent = `Could not start this practice position: ${error.message}`;
  }
}

async function recordMistakePracticeAttempt(solved) {
  if (!practiceSessionContext) return;
  const { gameId, mistakeId } = practiceSessionContext;
  const previousGames = gameLibrary;
  gameLibrary = gameLibrary.map((entry) => {
    if (entry.id !== gameId || !Array.isArray(entry.review?.mistakes)) return entry;
    return {
      ...entry,
      review: {
        ...entry.review,
        mistakes: entry.review.mistakes.map((mistake) => mistake.id === mistakeId
          ? {
            ...mistake,
            attempts: (Number(mistake.attempts) || 0) + 1,
            solved: mistake.solved || solved,
            solvedAt: solved ? new Date().toISOString() : mistake.solvedAt ?? null
          }
          : mistake
        )
      }
    };
  });
  if (solved) practiceSessionContext = null;
  renderMistakePracticeQueue();
  renderProgressDashboard();
  try {
    await persistUserData();
    if (solved) practiceStatus.textContent += ' Progress saved to your practice queue.';
  } catch (error) {
    gameLibrary = previousGames;
    renderMistakePracticeQueue();
    renderProgressDashboard();
    practiceStatus.textContent = `Practice result could not be saved: ${error.message}`;
    console.error('Could not save mistake practice progress.', error);
  }
}

accountModeButton.addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  accountNameField.hidden = !isSignUpMode;
  accountNameInput.required = isSignUpMode;
  accountPasswordInput.autocomplete = isSignUpMode ? 'new-password' : 'current-password';
  accountSubmitButton.textContent = isSignUpMode ? 'Create account' : 'Sign in';
  accountModeButton.textContent = isSignUpMode ? 'Already have an account? Sign in' : 'Create an account';
  accountResetButton.hidden = isSignUpMode;
  setAccountStatus(isSignUpMode
    ? 'Create an account to sync your studies across devices.'
    : 'Sign in to sync your saved collections and review history.');
});

accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) {
    setAccountStatus('Account sync is not configured. Add your Supabase settings and restart Vite.', true);
    return;
  }
  accountSubmitButton.disabled = true;
  setAccountStatus(isSignUpMode ? 'Creating your account…' : 'Signing in…');
  try {
    const email = accountEmailInput.value.trim();
    const password = accountPasswordInput.value;
    const result = isSignUpMode
      ? await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: accountNameInput.value.trim() } }
      })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    accountPasswordInput.value = '';
    if (isSignUpMode && !result.data.session) {
      setAccountStatus('Account created. Check your email for a verification link, then sign in.');
    } else if (isSignUpMode) {
      setAccountStatus('Account created and signed in.');
    } else {
      setAccountStatus('Signed in. Loading your saved studies…');
    }
  } catch (error) {
    setAccountStatus(`Could not ${isSignUpMode ? 'create your account' : 'sign in'}: ${error.message}`, true);
    console.error('Supabase authentication failed.', error);
  } finally {
    accountSubmitButton.disabled = false;
  }
});

accountResetButton.addEventListener('click', async () => {
  if (!supabase) {
    setAccountStatus('Account sync is not configured. Add your Supabase settings and restart Vite.', true);
    return;
  }
  const email = accountEmailInput.value.trim();
  if (!email) {
    setAccountStatus('Enter your account email first to receive a password reset link.', true);
    accountEmailInput.focus();
    return;
  }
  accountResetButton.disabled = true;
  setAccountStatus('Sending password reset email…');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    setAccountStatus('If an account exists for that email, a password reset link is on its way.');
  } catch (error) {
    setAccountStatus(`Could not request a password reset: ${error.message}`, true);
    console.error('Supabase password reset failed.', error);
  } finally {
    accountResetButton.disabled = false;
  }
});

accountChangePasswordToggle.addEventListener('click', () => {
  accountPasswordForm.hidden = !accountPasswordForm.hidden;
  if (!accountPasswordForm.hidden) accountNewPassword.focus();
});

accountPasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const submitButton = accountPasswordForm.querySelector('button[type="submit"], button:not([type])');
  if (submitButton) submitButton.disabled = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: accountNewPassword.value });
    if (error) throw error;
    accountNewPassword.value = '';
    accountPasswordForm.hidden = true;
    setAccountStatus('Your password has been updated.');
  } catch (error) {
    setAccountStatus(`Could not update your password: ${error.message}`, true);
    console.error('Supabase password update failed.', error);
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

accountSignoutButton.addEventListener('click', async () => {
  if (!supabase) return;
  accountSignoutButton.disabled = true;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAccountStatus('Signed out. Cloud data is no longer shown in this browser.');
  } catch (error) {
    setAccountStatus(`Could not sign out: ${error.message}`, true);
    console.error('Supabase sign out failed.', error);
  } finally {
    accountSignoutButton.disabled = false;
  }
});

document.getElementById('review-game-button').addEventListener('click', () => {
  reviewRequested = true;
  reviewStatus.textContent = 'Reviewing the current game and its variations…';
  analyzeGamePositions();
});

explorerAuthForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const token = explorerTokenInput.value.trim();
  explorerTokenInput.value = '';
  if (!token) {
    explorerSummary.textContent = 'Paste a Lichess personal token before connecting.';
    explorerTokenInput.focus();
    return;
  }
  explorerAccessToken = token;
  explorerDisconnectButton.hidden = false;
  explorerFen = null;
  updateOpeningExplorer();
});

explorerDisconnectButton.addEventListener('click', () => {
  explorerAccessToken = '';
  explorerFen = null;
  explorerController?.abort();
  explorerDisconnectButton.hidden = true;
  updateOpeningExplorer();
});

reviewMoments.addEventListener('click', (event) => {
  const button = event.target.closest('.practice-move-button');
  if (!button) return;
  const node = findNodeById(rootNode, Number(button.dataset.nodeId));
  if (node) startPractice(node);
});

document.querySelector('.annotation-toolbar').addEventListener('click', (event) => {
  const button = event.target.closest('[data-annotation-tool]');
  if (!button) return;
  const selectedTool = button.dataset.annotationTool;
  annotationTool = annotationTool === selectedTool ? null : selectedTool;
  document.querySelectorAll('[data-annotation-tool]').forEach((toolButton) => {
    toolButton.setAttribute('aria-pressed', String(toolButton.dataset.annotationTool === annotationTool));
  });
  annotationStatus.textContent = annotationTool
    ? 'Click squares to highlight; right-click any two squares to draw an arrow.'
    : 'Right-click two squares to draw an arrow. Board move selection is active.';
});

document.getElementById('clear-annotations-button').addEventListener('click', () => {
  currentNode.highlights = [];
  currentNode.arrows = [];
  pendingArrowFrom = null;
  annotationStatus.textContent = 'Annotations cleared for this position.';
  renderBoard();
});

board.addEventListener('contextmenu', (event) => {
  const square = event.target.closest('.square');
  if (!square || !board.contains(square) || setupMode) return;
  event.preventDefault();
  const squareName = square.dataset.square;
  if (!pendingArrowFrom) {
    pendingArrowFrom = squareName;
    annotationStatus.textContent = `Right-click a destination square to draw an arrow from ${squareName}.`;
    return;
  }
  if (pendingArrowFrom === squareName) {
    pendingArrowFrom = null;
    annotationStatus.textContent = 'Arrow drawing cancelled.';
    return;
  }
  toggleBoardArrow(pendingArrowFrom, squareName);
});

showTacticsButton.addEventListener('click', () => {
  showTactics = !showTactics;
  showTacticsButton.setAttribute('aria-pressed', String(showTactics));
  showTacticsButton.textContent = showTactics ? 'Hide tactics on board' : 'Show tactics on board';
  renderBoardArrows();
});

function toggleBoardArrow(from, to) {
  const arrows = currentNode.arrows ?? (currentNode.arrows = []);
  const existing = arrows.findIndex((arrow) => arrow.from === from && arrow.to === to);
  if (existing >= 0) arrows.splice(existing, 1);
  else arrows.push({ from, to });
  pendingArrowFrom = null;
  annotationStatus.textContent = `Arrow ${from} → ${to} ${existing >= 0 ? 'removed' : 'added'} for this position.`;
  renderBoard();
}

document.getElementById('setup-start-button').addEventListener('click', beginPositionSetup);
document.getElementById('setup-clear-button').addEventListener('click', clearSetupPosition);
document.getElementById('setup-apply-button').addEventListener('click', finishPositionSetup);
document.getElementById('setup-cancel-button').addEventListener('click', () => {
  setupMode = false;
  setupPosition = null;
  document.getElementById('setup-apply-button').disabled = true;
  document.getElementById('setup-cancel-button').hidden = true;
  setupStatus.textContent = 'Position setup cancelled.';
  renderBoard();
});

collectionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = collectionName.value.trim();
  if (!name) {
    collectionStatus.textContent = 'Enter a collection name before saving.';
    return;
  }
  let savedItemId = null;
  const ownerId = currentUser?.id ?? null;
  try {
    if (collectionItems.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      collectionStatus.textContent = currentUser
        ? 'A collection with that name already exists in your account. Choose another name.'
        : 'A collection with that name already exists. Choose another name.';
      return;
    }
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      savedAt: new Date().toISOString(),
      currentNodeId: currentNode.id,
      root: serializeNode(rootNode)
    };
    savedItemId = item.id;
    collectionItems.push(item);
    await persistUserData();
    collectionName.value = '';
    renderCollectionList();
    collectionList.value = item.id;
    collectionStatus.textContent = ownerId
      ? `Saved “${name}” to your account.`
      : `Saved “${name}” in this browser. Sign in to sync it across devices.`;
  } catch (error) {
    if ((currentUser?.id ?? null) === ownerId && savedItemId) {
      collectionItems = collectionItems.filter((item) => item.id !== savedItemId);
    }
    collectionStatus.textContent = `Could not save collection: ${error.message}`;
    console.error('Could not save chess collection.', error);
  }
});

document.getElementById('load-collection-button').addEventListener('click', async () => {
  try {
    const item = collectionItems
      .find((entry) => entry.id === collectionList.value);
    if (!item) throw new Error('Choose a saved collection first.');
    const restoredRoot = deserializeNode(item.root);
    const nodes = [];
    function collect(node) {
      nodes.push(node);
      node.children.forEach(collect);
    }
    collect(restoredRoot);
    const ids = new Set(nodes.map((node) => node.id));
    if (ids.size !== nodes.length) throw new Error('Saved collection contains duplicate move identifiers.');
    rootNode = restoredRoot;
    currentNode = findNodeById(rootNode, item.currentNodeId) ?? rootNode;
    game = new Chess(currentNode.fen);
    fenInput.value = game.fen();
    nextNodeId = Math.max(...nodes.map((node) => node.id)) + 1;
    setupMode = false;
    setupPosition = null;
    reviewRequested = false;
    practiceTargetNode = null;
    selectedSquare = null;
    legalMoves = [];
    pendingFens.length = 0;
    explorerFen = null;
    tablebaseFen = null;
    renderGameReview();
    collectionStatus.textContent = `Opened “${item.name}”.`;
    renderBoard();
  } catch (error) {
    collectionStatus.textContent = `Could not open collection: ${error.message}`;
  }
});

document.getElementById('delete-collection-button').addEventListener('click', async () => {
  const previousItems = collectionItems;
  const ownerId = currentUser?.id ?? null;
  try {
    const remaining = collectionItems.filter((item) => item.id !== collectionList.value);
    if (remaining.length === collectionItems.length) {
      collectionStatus.textContent = 'Choose a saved collection to delete.';
      return;
    }
    collectionItems = remaining;
    await persistUserData();
    renderCollectionList();
    collectionStatus.textContent = ownerId ? 'Collection deleted from your account.' : 'Collection deleted.';
  } catch (error) {
    if ((currentUser?.id ?? null) === ownerId) {
      collectionItems = previousItems;
      renderCollectionList();
    }
    collectionStatus.textContent = `Could not delete collection: ${error.message}`;
    console.error('Could not delete chess collection.', error);
  }
});

document.getElementById('save-insight-button').addEventListener('click', async () => {
  const reviews = getReviewMoves();
  const white = reviews.filter(({ node }) => node.color === 'w').map(({ loss }) => loss);
  const black = reviews.filter(({ node }) => node.color === 'b').map(({ loss }) => loss);
  const whiteAccuracy = estimateAccuracy(white);
  const blackAccuracy = estimateAccuracy(black);
  if (whiteAccuracy === null && blackAccuracy === null) {
    collectionStatus.textContent = 'Analyze game positions before saving a review snapshot.';
    return;
  }
  const previousEntries = reviewEntries;
  const previousGames = gameLibrary;
  const ownerId = currentUser?.id ?? null;
  const linkedGame = gameLibrary.find((entry) => entry.id === currentLibraryGameId);
  let playerAccuracy = null;
  if (linkedGame) {
    const relevantReviews = linkedGame.playerColor
      ? reviews.filter(({ node }) => node.color === linkedGame.playerColor)
      : reviews;
    playerAccuracy = linkedGame.playerColor
      ? estimateAccuracy(relevantReviews.map(({ loss }) => loss))
      : null;
    const categoryCounts = {};
    for (const review of relevantReviews) {
      const category = review.classification?.category;
      if (category) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    }
    const previousMistakes = new Map(
      (linkedGame.review?.mistakes ?? []).map((mistake) => [mistake.id, mistake])
    );
    const mistakes = reviews
      .filter(({ classification, missedMateInOne }) =>
        missedMateInOne || ['Miss', 'Blunder', 'Mistake', 'Inaccuracy'].includes(classification?.category)
      )
      .filter(({ node }) => !linkedGame.playerColor || node.color === linkedGame.playerColor)
      .map(({ node, classification, missedMateInOne, bestMove, bestSan, loss, beforeScore, afterScore }) => {
        const id = `${node.moveNumber}-${node.color}-${node.san}-${node.annotation.beforeFen}`;
        const previous = previousMistakes.get(id);
        const category = missedMateInOne ? 'Missed mate in one' : classification.category;
        const bestReplyCapture = getBestReplyCapture(
          node.annotation.afterFen,
          bestMoves.get(node.annotation.afterFen),
          node.color
        );
        const bestFork = getForkThreatAfterMove(node.annotation.beforeFen, bestMove);
        return {
          id,
          fen: node.annotation.beforeFen,
          moveNumber: node.moveNumber,
          color: node.color,
          san: node.san,
          category,
          bestMove,
          bestSan,
          loss,
          explanation: explainCriticalMove(
            missedMateInOne ? 'Miss' : classification.category,
            node.color,
            bestSan,
            loss,
            beforeScore,
            afterScore,
            bestReplyCapture,
            bestFork
          ),
          attempts: previous?.attempts ?? 0,
          solved: previous?.solved ?? false,
          solvedAt: previous?.solvedAt ?? null
        };
      });
    gameLibrary = gameLibrary.map((entry) => entry.id === linkedGame.id
      ? {
        ...entry,
        review: {
          savedAt: new Date().toISOString(),
          playerColor: linkedGame.playerColor,
          playerAccuracy,
          whiteAccuracy,
          blackAccuracy,
          moveCount: reviews.length,
          categoryCounts,
          mistakes
        }
      }
      : entry
    );
  }
  try {
    reviewEntries = [...reviewEntries, {
      savedAt: new Date().toISOString(),
      whiteAccuracy: whiteAccuracy ?? 0,
      blackAccuracy: blackAccuracy ?? 0,
      playerAccuracy,
      moveCount: reviews.length,
      gameId: linkedGame?.id ?? null,
      opening: linkedGame?.opening ?? identifyOpening(getDisplayedPath(currentNode))
    }].slice(-20);
    await persistUserData();
    renderInsightHistory();
    renderGameLibrary();
    renderMistakePracticeQueue();
    collectionStatus.textContent = ownerId
      ? 'Review snapshot saved to your account.'
      : 'Review snapshot saved in this browser. Sign in to sync it across devices.';
  } catch (error) {
    if ((currentUser?.id ?? null) === ownerId) {
      reviewEntries = previousEntries;
      gameLibrary = previousGames;
      renderGameLibrary();
    }
    collectionStatus.textContent = `Could not save review snapshot: ${error.message}`;
    console.error('Could not save review snapshot.', error);
  }
});

mistakePracticeQueue.addEventListener('click', (event) => {
  const button = event.target.closest('[data-practice-game-id]');
  if (!button) return;
  const gameEntry = gameLibrary.find((entry) => entry.id === button.dataset.practiceGameId);
  const mistake = gameEntry?.review?.mistakes?.find((item) => item.id === button.dataset.practiceMistakeId);
  if (gameEntry && mistake) startSavedMistake(gameEntry, mistake);
});

openingTrainerStartButton.addEventListener('click', startOpeningPractice);

openingTrainerHintButton.addEventListener('click', () => {
  if (!openingTrainerSession) return;
  const move = openingTrainerSession.moves[openingTrainerSession.index];
  if (!move) return;
  openingHintVisible = !openingHintVisible;
  openingTrainerHintButton.textContent = openingHintVisible ? 'Hide hint' : 'Show hint';
  openingTrainerStatus.textContent = openingHintVisible
    ? `Hint: play ${move.san}. Make the move on the board to continue.`
    : `Hint hidden. Find move ${openingTrainerSession.index + 1} on the board.`;
});

studyGoalsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextGoals = {
    reviews: Number(studyGoalReviewsInput.value),
    mistakes: Number(studyGoalMistakesInput.value),
    openings: Number(studyGoalOpeningsInput.value)
  };
  if (
    !studyGoalsForm.reportValidity()
    || !Number.isInteger(nextGoals.reviews)
    || !Number.isInteger(nextGoals.mistakes)
    || !Number.isInteger(nextGoals.openings)
  ) return;
  const previousGoals = studyGoals;
  studyGoals = readStudyGoals(nextGoals);
  renderStudyGoals();
  studyGoalsStatus.textContent = 'Saving your weekly goals…';
  try {
    await persistUserData();
    studyGoalsStatus.textContent = currentUser
      ? 'Weekly goals saved to your account.'
      : 'Weekly goals saved in this browser.';
  } catch (error) {
    studyGoals = previousGoals;
    renderStudyGoals();
    studyGoalsStatus.textContent = `Could not save your goals: ${error.message}`;
    console.error('Could not save weekly study goals.', error);
  }
});

gameAccountImportForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('game-import-username').value.trim();
  const platform = document.getElementById('game-import-platform').value;
  const count = Number(document.getElementById('game-import-count').value);
  const submitButton = gameAccountImportForm.querySelector('button[type="submit"]');
  if (!/^[a-zA-Z0-9_-]{1,30}$/.test(username)) {
    gameLibraryStatus.textContent = 'Enter a public player username using letters, numbers, underscores, or hyphens.';
    return;
  }
  submitButton.disabled = true;
  gameLibraryStatus.textContent = `Loading recent public games from ${platform === 'lichess' ? 'Lichess' : 'Chess.com'}…`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    let pgn = '';
    if (platform === 'lichess') {
      const query = new URLSearchParams({
        max: String(count),
        clocks: 'false',
        evals: 'false',
        opening: 'true'
      });
      const response = await fetch(
        `https://lichess.org/api/games/user/${encodeURIComponent(username)}?${query}`,
        {
          headers: { Accept: 'application/x-chess-pgn' },
          signal: controller.signal
        }
      );
      if (response.status === 404) throw new Error('That Lichess user was not found or has no public games.');
      if (!response.ok) throw new Error(`Lichess returned HTTP ${response.status}.`);
      pgn = await response.text();
    } else {
      const archivesResponse = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`,
        { signal: controller.signal }
      );
      if (archivesResponse.status === 404) throw new Error('That Chess.com user was not found or has no public games.');
      if (!archivesResponse.ok) throw new Error(`Chess.com returned HTTP ${archivesResponse.status}.`);
      const { archives } = await archivesResponse.json();
      if (!Array.isArray(archives) || !archives.length) throw new Error('No public game archives were found for that Chess.com user.');
      const selectedArchives = archives.slice(-12).reverse();
      const pgnGames = [];
      for (const archiveUrl of selectedArchives) {
        const archiveResponse = await fetch(archiveUrl, { signal: controller.signal });
        if (!archiveResponse.ok) {
          console.warn(`Could not load a Chess.com archive for ${username}: HTTP ${archiveResponse.status}.`);
          continue;
        }
        const archive = await archiveResponse.json();
        for (const archivedGame of (archive.games ?? []).slice().reverse()) {
          if (typeof archivedGame.pgn === 'string') pgnGames.push(archivedGame.pgn);
          if (pgnGames.length >= count) break;
        }
        if (pgnGames.length >= count) break;
      }
      pgn = pgnGames.slice(0, count).join('\n\n');
    }

    if (!pgn.trim()) throw new Error('No public PGN games were returned. Check the username and public-game privacy settings.');
    gameLibraryPlayer.value = username;
    const result = await importPgnBatch(pgn, username, platform);
    gameLibraryStatus.textContent = `${result.message}${result.imported ? ` ${platform === 'lichess' ? 'Lichess' : 'Chess.com'} games are ready to review.` : ''}`;
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The import took too long. Try a smaller batch or check your connection.'
      : error.message;
    gameLibraryStatus.textContent = `Could not import games: ${message}`;
    console.error(`Could not import public ${platform} games.`, error);
  } finally {
    window.clearTimeout(timeout);
    submitButton.disabled = false;
  }
});

gameLibraryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const result = await importPgnBatch(gameLibraryPgn.value, gameLibraryPlayer.value);
    gameLibraryPgn.value = '';
    gameLibraryStatus.textContent = result.message;
  } catch (error) {
    gameLibraryStatus.textContent = error.message;
    console.error('Could not import PGN games.', error);
  }
});

gameLibraryList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-game-action]');
  if (!button) return;
  const entry = gameLibrary.find((gameEntry) => gameEntry.id === button.dataset.gameId);
  if (!entry) return;

  if (button.dataset.gameAction === 'review') {
    try {
      loadPgnText(entry.pgn, entry.id);
      document.getElementById('review-game-button').click();
      document.getElementById('review-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      gameLibraryStatus.textContent = `Could not load this game: ${error.message}`;
    }
    return;
  }

  if (button.dataset.gameAction === 'remove') {
    const previousGames = gameLibrary;
    const ownerId = currentUser?.id ?? null;
    gameLibrary = gameLibrary.filter((gameEntry) => gameEntry.id !== entry.id);
    try {
      await persistUserData();
      renderGameLibrary();
      gameLibraryStatus.textContent = ownerId ? 'Game removed from your account.' : 'Game removed from this browser.';
    } catch (error) {
      if ((currentUser?.id ?? null) === ownerId) gameLibrary = previousGames;
      renderGameLibrary();
      gameLibraryStatus.textContent = `Could not remove this game: ${error.message}`;
      console.error('Could not remove imported chess game.', error);
    }
  }
});

board.addEventListener('click', async (event) => {
  const clickedSquare = event.target.closest('.square');
  if (!clickedSquare || !board.contains(clickedSquare)) return;

  const squareName = clickedSquare.dataset.square;
  if (setupMode) {
    const rank = 8 - Number(squareName[1]);
    const file = files.indexOf(squareName[0]);
    setupPosition[rank][file] = setupPiece.value === 'erase'
      ? null
      : { type: setupPiece.value, color: setupColor.value };
    renderBoard();
    return;
  }

  if (annotationTool) {
    const highlights = currentNode.highlights ?? (currentNode.highlights = []);
    const existing = highlights.findIndex((mark) =>
      (typeof mark === 'string' ? mark : mark.square) === squareName
    );
    if (existing >= 0) highlights.splice(existing, 1);
    else highlights.push({ square: squareName, color: annotationColor.value });
    annotationStatus.textContent = `Square ${squareName} annotation updated.`;
    renderBoard();
    return;
  }

  if (game.isGameOver()) return;
  const targetMove = legalMoves.find((move) => move.to === squareName);
  if (selectedSquare && targetMove) {
    let moveToPlay = targetMove;
    if (targetMove.promotion) {
      moveToPlay = await handlePromotion(targetMove);
      if (!moveToPlay) return;
    }

    playMove(moveToPlay);
    return;
  }

  const piece = game.get(squareName);
  if (piece?.color === game.turn()) {
    selectedSquare = squareName;
    legalMoves = game.moves({ square: squareName, verbose: true });
  } else {
    selectedSquare = null;
    legalMoves = [];
  }

  renderBoard();
});

candidateLinesElement.addEventListener('click', (event) => {
  const button = event.target.closest('.line-play-button');
  if (!button || button.disabled || button.dataset.fen !== game.fen()) return;
  playMove({
    from: button.dataset.from,
    to: button.dataset.to,
    ...(button.dataset.promotion ? { promotion: button.dataset.promotion } : {})
  });
});

moveHistory.addEventListener('click', (event) => {
  const button = event.target.closest('.history-move-button');
  if (!button) return;
  const node = findNodeById(rootNode, Number(button.dataset.nodeId));
  if (node) navigateToNode(node);
});

variationsTree.addEventListener('click', (event) => {
  const button = event.target.closest('.variation-move');
  if (!button) return;
  const node = findNodeById(rootNode, Number(button.dataset.nodeId));
  if (node) navigateToNode(node);
});

const historyNavigation = document.querySelector('.history-navigation');
historyNavigation.addEventListener('click', (event) => {
  const button = event.target.closest('[data-navigation]');
  if (!button) return;

  if (button.dataset.navigation === 'start') {
    navigateToNode(rootNode);
  } else if (button.dataset.navigation === 'previous' && currentNode.parent) {
    navigateToNode(currentNode.parent);
  } else if (button.dataset.navigation === 'next') {
    const nextNode = currentNode.preferredChild ?? currentNode.children[0];
    if (nextNode) navigateToNode(nextNode);
  } else if (button.dataset.navigation === 'end') {
    let node = currentNode;
    while (node.preferredChild ?? node.children[0]) {
      node = node.preferredChild ?? node.children[0];
    }
    navigateToNode(node);
  }
});

document.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  if (
    event.target instanceof Element
    && event.target.closest('input, textarea, select, [contenteditable="true"]')
  ) return;
  event.preventDefault();
  navigateByKeyboard(event.key);
});

commentForm.addEventListener('submit', (event) => event.preventDefault());
positionComment.addEventListener('input', () => {
  currentNode.comment = positionComment.value;
  commentStatus.textContent = 'Comment attached to this position.';
  renderVariationsTree();
});

explorerMoves.addEventListener('click', (event) => {
  const button = event.target.closest('.explorer-move');
  if (!button || button.dataset.fen !== game.fen()) return;
  const match = button.dataset.uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return;
  playMove({
    from: match[1],
    to: match[2],
    ...(match[3] ? { promotion: match[3] } : {})
  });
});

tablebaseMoves.addEventListener('click', (event) => {
  const button = event.target.closest('.tablebase-play-button');
  if (!button || button.dataset.fen !== game.fen()) return;
  const match = button.dataset.uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);
  if (!match) return;
  playMove({
    from: match[1],
    to: match[2],
    ...(match[3] ? { promotion: match[3] } : {})
  });
});

fenForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    replaceGame(new Chess(fenInput.value.trim()), 'Position loaded. Stockfish is analyzing it.');
  } catch (error) {
    loadStatus.textContent = `Could not load FEN: ${error.message}`;
  }
});

pgnForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    loadPgnText(pgnInput.value);
  } catch (error) {
    loadStatus.textContent = `Could not load PGN: ${error.message}`;
  }
});

document.getElementById('multipv-select').addEventListener('change', () => {
  multiPv = Number(multipvSelect.value);
  currentLines.clear();
  renderCandidateLines();
  pendingFens.length = 0;
  pendingFens.push(game.fen());

  if (activeFen) {
    reconfigureAfterStop = true;
    if (!stopRequested) {
      stopRequested = true;
      stockfishWorker.postMessage('stop');
    }
  } else if (engineReady) {
    configureEngine();
  }
});

engineDepthInput.addEventListener('input', () => {
  engineDepthValue.textContent = engineDepthInput.value;
});

engineDepthInput.addEventListener('change', () => {
  engineDepth = Number(engineDepthInput.value);
  engineDepthValue.textContent = String(engineDepth);
  currentLines.clear();
  linesByFen.clear();
  candidateLineCache.clear();
  evaluations.clear();
  bestMoves.clear();
  pendingFens.length = 0;
  renderCandidateLines();
  clearMoveRatings(rootNode);
  updateMoveHistory();
  renderGameReview();
  if (reviewRequested) {
    analyzeGamePositions();
  } else {
    pendingFens.push(game.fen());
    if (activeFen && !stopRequested) {
      stopRequested = true;
      stockfishWorker.postMessage('stop');
    } else {
      startPendingAnalysis();
    }
  }
});

document.getElementById('analyze-game-button').addEventListener('click', analyzeGamePositions);

function handlePromotion(move) {
  promotionChoice.value = 'q';
  promotionDialog.showModal();
  promotionChoice.focus();
  return new Promise((resolve) => {
    promotionDialog.addEventListener('close', () => {
      resolve(promotionDialog.returnValue === 'promote'
        ? { ...move, promotion: promotionChoice.value }
        : null);
    }, { once: true });
  });
}

function resetGame() {
  replaceGame(new Chess(), 'New game started.');
}

document.getElementById('reset-button').addEventListener('click', resetGame);

initializeAccount();
createChessBoard();
renderBoard();
startEngine();
void loadOpeningBook().then(() => {
  updateMoveHistory();
  renderGameLibrary();
}).catch((error) => {
  openingNotation.querySelector('strong').textContent = 'Opening data unavailable';
  loadStatus.textContent = `Opening database could not be loaded: ${error.message}`;
  console.error('Could not load the opening database.', error);
});
