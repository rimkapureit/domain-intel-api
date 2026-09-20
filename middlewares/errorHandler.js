const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = null;

  if (err.name === 'ZodError' || err.issues) {
    statusCode = 400;
    message = 'Données de requête invalides';
    const issuesList = err.issues || err.errors || [];
    errors = issuesList.map(issue => ({
      field: issue.path ? issue.path.join('.') : 'domain',
      message: issue.message
    }));
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(errors && { errors })
  });
};

module.exports = errorHandler;