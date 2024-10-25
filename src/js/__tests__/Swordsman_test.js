import Swordsman from '../characters/Swordsman';

test('checking the correctness of Swordsman characteristics ', () => {
  const char = {
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'swordsman',
  };
  const swordsman = new Swordsman(1);
  expect(swordsman).toEqual(char);
});
