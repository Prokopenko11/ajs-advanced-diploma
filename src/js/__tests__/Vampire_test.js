import Vampire from '../characters/Vampire';

test('checking the correctness of Vampire characteristics ', () => {
  const char = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'vampire',
  };
  const vampire = new Vampire(1);
  expect(vampire).toEqual(char);
});
