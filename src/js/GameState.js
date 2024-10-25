export default class GameState {
  constructor(level, characters, enemies) {
    this.currentStep = 'player';
    this.level = level;
    this.characters = characters;
    this.enemies = enemies;
  }

  static from(object) {
    const gameState = new GameState();
    gameState.currentStep = object.currentStep;
    return gameState;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  changeStep() {
    if (this.currentStep === 'player') {
      this.currentStep = 'computer';
    } else {
      this.currentStep = 'player';
    }
  }
}
