import Daemon from '../characters/Daemon';

test('checking the correctness of Daemon characteristics ', () => {
  const char = {
    level: 1,
    attack: 10,
    defence: 10,
    health: 50,
    type: 'daemon',
  };
  const daemon = new Daemon(1);
  expect(daemon).toEqual(char);
});
