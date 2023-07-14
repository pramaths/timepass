exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      // User is authenticated
      return next();
    } else {
      // User is not authenticated
      res.sendStatus(401);
    }
  };
  