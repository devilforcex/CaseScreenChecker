import { z } from 'zod';

/**
 * Zod validation schemas for the REST API payloads.
 * Mirrors the domain types in `src/types.ts` so that POST bodies are
 * validated at runtime before they enter the in-memory store.
 */

export const screenCurvatureEnum = z.enum(['flat', '2.5d_curved_edge', 'waterfall_3d']);

export const notchTypeEnum = z.enum([
  'punch_hole_center',
  'punch_hole_left',
  'teardrop_v',
  'waterdrop_u',
  'dynamic_island',
  'wide_notch',
  'bezel',
]);

export const cameraShapeEnum = z.enum([
  'individual_rings',
  'rectangular_island',
  'square_island',
  'circular_oreo',
  'horizontal_bar',
  'teardrop_vertical',
]);

export const cameraPositionEnum = z.enum(['top_left', 'center', 'full_width_bar']);

export const fingerprintEnum = z.enum(['under_display', 'side_power_button', 'rear', 'none']);

export const portTypeEnum = z.enum(['usb_c', 'lightning', 'micro_usb']);

export const buttonLayoutEnum = z.enum([
  'power_right_vol_right',
  'power_right_vol_left',
  'action_button_left',
]);

export const categoryEnum = z.enum(['screen_protector', 'phone_case', 'all_accessories']);

export const confidenceEnum = z.enum([
  'EXACT_MATCH',
  'CONFIRMED_COMPATIBLE',
  'HIGHLY_LIKELY',
  'POSSIBLE_WITH_CAUTION',
  'NOT_COMPATIBLE',
  'UNKNOWN',
]);

export const evidenceTypeEnum = z.enum([
  'staff_test',
  'manufacturer_spec',
  'teardown',
  'web_research',
]);

const phoneDimensionsSchema = z.object({
  height: z.number().positive(),
  width: z.number().positive(),
  thickness: z.number().positive(),
  weightG: z.number().positive().optional(),
});

const screenSpecSchema = z.object({
  diagonalIn: z.number().positive(),
  curvature: screenCurvatureEnum,
  notchType: notchTypeEnum,
  aspectRatio: z.string().min(1),
  hasCurvedEdges: z.boolean(),
  widthMm: z.number().positive().optional(),
  heightMm: z.number().positive().optional(),
  cornerRadiusMm: z.number().nonnegative().optional(),
  cutoutWidthMm: z.number().positive().optional(),
  cutoutHeightMm: z.number().positive().optional(),
  edgeToEdgeCompatible: z.boolean().optional(),
});

const cameraSpecSchema = z.object({
  shape: cameraShapeEnum,
  lensCount: z.number().int().nonnegative(),
  bumpHeightMm: z.number().nonnegative(),
  islandWidthMm: z.number().nonnegative().optional(),
  islandHeightMm: z.number().nonnegative().optional(),
  position: cameraPositionEnum,
});

const hardwareFeaturesSchema = z.object({
  hasHeadphoneJack: z.boolean(),
  fingerprint: fingerprintEnum,
  portType: portTypeEnum,
  buttonLayout: buttonLayoutEnum,
});

export const phoneModelSchema = z.object({
  id: z.string().min(1),
  brand: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
  releaseYear: z.number().int(),
  dimensions: phoneDimensionsSchema,
  screen: screenSpecSchema,
  camera: cameraSpecSchema,
  features: hardwareFeaturesSchema,
  aliases: z.array(z.string()),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

const evidenceSourceSchema = z.object({
  type: evidenceTypeEnum,
  title: z.string().min(1),
  url: z.string().optional(),
  snippet: z.string(),
});

export const compatibilityPairSchema = z.object({
  id: z.string().min(1),
  sourceModelId: z.string().min(1),
  targetModelId: z.string().min(1),
  category: categoryEnum,
  confidenceLevel: confidenceEnum,
  confidenceScore: z.number().min(0).max(100),
  fitNotes: z.string().min(1),
  caveats: z.string().optional(),
  isVerifiedByStaff: z.boolean(),
  verifiedBy: z.string().optional(),
  verifiedDate: z.string().optional(),
  evidenceSources: z.array(evidenceSourceSchema).optional(),
});
