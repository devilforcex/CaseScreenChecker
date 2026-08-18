export type AccessoryCategory = 'screen_protector' | 'phone_case' | 'all_accessories';

export type ConfidenceLevel = 
  | 'EXACT_MATCH'
  | 'CONFIRMED_COMPATIBLE'
  | 'HIGHLY_LIKELY'
  | 'POSSIBLE_WITH_CAUTION'
  | 'NOT_COMPATIBLE'
  | 'UNKNOWN';

export type ScreenCurvature = 'flat' | '2.5d_curved_edge' | 'waterfall_3d';

export type ScreenNotchType = 
  | 'punch_hole_center'
  | 'punch_hole_left'
  | 'teardrop_v'
  | 'waterdrop_u'
  | 'dynamic_island'
  | 'wide_notch'
  | 'bezel';

export type CameraIslandShape = 
  | 'individual_rings'
  | 'rectangular_island'
  | 'square_island'
  | 'circular_oreo'
  | 'horizontal_bar'
  | 'teardrop_vertical';

export interface PhoneDimensions {
  height: number; // mm
  width: number;  // mm
  thickness: number; // mm
  weightG?: number;
}

export interface ScreenSpec {
  diagonalIn: number;
  curvature: ScreenCurvature;
  notchType: ScreenNotchType;
  aspectRatio: string;
  hasCurvedEdges: boolean;
}

export interface CameraSpec {
  shape: CameraIslandShape;
  lensCount: number;
  bumpHeightMm: number;
  islandWidthMm?: number;
  islandHeightMm?: number;
  position: 'top_left' | 'center' | 'full_width_bar';
}

export interface HardwareFeatures {
  hasHeadphoneJack: boolean;
  fingerprint: 'under_display' | 'side_power_button' | 'rear' | 'none';
  portType: 'usb_c' | 'lightning' | 'micro_usb';
  buttonLayout: 'power_right_vol_right' | 'power_right_vol_left' | 'action_button_left';
}

export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  fullName: string;
  releaseYear: number;
  dimensions: PhoneDimensions;
  screen: ScreenSpec;
  camera: CameraSpec;
  features: HardwareFeatures;
  aliases: string[];
  notes?: string;
  imageUrl?: string;
}

export interface ToleranceDiff {
  heightDeltaMm: number;
  widthDeltaMm: number;
  thicknessDeltaMm: number;
  screenDiagonalDeltaIn: number;
  screenCurvatureMatch: boolean;
  notchMatch: boolean;
  cameraShapeMatch: boolean;
  cameraIslandFit: 'exact' | 'fits_with_gap' | 'blocked' | 'different_layout';
  headphoneJackMatch: boolean;
  buttonAlignmentScore: number; // 0 - 100
}

export interface CompatibilityPair {
  id: string;
  sourceModelId: string;
  targetModelId: string;
  category: AccessoryCategory;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  fitNotes: string;
  caveats?: string;
  isVerifiedByStaff: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  evidenceSources?: {
    type: 'staff_test' | 'manufacturer_spec' | 'teardown' | 'web_research';
    title: string;
    url?: string;
    snippet: string;
  }[];
}

export interface CompatibilityResult {
  candidateModel: PhoneModel;
  category: AccessoryCategory;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  fitNotes: string;
  caveats?: string;
  isVerifiedByStaff: boolean;
  diff: ToleranceDiff;
  pairId?: string;
  evidenceSources?: CompatibilityPair['evidenceSources'];
}

export interface WebResearchItem {
  id: string;
  query: string;
  candidateName: string;
  brand: string;
  category: AccessoryCategory;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  sourceTitle: string;
  sourceUrl: string;
  evidenceSnippet: string;
  specsSummary: string;
  credibility: number; // 1-5
  timestamp: string;
}
