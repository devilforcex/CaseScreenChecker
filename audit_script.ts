import { INITIAL_PHONE_MODELS, INITIAL_COMPATIBILITY_PAIRS } from './src/data/phoneDatabase';

const modelsCount = INITIAL_PHONE_MODELS.length;
let aliasCount = 0;
let modelNumbersCount = 0; // Assuming aliases are model numbers in some context, but we will count all aliases.
let duplicateDevices = 0;
let duplicateAliases = 0;

const seenIds = new Set();
const seenAliases = new Set();

INITIAL_PHONE_MODELS.forEach(m => {
  if (seenIds.has(m.id)) duplicateDevices++;
  seenIds.add(m.id);
  
  if (m.aliases) {
    aliasCount += m.aliases.length;
    m.aliases.forEach(a => {
      if (seenAliases.has(a)) duplicateAliases++;
      seenAliases.add(a);
    });
  }
});

const compatibilityCount = INITIAL_COMPATIBILITY_PAIRS.length;
let evidenceCount = 0;

INITIAL_COMPATIBILITY_PAIRS.forEach(p => {
  if (p.evidenceSources) {
    evidenceCount += p.evidenceSources.length;
  }
});

console.log(JSON.stringify({
  modelsCount,
  aliasCount,
  duplicateDevices,
  duplicateAliases,
  compatibilityCount,
  evidenceCount
}, null, 2));
