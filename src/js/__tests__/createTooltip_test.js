import GameController from '../GameController';

test('testing create tooltip method', () => {
  const character = {
    level: 2,
    attack: 30,
    defence: 20,
    health: 50,
  };
  const gameController = new GameController();
  const expectedTooltip = '\u{1F396}2 \u{2694}30 \u{1F6E1}20 \u{2764}50';
  const result = gameController.createTooltip(character);
  expect(result).toBe(expectedTooltip);
});
