const { MoleculerError } = require("moleculer").Errors;
module.exports = {
  error: ({ type, message, code = 500, data = {} }) => {
    try {
      return new MoleculerError(message, code, type, data);
    } catch (e) {
      return new MoleculerError("Unknown", code, "Unknown", data);
    }
  },
  success: ({ result }) => {
    try {
      return {
        status: true,
        result
      }
    } catch (e) {
      return new MoleculerError("Unknown", code, "Unknown", data);
    }
  },
}