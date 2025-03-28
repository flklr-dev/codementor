/**
 * Level progression utility functions
 */

// Get XP required for a specific level
function getXpRequiredForLevel(level) {
  return 500 + (level * 500);
}

// Get total XP required to reach a level from the beginning
function getTotalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpRequiredForLevel(i);
  }
  return total;
}

// Calculate level and remaining XP from total XP
function calculateLevelFromXp(totalXp) {
  let level = 1;
  let xp = totalXp;
  
  while (xp >= getXpRequiredForLevel(level)) {
    xp -= getXpRequiredForLevel(level);
    level++;
  }
  
  return {
    level,
    xp,
    nextLevelXp: getXpRequiredForLevel(level)
  };
}

module.exports = {
  getXpRequiredForLevel,
  getTotalXpForLevel,
  calculateLevelFromXp
}; 