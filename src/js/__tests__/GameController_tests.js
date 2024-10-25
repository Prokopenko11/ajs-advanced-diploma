import GameController from '../GameController';
import GamePlay from '../GamePlay';

const gamePlay = new GamePlay();
gamePlay.boardSize = 8;

const gameController = new GameController(gamePlay);
gameController.selectedPlayerIndex = 0;

test.each([
  ['swordsman', 4],
  ['undead', 4],
  ['bowman', 2],
  ['vampire', 2],
  ['magician', 1],
  ['daemon', 1],
])(
  ('should return true with %s character and %i index'),
  (character, index) => {
    gameController.selectedPlayerType = character;
    expect(gameController.isInRange(character, gameController.selectedPlayerIndex, index)).toBe(true);
  },
);

test.each([
  ['swordsman', 1],
  ['undead', 1],
  ['bowman', 2],
  ['vampire', 2],
  ['magician', 4],
  ['daemon', 4],
])(
  ('should return true with %s character and %i index'),
  (character, index) => {
    gameController.selectedPlayerType = character;
    expect(gameController.checkAtackAbility(character, gameController.selectedPlayerIndex, index)).toBe(true);
  },
);
