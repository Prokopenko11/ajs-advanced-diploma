import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (1) {
    const RandomClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const randomLevel = Math.floor(Math.random() * maxLevel) + 1;
    yield new RandomClass(randomLevel);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  const generator = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    team.push(generator.next().value);
  }

  return new Team(team);
}
