import { PhoneModel, CompatibilityPair } from '../types';

export const INITIAL_PHONE_MODELS: PhoneModel[] = [
  // --- SAMSUNG GALAXY A-SERIES ---
  {
    id: 'samsung-a05s',
    brand: 'Samsung',
    name: 'Galaxy A05s',
    fullName: 'Samsung Galaxy A05s',
    releaseYear: 2023,
    dimensions: { height: 168.0, width: 77.8, thickness: 8.8, weightG: 194 },
    screen: { diagonalIn: 6.7, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A057F', 'SM-A057M', 'Galaxy A05s 4G'],
    notes: 'Flat 6.7" PLS LCD with Infinity-U notch, triple vertical camera rings.'
  },
  {
    id: 'samsung-a05',
    brand: 'Samsung',
    name: 'Galaxy A05',
    fullName: 'Samsung Galaxy A05',
    releaseYear: 2023,
    dimensions: { height: 168.8, width: 78.2, thickness: 8.8, weightG: 195 },
    screen: { diagonalIn: 6.7, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 2, bumpHeightMm: 1.3, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'none', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A055F', 'Galaxy A05 4G'],
    notes: 'Dual camera rings. Screen glass active area is identical to A05s.'
  },
  {
    id: 'samsung-a04s',
    brand: 'Samsung',
    name: 'Galaxy A04s',
    fullName: 'Samsung Galaxy A04s',
    releaseYear: 2022,
    dimensions: { height: 164.7, width: 76.7, thickness: 9.1, weightG: 195 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A047F', 'Galaxy A04s'],
  },
  {
    id: 'samsung-a04',
    brand: 'Samsung',
    name: 'Galaxy A04',
    fullName: 'Samsung Galaxy A04',
    releaseYear: 2022,
    dimensions: { height: 164.4, width: 76.3, thickness: 9.1, weightG: 192 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 2, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'none', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A045F'],
  },
  {
    id: 'samsung-a15',
    brand: 'Samsung',
    name: 'Galaxy A15 4G/5G',
    fullName: 'Samsung Galaxy A15',
    releaseYear: 2023,
    dimensions: { height: 160.1, width: 76.8, thickness: 8.4, weightG: 200 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.2, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A155F', 'SM-A156B', 'Galaxy A15 5G', 'Galaxy A15 4G'],
    notes: 'Key Island design frame (raised button bump on right edge).'
  },
  {
    id: 'samsung-a25',
    brand: 'Samsung',
    name: 'Galaxy A25 5G',
    fullName: 'Samsung Galaxy A25 5G',
    releaseYear: 2023,
    dimensions: { height: 161.0, width: 76.5, thickness: 8.3, weightG: 197 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.3, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A256B', 'SM-A256E'],
    notes: 'Key Island design frame. Screen glass identical to A15.'
  },
  {
    id: 'samsung-a35',
    brand: 'Samsung',
    name: 'Galaxy A35 5G',
    fullName: 'Samsung Galaxy A35 5G',
    releaseYear: 2024,
    dimensions: { height: 161.7, width: 78.0, thickness: 8.2, weightG: 209 },
    screen: { diagonalIn: 6.6, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.3, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A356B', 'Galaxy A35'],
  },
  {
    id: 'samsung-a55',
    brand: 'Samsung',
    name: 'Galaxy A55 5G',
    fullName: 'Samsung Galaxy A55 5G',
    releaseYear: 2024,
    dimensions: { height: 161.1, width: 77.4, thickness: 8.2, weightG: 213 },
    screen: { diagonalIn: 6.6, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A556B', 'Galaxy A55'],
    notes: 'Metal frame with Key Island. Screen glass matches Galaxy A35.'
  },
  {
    id: 'samsung-a14-4g',
    brand: 'Samsung',
    name: 'Galaxy A14 4G',
    fullName: 'Samsung Galaxy A14 4G',
    releaseYear: 2023,
    dimensions: { height: 167.7, width: 78.0, thickness: 9.1, weightG: 201 },
    screen: { diagonalIn: 6.6, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A145F', 'SM-A145P'],
  },
  {
    id: 'samsung-a14-5g',
    brand: 'Samsung',
    name: 'Galaxy A14 5G',
    fullName: 'Samsung Galaxy A14 5G',
    releaseYear: 2023,
    dimensions: { height: 167.7, width: 78.0, thickness: 9.1, weightG: 202 },
    screen: { diagonalIn: 6.6, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.4, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-A146B', 'SM-A146P', 'SM-A146U'],
    notes: 'Identical dimensions to A14 4G; 100% case & screen protector interchangeability.'
  },

  // --- SAMSUNG GALAXY S-SERIES ---
  {
    id: 'samsung-s24',
    brand: 'Samsung',
    name: 'Galaxy S24',
    fullName: 'Samsung Galaxy S24',
    releaseYear: 2024,
    dimensions: { height: 147.0, width: 70.6, thickness: 7.6, weightG: 167 },
    screen: { diagonalIn: 6.2, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-S921B', 'SM-S921U'],
  },
  {
    id: 'samsung-s23',
    brand: 'Samsung',
    name: 'Galaxy S23',
    fullName: 'Samsung Galaxy S23',
    releaseYear: 2023,
    dimensions: { height: 146.3, width: 70.9, thickness: 7.6, weightG: 168 },
    screen: { diagonalIn: 6.1, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['SM-S911B', 'SM-S911U'],
  },

  // --- APPLE IPHONE SERIES ---
  {
    id: 'apple-iphone-13',
    brand: 'Apple',
    name: 'iPhone 13',
    fullName: 'Apple iPhone 13',
    releaseYear: 2021,
    dimensions: { height: 146.7, width: 71.5, thickness: 7.65, weightG: 174 },
    screen: { diagonalIn: 6.1, curvature: 'flat', notchType: 'wide_notch', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 2.5, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'none', portType: 'lightning', buttonLayout: 'power_right_vol_left' },
    aliases: ['A2633', 'A2482', 'iPhone14,5'],
  },
  {
    id: 'apple-iphone-14',
    brand: 'Apple',
    name: 'iPhone 14',
    fullName: 'Apple iPhone 14',
    releaseYear: 2022,
    dimensions: { height: 146.7, width: 71.5, thickness: 7.80, weightG: 172 },
    screen: { diagonalIn: 6.1, curvature: 'flat', notchType: 'wide_notch', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 2.8, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'none', portType: 'lightning', buttonLayout: 'power_right_vol_left' },
    aliases: ['A2882', 'A2649', 'iPhone14,7'],
    notes: 'Screen glass 100% matches iPhone 13. Case fits with slight 0.15mm depth variance.'
  },
  {
    id: 'apple-iphone-15',
    brand: 'Apple',
    name: 'iPhone 15',
    fullName: 'Apple iPhone 15',
    releaseYear: 2023,
    dimensions: { height: 147.6, width: 71.6, thickness: 7.80, weightG: 171 },
    screen: { diagonalIn: 6.1, curvature: '2.5d_curved_edge', notchType: 'dynamic_island', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 3.1, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'none', portType: 'usb_c', buttonLayout: 'power_right_vol_left' },
    aliases: ['A3090', 'A2846', 'iPhone15,4'],
    notes: 'Features Dynamic Island. Contoured 2.5D glass edges.'
  },
  {
    id: 'apple-iphone-15-pro',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    fullName: 'Apple iPhone 15 Pro',
    releaseYear: 2023,
    dimensions: { height: 146.6, width: 70.6, thickness: 8.25, weightG: 187 },
    screen: { diagonalIn: 6.1, curvature: '2.5d_curved_edge', notchType: 'dynamic_island', aspectRatio: '19.5:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 3, bumpHeightMm: 4.1, position: 'top_left' },
    features: { hasHeadphoneJack: false, fingerprint: 'none', portType: 'usb_c', buttonLayout: 'action_button_left' },
    aliases: ['A3102', 'A2848', 'iPhone16,1'],
    notes: 'Titanium frame with Action Button.'
  },

  // --- XIAOMI / REDMI / POCO ---
  {
    id: 'xiaomi-redmi-13c',
    brand: 'Xiaomi',
    name: 'Redmi 13C',
    fullName: 'Xiaomi Redmi 13C',
    releaseYear: 2023,
    dimensions: { height: 168.0, width: 78.0, thickness: 8.1, weightG: 192 },
    screen: { diagonalIn: 6.74, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 1.8, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['23100RN82L', '23108RN04Y', 'Redmi 13C 4G'],
    notes: 'Exact OEM twin of Poco C65. 100% case & screen protector cross-fit.'
  },
  {
    id: 'xiaomi-poco-c65',
    brand: 'Xiaomi',
    name: 'Poco C65',
    fullName: 'Xiaomi Poco C65',
    releaseYear: 2023,
    dimensions: { height: 168.0, width: 78.0, thickness: 8.1, weightG: 192 },
    screen: { diagonalIn: 6.74, curvature: 'flat', notchType: 'waterdrop_u', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 1.8, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['2310FPCA4G', 'Poco C65 4G'],
    notes: 'Exact OEM twin of Redmi 13C. Cases and glass are completely interchangeable.'
  },
  {
    id: 'xiaomi-redmi-note-13-4g',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 4G',
    fullName: 'Xiaomi Redmi Note 13 4G',
    releaseYear: 2024,
    dimensions: { height: 162.2, width: 75.6, thickness: 8.0, weightG: 188 },
    screen: { diagonalIn: 6.67, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'individual_rings', lensCount: 3, bumpHeightMm: 2.1, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['23129RAA4G', 'Redmi Note 13'],
  },
  {
    id: 'xiaomi-redmi-note-13-5g',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 5G',
    fullName: 'Xiaomi Redmi Note 13 5G',
    releaseYear: 2024,
    dimensions: { height: 161.1, width: 75.0, thickness: 7.6, weightG: 174 },
    screen: { diagonalIn: 6.67, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 3, bumpHeightMm: 2.2, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['2312DRAABG', 'Poco M6 Pro 5G Clone'],
    notes: 'Screen glass matches Redmi Note 13 4G and Poco X6 5G.'
  },
  {
    id: 'xiaomi-poco-x6-5g',
    brand: 'Xiaomi',
    name: 'Poco X6 5G',
    fullName: 'Xiaomi Poco X6 5G',
    releaseYear: 2024,
    dimensions: { height: 161.2, width: 74.3, thickness: 8.0, weightG: 181 },
    screen: { diagonalIn: 6.67, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 3, bumpHeightMm: 2.3, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['23122PCD1G', 'Redmi Note 13 Pro 5G twin'],
    notes: 'Rebrand of Redmi Note 13 Pro (China). Screen protector is 100% interchangeable.'
  },

  // --- MOTOROLA ---
  {
    id: 'motorola-moto-g24',
    brand: 'Motorola',
    name: 'Moto G24',
    fullName: 'Motorola Moto G24',
    releaseYear: 2024,
    dimensions: { height: 163.5, width: 74.5, thickness: 8.0, weightG: 181 },
    screen: { diagonalIn: 6.56, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 2, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['XT2423-1', 'Moto G24 Power twin'],
    notes: 'Twin chassis with Moto G04. 100% case & screen cross-fit.'
  },
  {
    id: 'motorola-moto-g04',
    brand: 'Motorola',
    name: 'Moto G04',
    fullName: 'Motorola Moto G04',
    releaseYear: 2024,
    dimensions: { height: 163.5, width: 74.5, thickness: 8.0, weightG: 179 },
    screen: { diagonalIn: 6.56, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'rectangular_island', lensCount: 1, bumpHeightMm: 1.5, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['XT2421-1', 'Moto G04s'],
    notes: 'Twin chassis with Moto G24. Single camera ring cutout fits inside G24 dual bump case.'
  },
  {
    id: 'motorola-moto-g54',
    brand: 'Motorola',
    name: 'Moto G54',
    fullName: 'Motorola Moto G54 5G',
    releaseYear: 2023,
    dimensions: { height: 161.6, width: 73.8, thickness: 8.0, weightG: 177 },
    screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 1.6, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['XT2343-1', 'Moto G54 Power Edition'],
  },
  {
    id: 'motorola-moto-g84',
    brand: 'Motorola',
    name: 'Moto G84 5G',
    fullName: 'Motorola Moto G84 5G',
    releaseYear: 2023,
    dimensions: { height: 160.0, width: 74.4, thickness: 7.6, weightG: 166 },
    screen: { diagonalIn: 6.55, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'square_island', lensCount: 2, bumpHeightMm: 1.8, position: 'top_left' },
    features: { hasHeadphoneJack: true, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['XT2347-2', 'Moto G84'],
  },

  // --- GOOGLE PIXEL ---
  {
    id: 'google-pixel-8',
    brand: 'Google',
    name: 'Pixel 8',
    fullName: 'Google Pixel 8',
    releaseYear: 2023,
    dimensions: { height: 150.5, width: 70.8, thickness: 8.9, weightG: 187 },
    screen: { diagonalIn: 6.2, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'horizontal_bar', lensCount: 2, bumpHeightMm: 2.8, position: 'center' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['G9BQD', 'Pixel 8 5G'],
  },
  {
    id: 'google-pixel-7a',
    brand: 'Google',
    name: 'Pixel 7a',
    fullName: 'Google Pixel 7a',
    releaseYear: 2023,
    dimensions: { height: 152.0, width: 72.9, thickness: 9.0, weightG: 193 },
    screen: { diagonalIn: 6.1, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
    camera: { shape: 'horizontal_bar', lensCount: 2, bumpHeightMm: 2.2, position: 'center' },
    features: { hasHeadphoneJack: false, fingerprint: 'under_display', portType: 'usb_c', buttonLayout: 'power_right_vol_right' },
    aliases: ['GHL1X', 'Pixel 7a 5G'],
  }
];

export const INITIAL_COMPATIBILITY_PAIRS: CompatibilityPair[] = [
  // --- XIAOMI REDMI 13C ↔ POCO C65 (EXACT TWINS) ---
  {
    id: 'pair-redmi13c-pococ65-all',
    sourceModelId: 'xiaomi-redmi-13c',
    targetModelId: 'xiaomi-poco-c65',
    category: 'all_accessories',
    confidenceLevel: 'EXACT_MATCH',
    confidenceScore: 100,
    fitNotes: 'Identical hardware chassis mold and display panel. Screen protectors and all phone cases are 100% interchangeable.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Lead Tech',
    verifiedDate: '2024-01-10',
    evidenceSources: [
      {
        type: 'manufacturer_spec',
        title: 'Xiaomi Global Hardware Platform Shared Architecture',
        snippet: 'Poco C65 is the direct OEM rebrand of Redmi 13C with identical 168.0 x 78.0 x 8.1 mm dimensions and waterdrop 6.74" LCD.'
      }
    ]
  },

  // --- MOTOROLA MOTO G24 ↔ MOTO G04 (EXACT TWINS) ---
  {
    id: 'pair-motog24-motog04-all',
    sourceModelId: 'motorola-moto-g24',
    targetModelId: 'motorola-moto-g04',
    category: 'all_accessories',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 99,
    fitNotes: 'Identical 163.5 x 74.5 x 8.0 mm chassis. Moto G04 single camera fits inside Moto G24 dual camera case cutout.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Staff',
    verifiedDate: '2024-02-14'
  },

  // --- APPLE IPHONE 13 ↔ IPHONE 14 (SCREEN GLASS 100%, CASE HIGH LIKELIHOOD) ---
  {
    id: 'pair-iphone13-iphone14-screen',
    sourceModelId: 'apple-iphone-13',
    targetModelId: 'apple-iphone-14',
    category: 'screen_protector',
    confidenceLevel: 'EXACT_MATCH',
    confidenceScore: 100,
    fitNotes: 'Identical 6.1" OLED front glass panel and notch dimensions. Tempered glass is 100% interchangeable.',
    isVerifiedByStaff: true,
    verifiedBy: 'Apple Certified Tech',
    verifiedDate: '2023-10-15'
  },
  {
    id: 'pair-iphone13-iphone14-case',
    sourceModelId: 'apple-iphone-13',
    targetModelId: 'apple-iphone-14',
    category: 'phone_case',
    confidenceLevel: 'HIGHLY_LIKELY',
    confidenceScore: 88,
    fitNotes: 'TPU and silicone cases fit with high compliance. iPhone 14 is 0.15mm thicker and power button sits ~1mm lower.',
    caveats: 'Rigid hard plastic cases may fit tightly around the camera bump.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Staff',
    verifiedDate: '2023-11-01'
  },

  // --- SAMSUNG A05s ↔ A05 (SCREEN GLASS FIT) ---
  {
    id: 'pair-samsung-a05s-a05-screen',
    sourceModelId: 'samsung-a05s',
    targetModelId: 'samsung-a05',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 97,
    fitNotes: 'Both feature flat 6.7" PLS LCD panels with Infinity-U notch. Screen protectors match 100%.',
    caveats: 'Phone cases are NOT fully interchangeable: A05s has 3 camera rings, A05 has 2 camera rings.',
    isVerifiedByStaff: true,
    verifiedBy: 'Samsung Retail Tech',
    verifiedDate: '2023-12-10'
  },

  // --- SAMSUNG A04s ↔ A04 ---
  {
    id: 'pair-samsung-a04-a04s-screen',
    sourceModelId: 'samsung-a04s',
    targetModelId: 'samsung-a04',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 98,
    fitNotes: 'Both feature 6.5" flat Infinity-V/U panels with identical edge radius.',
    caveats: 'Case fit requires caution: A04s has side fingerprint sensor cutout on power button, A04 has solid power button.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Staff',
    verifiedDate: '2023-12-05'
  },

  // --- SAMSUNG A14 4G ↔ A14 5G ---
  {
    id: 'pair-samsung-a14-4g-5g-screen',
    sourceModelId: 'samsung-a14-5g',
    targetModelId: 'samsung-a14-4g',
    category: 'all_accessories',
    confidenceLevel: 'EXACT_MATCH',
    confidenceScore: 100,
    fitNotes: 'Identical 167.7 x 78.0 x 9.1 mm chassis and 6.6" 20:9 front glass. Cases and screen glass 100% interchangeable.',
    isVerifiedByStaff: true,
    verifiedBy: 'Senior Technician',
    verifiedDate: '2024-01-22'
  },

  // --- SAMSUNG A15 ↔ A25 ---
  {
    id: 'pair-samsung-a15-a25-screen',
    sourceModelId: 'samsung-a25',
    targetModelId: 'samsung-a15',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 97,
    fitNotes: 'Identical 6.5" 19.5:9 Super AMOLED front glass with Infinity-U notch.',
    caveats: 'Case fit: Key Island buttons align, but A25 has slightly thicker camera rings (+0.1mm). TPU cases fit well.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Tech',
    verifiedDate: '2024-02-18'
  },

  // --- SAMSUNG A35 ↔ A55 ---
  {
    id: 'pair-samsung-a35-a55-screen',
    sourceModelId: 'samsung-a55',
    targetModelId: 'samsung-a35',
    category: 'screen_protector',
    confidenceLevel: 'CONFIRMED_COMPATIBLE',
    confidenceScore: 96,
    fitNotes: 'Both utilize identical 6.6" 19.5:9 120Hz flat Super AMOLED panels with center punch-hole.',
    caveats: 'Phone cases are slightly different in width (77.4mm vs 78.0mm). Soft TPU cases fit with mild flex.',
    isVerifiedByStaff: true,
    verifiedBy: 'Store Lead Tech',
    verifiedDate: '2024-03-25'
  },

  // --- XIAOMI REDMI NOTE 13 4G ↔ REDMI NOTE 13 5G ↔ POCO X6 5G ---
  {
    id: 'pair-redmi-note13-pocox6-screen',
    sourceModelId: 'xiaomi-poco-x6-5g',
    targetModelId: 'xiaomi-redmi-note-13-5g',
    category: 'screen_protector',
    confidenceLevel: 'EXACT_MATCH',
    confidenceScore: 100,
    fitNotes: 'Identical 6.67" flat 120Hz AMOLED front glass with centered punch-hole and slim bezels.',
    isVerifiedByStaff: true,
    verifiedBy: 'Xiaomi Specialist',
    verifiedDate: '2024-02-10'
  }
];
