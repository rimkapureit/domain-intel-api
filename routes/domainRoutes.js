const express = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const rapidApiAuth = require('../middlewares/rapidApiAuth');
const { enrichDomain } = require('../services/domainService');
const { getCachedDomain, setCachedDomain } = require('../services/cacheService');

const router = express.Router();

const domainSchema = z.object({
  domain: z.string().trim().min(3, "Le domaine est requis").regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    "Format de nom de domaine invalide (ex: example.com)"
  )
});

// Le middleware rapidApiAuth est inséré ici
router.post('/enrich/domain', rapidApiAuth, validate(domainSchema), async (req, res, next) => {
  try {
    const { domain } = req.body;
    const cleanDomain = domain.toLowerCase();

    // 1. Vérification du cache
    const cachedData = await getCachedDomain(cleanDomain);
    if (cachedData) {
      return res.json({
        cached: true,
        data: cachedData
      });
    }

    // 2. Scraping et Enrichissement
    const enrichedData = await enrichDomain(cleanDomain);

    // 3. Sauvegarde en cache
    await setCachedDomain(cleanDomain, enrichedData);

    return res.json({
      cached: false,
      data: enrichedData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;