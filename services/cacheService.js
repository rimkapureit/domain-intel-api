const db = require('../config/database');

function getCachedDomain(domain) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT data, updated_at FROM domain_cache 
      WHERE domain = ? AND updated_at >= datetime('now', '-30 days')
    `;
    db.get(query, [domain], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(JSON.parse(row.data));
    });
  });
}

function setCachedDomain(domain, data) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO domain_cache (domain, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(domain) DO UPDATE SET 
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `;
    db.run(query, [domain, JSON.stringify(data)], function (err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = { getCachedDomain, setCachedDomain };