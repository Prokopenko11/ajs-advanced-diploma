import themes from './themes';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import cursors from './cursors';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState(1, [], []);
  }

  init() {
    this.level = 1;
    this.gamePlay.drawUi(themes[this.level]);
    this.characterCount = 2;

    this.playerTeam = [Bowman, Swordsman, Magician];
    this.enemyTeam = [Daemon, Undead, Vampire];
    this.selectedPlayerIndex = null;
    this.selectedEmptyIndexes = [];
    this.selectedEnemyIndexes = [];

    const generatedPlayerTeam = this.generatePositions(this.playerTeam, 1, 2, this.characterCount);
    const generatedEnemyTeam = this.generatePositions(
      this.enemyTeam,
      this.gamePlay.boardSize - 1,
      this.gamePlay.boardSize,
      this.characterCount,
    );

    this.enemyCharacters = [...generatedEnemyTeam];
    this.playerCharacters = [...generatedPlayerTeam];
    this.allPositions = [...generatedPlayerTeam, ...generatedEnemyTeam];
    this.gamePlay.redrawPositions(this.allPositions);

    this.gamePlay.addNewGameListener(this.startNewGame.bind(this));

    this.blockGameField(false);

    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(() => {
      try {
        const savedState = this.stateService.load();
        if (savedState) {
          this.loadGame(savedState);
        }
      } catch (e) {
        GamePlay.showError('Не удалось загрузить сохраненную игру!');
        this.startNewGame();
      }
    });
  }

  addEventListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.setCursor(cursors.auto);
  }

  startNewGame() {
    this.blockGameField(true);
    this.init();
  }

  generatePositions(playerTypes, minCol, maxCol, characterCount) {
    const positions = new Set();
    const positionedCharacters = [];
    const maxLevel = this.level;

    const team = generateTeam(playerTypes, maxLevel, characterCount);

    for (const character of team.characters) {
      let position;
      do {
        const row = Math.floor(Math.random() * this.gamePlay.boardSize);
        const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;
        position = row * this.gamePlay.boardSize + col - 1;
      } while (positions.has(position));

      positions.add(position);
      positionedCharacters.push(new PositionedCharacter(character, position));
    }

    return positionedCharacters;
  }

  onCellClick(index) {
    for (const positionedCharacter of this.allPositions) {
      if (index === positionedCharacter.position && this.playerTeam.some((type) => positionedCharacter.character instanceof type)) {
        for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
          this.gamePlay.deselectCell(i);
        }

        this.gamePlay.selectCell(index, 'yellow');
        this.selectedPlayer = positionedCharacter;
        this.selectedPlayerType = positionedCharacter.character.type;
        this.selectedPlayerIndex = index;
        break;
      }
    }

    if (this.selectedPlayerIndex === null) {
      GamePlay.showError('Выберите персонажа своей команды!');
    }

    if (this.selectedPlayerIndex !== null && this.isInRange(this.selectedPlayerType, this.selectedPlayerIndex, index) && this.cellIsEmpty(index)) {
      this.selectedPlayer.position = index;
      for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
        this.gamePlay.deselectCell(i);
      }

      this.gamePlay.redrawPositions(this.allPositions);
      this.gamePlay.selectCell(index, 'yellow');
      this.selectedPlayerIndex = null;

      if (this.enemyCharacters.length > 0) {
        this.gameState.changeStep();
        this.attackByEnemy();
      } else {
        this.levelUp();
      }
    }

    if (this.selectedPlayerIndex !== null && this.checkAtackAbility(this.selectedPlayerType, this.selectedPlayerIndex, index) && this.checkEnemyPosition(index) === index) {
      const attacker = this.selectedPlayer.character;
      const target = this.checkEnemyType(index).character;
      const damage = Math.max(attacker.attack - target.defence, Math.round(attacker.attack * 0.1));

      this.gamePlay.deselectCell(this.selectedPlayerIndex);
      this.selectedPlayerIndex = null;

      this.gamePlay.showDamage(index, damage).then(() => {
        target.health -= damage;

        if (target.health <= 0) {
          this.allPositions = this.allPositions.filter((pos) => pos !== this.checkEnemyType(index));
          this.enemyCharacters = this.enemyCharacters.filter((enemy) => enemy !== this.checkEnemyType(index));
        }

        if (this.enemyCharacters.length > 0) {
          this.gamePlay.redrawPositions(this.allPositions);
          this.gameState.changeStep();
          this.attackByEnemy();
        } else {
          this.levelUp();
        }
      });
    } else if (this.selectedPlayerIndex !== null && !this.checkAtackAbility(this.selectedPlayerType, this.selectedPlayerIndex, index) && this.checkEnemyPosition(index) === index) {
      GamePlay.showError('Враг слишком далеко!');
    }
  }

  createTooltip(character) {
    return `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
  }

  onCellEnter(index) {
    this.selectedEmptyIndexes.forEach((selectedIndex) => {
      this.gamePlay.deselectCell(selectedIndex);
    });
    this.selectedEmptyIndexes = [];

    this.selectedEnemyIndexes.forEach((selectedIndex) => {
      this.gamePlay.deselectCell(selectedIndex);
    });
    this.selectedEnemyIndexes = [];

    if (this.selectedPlayerIndex !== null && this.isInRange(this.selectedPlayerType, this.selectedPlayerIndex, index) && this.cellIsEmpty(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.selectedEmptyIndexes.push(index);
      this.gamePlay.selectCell(index, 'green');
    } else if (this.selectedPlayerIndex === null || (this.cellIsEmpty(index) && !this.isInRange(this.selectedPlayerType, this.selectedPlayerIndex, index))) {
      this.gamePlay.setCursor(cursors.notallowed);
    }

    for (const positionedCharacter of this.allPositions) {
      if (index === positionedCharacter.position && this.playerTeam.some((type) => positionedCharacter.character instanceof type)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.showCellTooltip(this.createTooltip(positionedCharacter.character), index);
      } else if (index === positionedCharacter.position && this.enemyTeam.some((type) => positionedCharacter.character instanceof type)) {
        this.gamePlay.showCellTooltip(this.createTooltip(positionedCharacter.character), index);

        if (this.checkAtackAbility(this.selectedPlayerType, this.selectedPlayerIndex, index)) {
          this.selectedEnemyIndexes.push(index);
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getRangeForAction(attacker, actionType) {
    const movementRanges = {
      swordsman: 4,
      undead: 4,
      bowman: 2,
      vampire: 2,
      magician: 1,
      daemon: 1,
    };

    const attackRanges = {
      swordsman: 1,
      undead: 1,
      bowman: 2,
      vampire: 2,
      magician: 4,
      daemon: 4,
    };

    let range = 0;
    if (actionType === 'move') {
      range = movementRanges[attacker];
    } else if (actionType === 'attack') {
      range = attackRanges[attacker];
    }

    return range;
  }

  calculatePosition(playerIndex, targetIndex) {
    return {
      playerRow: Math.floor(playerIndex / this.gamePlay.boardSize),
      targetRow: Math.floor(targetIndex / this.gamePlay.boardSize),
      playerColumn: playerIndex % this.gamePlay.boardSize,
      targetColumn: targetIndex % this.gamePlay.boardSize,
    };
  }

  isInRange(attacker, attackerPosition, index) {
    const position = this.calculatePosition(attackerPosition, index);
    const range = this.getRangeForAction(attacker, 'move');
    let value = false;

    if (position.targetRow >= position.playerRow - range
      && position.targetRow <= position.playerRow + range
      && position.targetColumn <= position.playerColumn + range
      && position.targetColumn >= position.playerColumn - range) {
      value = true;
    }

    return value;
  }

  checkAtackAbility(attacker, attackerPosition, targetPosition) {
    const position = this.calculatePosition(attackerPosition, targetPosition);
    const range = this.getRangeForAction(attacker, 'attack');
    let value = false;

    if (position.targetRow >= position.playerRow - range
      && position.targetRow <= position.playerRow + range
      && position.targetColumn <= position.playerColumn + range
      && position.targetColumn >= position.playerColumn - range) {
      value = true;
    }

    return value;
  }

  cellIsEmpty(index) {
    const positions = [];
    this.allPositions.forEach((position) => {
      positions.push(position.position);
    });

    return (!positions.includes(index));
  }

  checkEnemyType(index) {
    let value = null;
    this.enemyCharacters.forEach((character) => {
      if (character.position === index) {
        value = character;
      }
    });

    return value;
  }

  checkEnemyPosition(index) {
    let value = null;

    this.enemyCharacters.forEach((character) => {
      if (character.position === index) {
        value = index;
      }
    });

    return value;
  }

  moveEnemyTowardsTarget(attacker, targetPosition) {
    const enemy = this.enemyCharacters[0];
    const moveRange = this.getRangeForAction(attacker, 'move');
    const possiblePositions = this.getMovementRange(enemy.position, moveRange);
    let bestPosition = enemy.position;
    let minDistance = Infinity;

    possiblePositions.forEach((position) => {
      const distance = this.calculateDistance(position, targetPosition);
      if (distance < minDistance) {
        minDistance = distance;
        bestPosition = position;
      }
    });

    enemy.position = bestPosition;
    this.gamePlay.redrawPositions(this.allPositions);
  }

  getMovementRange(position, range) {
    const positions = [];
    const { boardSize } = this.gamePlay;

    for (let rowOffset = -range; rowOffset <= range; rowOffset += 1) {
      for (let colOffset = -range; colOffset <= range; colOffset += 1) {
        const currentRow = Math.floor(position / boardSize);
        const currentCol = position % boardSize;

        const newRow = currentRow + rowOffset;
        const newCol = currentCol + colOffset;

        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          const newPosition = newRow * boardSize + newCol;
          if (this.cellIsEmpty(newPosition)) {
            positions.push(newPosition);
          }
        }
      }
    }
    return positions;
  }

  calculateDistance(pos1, pos2) {
    const { boardSize } = this.gamePlay;

    const row1 = Math.floor(pos1 / boardSize);
    const col1 = pos1 % boardSize;

    const row2 = Math.floor(pos2 / boardSize);
    const col2 = pos2 % boardSize;

    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  attackByEnemy() {
    if (this.gameState.getCurrentStep() === 'computer') {
      let weakestPlayerCharacter = null;
      this.playerCharacters.forEach((character) => {
        if (character.character.health > 0 && (!weakestPlayerCharacter || character.character.health < weakestPlayerCharacter.character.health)) {
          weakestPlayerCharacter = character;
        }
      });

      if (weakestPlayerCharacter) {
        let attacker = null;
        for (const enemy of this.enemyCharacters) {
          const enemyType = enemy.character.type;
          if (this.checkAtackAbility(enemyType, enemy.position, weakestPlayerCharacter.position)) {
            attacker = enemy;
            break;
          }
        }

        if (attacker) {
          const target = weakestPlayerCharacter.character;
          const damage = Math.max(attacker.character.attack - target.defence, Math.round(attacker.character.attack * 0.1));

          this.gamePlay.showDamage(weakestPlayerCharacter.position, damage).then(() => {
            target.health -= damage;

            if (target.health <= 0) {
              this.allPositions = this.allPositions.filter((pos) => pos !== weakestPlayerCharacter);
              this.playerCharacters = this.playerCharacters.filter((character) => character !== weakestPlayerCharacter);
            }

            this.gamePlay.redrawPositions(this.allPositions);

            if (this.playerCharacters.length > 0) {
              this.gameState.changeStep();
            } else {
              this.gameOver();
            }
          });
        } else {
          const enemyType = this.enemyCharacters[0].character.type;
          this.moveEnemyTowardsTarget(enemyType, weakestPlayerCharacter.position);
          this.gameState.changeStep();
        }
      }
    }
  }

  levelUp() {
    this.level += 1;
    if (this.level === 5) {
      this.gameOver();
    } else {
      this.characterCount += 1;
      this.gamePlay.drawUi(themes[this.level]);
      const servivedPlayerCharacters = this.playerCharacters;

      const generatedPlayerTeam = this.generatePositions(this.playerTeam, 1, 2, this.characterCount - servivedPlayerCharacters.length);
      const generatedEnemyTeam = this.generatePositions(
        this.enemyTeam,
        this.gamePlay.boardSize - 1,
        this.gamePlay.boardSize,
        this.characterCount,
      );

      const positions = new Set();
      for (const generatedPlayer of generatedPlayerTeam) {
        const { attack } = generatedPlayer.character;
        const { level } = generatedPlayer.character;
        generatedPlayer.character.attack += Math.round((level - 1) * 0.5 * attack);

        const { defence } = generatedPlayer.character;
        generatedPlayer.character.defence += Math.round((level - 1) * 0.5 * defence);

        positions.add(generatedPlayer.position);
      }

      for (const generatedEnemy of generatedEnemyTeam) {
        const { attack } = generatedEnemy.character;
        const { level } = generatedEnemy.character;
        generatedEnemy.character.attack += Math.round((level - 1) * 0.5 * attack);

        const { defence } = generatedEnemy.character;
        generatedEnemy.character.defence += Math.round((level - 1) * 0.5 * defence);
      }

      for (const playerCharacter of servivedPlayerCharacters) {
        let position;
        do {
          const row = Math.floor(Math.random() * this.gamePlay.boardSize);
          const col = Math.floor(Math.random() * 2) + 1;
          position = row * this.gamePlay.boardSize + col - 1;
        } while (positions.has(position));

        positions.add(position);
        playerCharacter.position = position;

        playerCharacter.character.level = this.level;
        const { attack } = playerCharacter.character;
        const { defence } = playerCharacter.character;

        playerCharacter.character.attack = Math.round(Math.max(attack, attack * ((80 + playerCharacter.character.health) / 100)));
        playerCharacter.character.defence = Math.round(Math.max(defence, defence * ((80 + playerCharacter.character.health) / 100)));

        playerCharacter.character.health += 80;
        if (playerCharacter.character.health > 100) {
          playerCharacter.character.health = 100;
        }
      }

      this.enemyCharacters = [...generatedEnemyTeam];
      this.playerCharacters = [...servivedPlayerCharacters, ...generatedPlayerTeam];
      this.allPositions = [...servivedPlayerCharacters, ...generatedPlayerTeam, ...generatedEnemyTeam];
      this.gamePlay.redrawPositions(this.allPositions);
    }
  }

  blockGameField(value) {
    if (value) {
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];

      for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
        this.gamePlay.deselectCell(i);
      }

      this.gamePlay.setCursor(cursors.notallowed);
    } else {
      this.addEventListeners();
    }
  }

  gameOver() {
    this.blockGameField(true);
    if (this.level === 5) {
      GamePlay.showMessage('Вы победили!');
    } else {
      GamePlay.showMessage('Вы проиграли!');
    }
  }

  saveGame() {
    const serializedCharacters = this.playerCharacters.map((character) => ({
      characterData: {
        type: character.character.constructor.name,
        ...character.character,
      },
      position: character.position,
    }));

    const serializedEnemirs = this.enemyCharacters.map((enemy) => ({
      characterData: {
        type: enemy.character.constructor.name,
        ...enemy.character,
      },
      position: enemy.position,
    }));

    const gameState = new GameState(this.level, serializedCharacters, serializedEnemirs);
    this.stateService.save(gameState);
  }

  loadGame(savedState) {
    this.level = savedState.level;

    this.playerCharacters = savedState.characters.map((savedCharacter) => {
      const CharacterClass = this.getClassByName(savedCharacter.characterData.type);
      const character = new CharacterClass(savedCharacter.characterData.level);
      Object.assign(character, savedCharacter.characterData);
      return new PositionedCharacter(character, savedCharacter.position);
    });

    this.enemyCharacters = savedState.enemies.map((savedEnemy) => {
      const EnemyClass = this.getClassByName(savedEnemy.characterData.type);
      const enemy = new EnemyClass(savedEnemy.characterData.level);
      Object.assign(enemy, savedEnemy.characterData);
      return new PositionedCharacter(enemy, savedEnemy.position);
    });

    this.selectedPlayerIndex = null;

    this.allPositions = [...this.playerCharacters, ...this.enemyCharacters];
    this.gamePlay.drawUi(themes[this.level]);
    this.gamePlay.redrawPositions(this.allPositions);
  }

  getClassByName(name) {
    const classes = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      daemon: Daemon,
      undead: Undead,
      vampire: Vampire,
    };

    return classes[name];
  }
}
