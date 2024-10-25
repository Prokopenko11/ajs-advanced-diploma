export function calcTileType(index, boardSize) {
  let tileType;

  if (index === 0) {
    tileType = 'top-left';
  } else if (index === boardSize - 1) {
    tileType = 'top-right';
  } else if (index > 0 && index < boardSize) {
    tileType = 'top';
  } else if (index === (boardSize * (boardSize - 1))) {
    tileType = 'bottom-left';
  } else if (index % boardSize === 0) {
    tileType = 'left';
  } else if (index === (boardSize ** 2 - 1)) {
    tileType = 'bottom-right';
  } else if ((index + 1) % boardSize === 0) {
    tileType = 'right';
  } else if (index > (boardSize * (boardSize - 1)) && (index < (boardSize ** 2 - 1))) {
    tileType = 'bottom';
  } else {
    tileType = 'center';
  }

  return tileType;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
