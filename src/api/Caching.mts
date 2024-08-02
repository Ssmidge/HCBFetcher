import nodeCache from 'node-cache';
const organizationCache = new nodeCache({ stdTTL: 600, checkperiod: 120 });
const transactionCache = new nodeCache({ stdTTL: 600, checkperiod: 120 });

export { organizationCache, transactionCache }; 