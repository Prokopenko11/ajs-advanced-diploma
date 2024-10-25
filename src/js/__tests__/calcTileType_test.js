import { calcTileType } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [3, 4, 'top-right'],
  [12, 4, 'bottom-left'],
  [48, 7, 'bottom-right'],
  [1, 6, 'top'],
  [8, 8, 'left'],
  [7, 4, 'right'],
  [23, 5, 'bottom'],
  [10, 4, 'center'],
])(
  ('should calculate tileTipe with %s index and %i boardsize'),
  (index, boardsize, expected) => {
    const result = calcTileType(index, boardsize);
    expect(result).toBe(expected);
  },
);
