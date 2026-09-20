const rapidApiAuth = (req, res, next) => {
  // En mode développement local, on peut autoriser le passage sans vérification
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const proxySecret = req.headers['x-rapidapi-proxy-secret'];

  if (!proxySecret || proxySecret !== process.env.RAPIDAPI_PROXY_SECRET) {
    return res.status(401).json({
      status: 'fail',
      message: 'Accès non autorisé : Requête invalide ou contournement de RapidAPI détecté.'
    });
  }

  next();
};

module.exports = rapidApiAuth;