import Character from '../Character';
import Bowman from '../characters/Bowman';

/* eslint-disable no-new */
test('testing throwing an error when create an instance of Character', () => {
  expect(() => {
    new Character(1); // Пытаемся создать экземпляр Character
  }).toThrow('You cannot create an instance of Character directly');
});
/* eslint-enable no-new */

test('should not throw an error when create an instance of Bowman', () => {
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
