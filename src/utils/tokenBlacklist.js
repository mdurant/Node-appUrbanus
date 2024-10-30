const tokenBlacklist = new Set();

const addTokenToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

module.exports = { addTokenToBlacklist, isTokenBlacklisted };
