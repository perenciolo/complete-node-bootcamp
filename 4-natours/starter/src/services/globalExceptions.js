/**
 * Handle Global exceptions.
 *
 * @param {Object} err
 * @param {Object} server
 */
exports.handleExceptions = (err, server) => {
  console.error(err.name, err.message);
  // Shutting down gracefully the process given the error.
  if (server) {
    server.close(() => {
      return process.exit(1);
    });
  }
  process.exit(1);
};
