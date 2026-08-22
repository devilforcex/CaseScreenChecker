import { describe, expect, it } from 'vitest';
import { phoneModelSchema } from './schemas';

const phone = {
  id: 'test-phone', brand: 'Test', name: 'Phone', fullName: 'Test Phone', releaseYear: 2024,
  dimensions: { height: 160, width: 75, thickness: 8 },
  screen: { diagonalIn: 6.5, curvature: 'flat', notchType: 'punch_hole_center', aspectRatio: '20:9', hasCurvedEdges: false },
  camera: { shape: 'individual_rings', lensCount: 2, bumpHeightMm: 1, position: 'top_left' },
  features: { hasHeadphoneJack: false, fingerprint: 'side_power_button', portType: 'usb_c', buttonLayout: 'power_right_vol_right' }, aliases: [],
};

describe('phoneModelSchema', () => {
  it('treats unavailable optional screen measurements as absent instead of NaN', () => {
    const parsed = phoneModelSchema.parse({
      ...phone,
      screen: { ...phone.screen, cornerRadiusMm: Number.NaN, cutoutWidthMm: Number.NaN, cutoutHeightMm: Number.NaN },
    });

    expect(parsed.screen.cornerRadiusMm).toBeUndefined();
    expect(parsed.screen.cutoutWidthMm).toBeUndefined();
    expect(parsed.screen.cutoutHeightMm).toBeUndefined();
  });

  it('still rejects a non-positive known screen measurement', () => {
    expect(() => phoneModelSchema.parse({ ...phone, screen: { ...phone.screen, widthMm: 0 } })).toThrow();
  });
});
