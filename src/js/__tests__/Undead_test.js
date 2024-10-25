import Undead from '../characters/Undead';

test('checking the correctness of Undead characteristics ', () => {
  const char = {
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'undead',
  };
  const undead = new Undead(1);
  expect(undead).toEqual(char);
});
