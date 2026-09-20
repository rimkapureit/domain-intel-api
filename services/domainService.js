const dns = require('dns').promises;
const axios = require('axios');
const cheerio = require('cheerio');

async function enrichDomain(domain) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();

  const results = {
    domain: cleanDomain,
    status: 'active',
    processedAt: new Date().toISOString(),
    branding: {
      title: null,
      description: null,
      favicon: null,
      logo: null
    },
    socials: {
      twitter: null,
      linkedin: null,
      github: null,
      facebook: null
    },
    security: {
      hasMxRecords: false,
      hasSsl: false
    }
  };

  // 1. Vérification DNS MX
  try {
    const mxRecords = await dns.resolveMx(cleanDomain);
    results.security.hasMxRecords = Boolean(mxRecords && mxRecords.length > 0);
  } catch (error) {
    results.security.hasMxRecords = false;
  }

  // 2. Scraping HTML
  const targetUrl = `https://${cleanDomain}`;
  try {
    const response = await axios.get(targetUrl, {
      timeout: 4000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) DomainIntelBot/1.0'
      }
    });

    results.security.hasSsl = true;
    const $ = cheerio.load(response.data);

    results.branding.title = 
      $('meta[property="og:title"]').attr('content') || 
      $('title').text().trim() || 
      null;

    results.branding.description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      null;

    results.branding.logo = 
      $('meta[property="og:image"]').attr('content') || null;

    const faviconHref = $('link[rel*="icon"]').attr('href');
    if (faviconHref) {
      if (faviconHref.startsWith('http')) {
        results.branding.favicon = faviconHref;
      } else {
        results.branding.favicon = `${targetUrl}${faviconHref.startsWith('/') ? '' : '/'}${faviconHref}`;
      }
    } else {
      results.branding.favicon = `${targetUrl}/favicon.ico`;
    }

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      if (!results.socials.twitter && (href.includes('twitter.com/') || href.includes('x.com/'))) {
        results.socials.twitter = href;
      }
      if (!results.socials.linkedin && href.includes('linkedin.com/')) {
        results.socials.linkedin = href;
      }
      if (!results.socials.github && href.includes('github.com/')) {
        results.socials.github = href;
      }
      if (!results.socials.facebook && href.includes('facebook.com/')) {
        results.socials.facebook = href;
      }
    });

  } catch (error) {
    results.security.hasSsl = false;
    results.status = 'unreachable';
  }

  return results;
}

// L'exportation DOIT correspondre exactement à { enrichDomain }
module.exports = { enrichDomain };