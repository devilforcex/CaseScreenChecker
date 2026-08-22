import { normalizeQuery } from '../utils/modelSearch';
import type { PhoneModel } from '../types';

export interface PriorityCatalogCandidate {
  brand: string;
  name: string;
  fullName: string;
  aliases: string[];
  releaseYear: number;
  coverage: 'current' | 'legacy';
}

const candidate = (
  brand: string,
  name: string,
  releaseYear: number,
  aliases: string[] = [],
): PriorityCatalogCandidate => ({
  brand,
  name,
  fullName: `${brand} ${name}`,
  aliases,
  releaseYear,
  coverage: releaseYear >= 2020 ? 'current' : 'legacy',
});

/**
 * High-frequency models to recognise at the counter in Bulgaria.
 *
 * These are intentionally search candidates, not specifications or compatibility
 * claims. A candidate becomes a usable catalog model only after staff review has
 * added its source data and measured screen geometry.
 */
export const PRIORITY_CATALOG: readonly PriorityCatalogCandidate[] = [
  // Apple — long-lived second-hand devices remain frequent at Bulgarian counters.
  candidate('Apple', 'iPhone 7', 2016, ['A1660', 'A1778']),
  candidate('Apple', 'iPhone 8', 2017, ['A1863', 'A1905']),
  candidate('Apple', 'iPhone X', 2017, ['A1865', 'A1901']),
  candidate('Apple', 'iPhone XR', 2018, ['A1984', 'A2105']),
  candidate('Apple', 'iPhone SE (2020)', 2020, ['A2275', 'iPhone12,8']),
  candidate('Apple', 'iPhone 11', 2019, ['A2221', 'iPhone12,1']),
  candidate('Apple', 'iPhone 11 Pro', 2019, ['A2215', 'iPhone12,3']),
  candidate('Apple', 'iPhone 11 Pro Max', 2019, ['A2220', 'iPhone12,5']),
  candidate('Apple', 'iPhone 12 mini', 2020, ['A2399', 'iPhone13,1']),
  candidate('Apple', 'iPhone 12', 2020, ['A2403', 'iPhone13,2']),
  candidate('Apple', 'iPhone 12 Pro', 2020, ['A2407', 'iPhone13,3']),
  candidate('Apple', 'iPhone 12 Pro Max', 2020, ['A2411', 'iPhone13,4']),
  candidate('Apple', 'iPhone 13 mini', 2021, ['A2628', 'iPhone14,4']),
  candidate('Apple', 'iPhone 13 Pro', 2021, ['A2638', 'iPhone14,2']),
  candidate('Apple', 'iPhone 13 Pro Max', 2021, ['A2643', 'iPhone14,3']),
  candidate('Apple', 'iPhone SE (2022)', 2022, ['A2783', 'iPhone14,6']),
  candidate('Apple', 'iPhone 14 Plus', 2022, ['A2886', 'iPhone14,8']),
  candidate('Apple', 'iPhone 14 Pro', 2022, ['A2890', 'iPhone15,2']),
  candidate('Apple', 'iPhone 14 Pro Max', 2022, ['A2894', 'iPhone15,3']),
  candidate('Apple', 'iPhone 15 Plus', 2023, ['A3094', 'iPhone15,5']),
  candidate('Apple', 'iPhone 15 Pro Max', 2023, ['A3106', 'iPhone16,2']),
  candidate('Apple', 'iPhone 16', 2024, ['A3287', 'iPhone17,3']),
  candidate('Apple', 'iPhone 16 Plus', 2024, ['A3290', 'iPhone17,4']),
  candidate('Apple', 'iPhone 16 Pro', 2024, ['A3293', 'iPhone17,1']),
  candidate('Apple', 'iPhone 16 Pro Max', 2024, ['A3296', 'iPhone17,2']),

  // Samsung — A-series dominates affordable new and used devices.
  candidate('Samsung', 'Galaxy A02s', 2020, ['SM-A025F']),
  candidate('Samsung', 'Galaxy A03', 2021, ['SM-A035F']),
  candidate('Samsung', 'Galaxy A03s', 2021, ['SM-A037F']),
  candidate('Samsung', 'Galaxy A12', 2020, ['SM-A125F']),
  candidate('Samsung', 'Galaxy A13 4G', 2022, ['SM-A135F']),
  candidate('Samsung', 'Galaxy A13 5G', 2021, ['SM-A136B']),
  candidate('Samsung', 'Galaxy A16 4G', 2024, ['SM-A165F']),
  candidate('Samsung', 'Galaxy A16 5G', 2024, ['SM-A166B']),
  candidate('Samsung', 'Galaxy A20e', 2019, ['SM-A202F']),
  candidate('Samsung', 'Galaxy A21s', 2020, ['SM-A217F']),
  candidate('Samsung', 'Galaxy A22 4G', 2021, ['SM-A225F']),
  candidate('Samsung', 'Galaxy A22 5G', 2021, ['SM-A226B']),
  candidate('Samsung', 'Galaxy A23 4G', 2022, ['SM-A235F']),
  candidate('Samsung', 'Galaxy A24', 2023, ['SM-A245F']),
  candidate('Samsung', 'Galaxy A26 5G', 2025, ['SM-A266B']),
  candidate('Samsung', 'Galaxy A32 4G', 2021, ['SM-A325F']),
  candidate('Samsung', 'Galaxy A32 5G', 2021, ['SM-A326B']),
  candidate('Samsung', 'Galaxy A33 5G', 2022, ['SM-A336B']),
  candidate('Samsung', 'Galaxy A34 5G', 2023, ['SM-A346B']),
  candidate('Samsung', 'Galaxy A36 5G', 2025, ['SM-A366B']),
  candidate('Samsung', 'Galaxy A52', 2021, ['SM-A525F']),
  candidate('Samsung', 'Galaxy A52s 5G', 2021, ['SM-A528B']),
  candidate('Samsung', 'Galaxy A53 5G', 2022, ['SM-A536B']),
  candidate('Samsung', 'Galaxy A54 5G', 2023, ['SM-A546B']),
  candidate('Samsung', 'Galaxy A56 5G', 2025, ['SM-A566B']),
  candidate('Samsung', 'Galaxy M12', 2021, ['SM-M127F']),
  candidate('Samsung', 'Galaxy M13', 2022, ['SM-M135F']),
  candidate('Samsung', 'Galaxy M14 5G', 2023, ['SM-M146B']),
  candidate('Samsung', 'Galaxy S20 FE', 2020, ['SM-G780F']),
  candidate('Samsung', 'Galaxy S21 FE 5G', 2022, ['SM-G990B']),
  candidate('Samsung', 'Galaxy S22', 2022, ['SM-S901B']),
  candidate('Samsung', 'Galaxy S22 Ultra', 2022, ['SM-S908B']),
  candidate('Samsung', 'Galaxy S23 FE', 2023, ['SM-S711B']),
  candidate('Samsung', 'Galaxy S24 FE', 2024, ['SM-S721B']),
  candidate('Samsung', 'Galaxy S25', 2025, ['SM-S931B']),
  candidate('Samsung', 'Galaxy S25 Ultra', 2025, ['SM-S938B']),

  // Xiaomi family — retain the commercial family in the full label for disambiguation.
  candidate('Xiaomi', 'Redmi 9A', 2020, ['M2006C3LG']),
  candidate('Xiaomi', 'Redmi 9C', 2020, ['M2006C3MG']),
  candidate('Xiaomi', 'Redmi 10', 2021, ['21061119AG']),
  candidate('Xiaomi', 'Redmi 12', 2023, ['23053RN02A']),
  candidate('Xiaomi', 'Redmi 13', 2024, ['24049RN28G']),
  candidate('Xiaomi', 'Redmi 14C', 2024, ['2409BRN2CA']),
  candidate('Xiaomi', 'Redmi Note 9', 2020, ['M2003J15SG']),
  candidate('Xiaomi', 'Redmi Note 10', 2021, ['M2101K7AG']),
  candidate('Xiaomi', 'Redmi Note 10 Pro', 2021, ['M2101K6G']),
  candidate('Xiaomi', 'Redmi Note 11', 2022, ['2201117TG']),
  candidate('Xiaomi', 'Redmi Note 11 Pro 5G', 2022, ['2201116SG']),
  candidate('Xiaomi', 'Redmi Note 12 4G', 2023, ['23021RAAEG']),
  candidate('Xiaomi', 'Redmi Note 12 Pro 5G', 2022, ['22101316G']),
  candidate('Xiaomi', 'Redmi Note 13 Pro 4G', 2024, ['23117RA68G']),
  candidate('Xiaomi', 'Redmi Note 13 Pro 5G', 2024, ['2312DRA50G']),
  candidate('Xiaomi', 'Redmi Note 14 4G', 2025, ['24117RN76E']),
  candidate('Xiaomi', 'Redmi Note 14 Pro 5G', 2025, ['24116RACCG']),
  candidate('Xiaomi', 'POCO C40', 2022, ['220333QPG']),
  candidate('Xiaomi', 'POCO C75', 2024, ['2410FPCC5G']),
  candidate('Xiaomi', 'POCO M3', 2020, ['M2010J19CG']),
  candidate('Xiaomi', 'POCO M4 Pro 4G', 2022, ['2201117PG']),
  candidate('Xiaomi', 'POCO M5', 2022, ['22071219CG']),
  candidate('Xiaomi', 'POCO M6 Pro', 2024, ['2312FPCA6G']),
  candidate('Xiaomi', 'POCO X3 NFC', 2020, ['M2007J20CG']),
  candidate('Xiaomi', 'POCO X4 Pro 5G', 2022, ['2201116PG']),
  candidate('Xiaomi', 'POCO X5 5G', 2023, ['22111317PG']),
  candidate('Xiaomi', 'POCO X5 Pro 5G', 2023, ['22101320G']),
  candidate('Xiaomi', 'POCO X7 Pro', 2025, ['2412DPC0AG']),

  // The other common budget and second-hand families.
  candidate('Motorola', 'Moto E13', 2023, ['XT2345']),
  candidate('Motorola', 'Moto E14', 2024, ['XT2421']),
  candidate('Motorola', 'Moto G20', 2021, ['XT2128']),
  candidate('Motorola', 'Moto G22', 2022, ['XT2231']),
  candidate('Motorola', 'Moto G23', 2023, ['XT2333']),
  candidate('Motorola', 'Moto G31', 2021, ['XT2173']),
  candidate('Motorola', 'Moto G32', 2022, ['XT2235']),
  candidate('Motorola', 'Moto G34 5G', 2024, ['XT2363']),
  candidate('Motorola', 'Moto G54 5G', 2023, ['XT2343']),
  candidate('Motorola', 'Moto G55 5G', 2024, ['XT2435']),
  candidate('Motorola', 'Moto G84 5G', 2023, ['XT2347']),
  candidate('Motorola', 'Moto G85 5G', 2024, ['XT2427']),
  candidate('Huawei', 'P30 Lite', 2019, ['MAR-LX1A']),
  candidate('Huawei', 'P40 Lite', 2020, ['JNY-LX1']),
  candidate('Huawei', 'P Smart 2019', 2018, ['POT-LX1']),
  candidate('Huawei', 'P Smart 2021', 2020, ['PPA-LX2']),
  candidate('Huawei', 'nova 9', 2021, ['NAM-LX9']),
  candidate('Huawei', 'nova 10 SE', 2022, ['BNE-LX1']),
  candidate('Honor', 'X6', 2022, ['VNE-LX1']),
  candidate('Honor', 'X7', 2022, ['CMA-LX1']),
  candidate('Honor', 'X8', 2022, ['TFY-LX1']),
  candidate('Honor', 'X8b', 2024, ['LLY-LX1']),
  candidate('Honor', 'X9b 5G', 2023, ['ALI-NX1']),
  candidate('Honor', '90 Lite', 2023, ['CRT-NX1']),
  candidate('Honor', '200 Lite', 2024, ['LLY-NX1']),
  candidate('realme', 'C33', 2022, ['RMX3627']),
  candidate('realme', 'C35', 2022, ['RMX3511']),
  candidate('realme', 'C53', 2023, ['RMX3760']),
  candidate('realme', 'C55', 2023, ['RMX3710']),
  candidate('realme', 'C61', 2024, ['RMX3930']),
  candidate('realme', 'C63', 2024, ['RMX3939']),
  candidate('realme', '8i', 2021, ['RMX3151']),
  candidate('realme', '10', 2022, ['RMX3630']),
  candidate('Google', 'Pixel 6a', 2022, ['GX7AS']),
  candidate('Google', 'Pixel 7', 2022, ['GVU6C']),
  candidate('Google', 'Pixel 8a', 2024, ['GKV4X']),
  candidate('Google', 'Pixel 9', 2024, ['GRY0E']),
  candidate('Google', 'Pixel 9a', 2025, ['GTF7P']),
];

function scoreCandidate(candidateToScore: PriorityCatalogCandidate, query: string): number {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return 0;
  const candidateFields = [candidateToScore.fullName, candidateToScore.name, candidateToScore.brand, ...candidateToScore.aliases]
    .map(normalizeQuery)
    .filter(Boolean);
  if (candidateFields.some((field) => field === normalizedQuery)) return 100;
  if (candidateFields.some((field) => field.startsWith(normalizedQuery))) return 90;

  const queryTokens = normalizedQuery.split(' ');
  const bestTokenScore = candidateFields.reduce((best, field) => {
    const tokens = field.split(' ');
    const matched = queryTokens.filter((queryToken) => tokens.some((token) => token.startsWith(queryToken) || queryToken.startsWith(token))).length;
    return Math.max(best, matched / queryTokens.length);
  }, 0);
  return bestTokenScore >= 1 ? 70 : 0;
}

/** Return absent, recognisable models without pretending that their specifications exist. */
export function findPriorityCatalogCandidates(query: string, models: PhoneModel[], limit = 5): PriorityCatalogCandidate[] {
  const presentNames = new Set(models.flatMap((model) => [model.fullName, model.name, ...model.aliases]).map(normalizeQuery));
  return PRIORITY_CATALOG
    .map((item) => ({ item, score: scoreCandidate(item, query) }))
    .filter(({ item, score }) => score >= 70 && !presentNames.has(normalizeQuery(item.fullName)))
    .sort((a, b) => b.score - a.score || b.item.releaseYear - a.item.releaseYear || a.item.fullName.localeCompare(b.item.fullName))
    .slice(0, limit)
    .map(({ item }) => item);
}
