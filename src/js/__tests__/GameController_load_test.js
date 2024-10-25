import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';

jest.mock('../GamePlay', () => ({
  showError: jest.fn(),
}));

const storageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
const gameStateService = new GameStateService(storageMock);

test('should load data successfully', () => {
  const savedState = { currentStep: 'player' };
  storageMock.getItem.mockReturnValue(JSON.stringify(savedState));

  const result = gameStateService.load();

  expect(storageMock.getItem).toHaveBeenCalledWith('state');
  expect(result).toEqual(savedState);
});

test('should show error and start new game if loading fails', () => {
  storageMock.getItem.mockImplementation(() => {
    throw new Error('Loading failed');
  });

  const loadGame = () => {
    try {
      gameStateService.load();
    } catch (e) {
      GamePlay.showError('Не удалось загрузить сохраненную игру!');
    }
  };

  loadGame();
  expect(GamePlay.showError).toHaveBeenCalledWith('Не удалось загрузить сохраненную игру!');
});
