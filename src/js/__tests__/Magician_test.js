import Magician from '../characters/Magician';

test('checking the correctness of Magician characteristics ', () => {
  const char = {
    level: 1,
    attack: 10,
    defence: 40,
    health: 50,
    type: 'magician',
  };
  const magician = new Magician(1);
  expect(magician).toEqual(char);
});
