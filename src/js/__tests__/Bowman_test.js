import Bowman from '../characters/Bowman';

test('checking the correctness of Bowman characteristics ', () => {
  const char = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'bowman',
  };
  const bowman = new Bowman(1);
  expect(bowman).toEqual(char);
});
