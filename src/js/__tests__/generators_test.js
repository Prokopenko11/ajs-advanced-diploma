import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

test('testing characterGenerator function', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;

  const generator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < 100; i += 1) {
    const character = generator.next().value;
    expect(character instanceof Bowman
      || character instanceof Swordsman
      || character instanceof Magician).toBe(true);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(maxLevel);
  }
});

test('testing generateTeam function', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 4;
  const characterCount = 3;

  const team = generateTeam(allowedTypes, maxLevel, characterCount);

  expect(team.characters.length).toBe(characterCount);

  team.characters.forEach((character) => {
    expect(character instanceof Bowman
      || character instanceof Swordsman
      || character instanceof Magician).toBe(true);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(maxLevel);
  });
});
