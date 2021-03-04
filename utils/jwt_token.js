const jwt = require('jsonwebtoken');

module.exports = {
  signJwt: (data) => {
    try {
      return jwt.sign(data, process.env.GRADUATION_JWT_SECRET, {
        expiresIn: process.env.GRADUATION_JWT_EXPIRES_IN
      });
    } catch (e) {
      // TODO: rise error
      return 'Error';
    }
  },

  verifyJwt: async (token) => {
    try {
      const decoded = await jwt.verify(token, process.env.GRADUATION_JWT_SECRET);
      return decoded;
    } catch (e) {
      // TODO: rise error
      return 'Error';
    }
  }
}
