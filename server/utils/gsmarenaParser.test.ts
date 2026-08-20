/**
 * Tests for the GSMArena parser — the core of the real web research.
 *
 * Uses realistic HTML snippets to verify parsing of search results
 * and specifications pages.
 */

import { describe, it, expect } from 'vitest';
import { parseSearchResults, parseSpecsPage } from './gsmarenaParser';

const MOCK_SEARCH_HTML = `
<html>
<body>
  <div class="makers">
    <a href="samsung_galaxy_a06-12345.php">
      <span>Samsung Galaxy A06</span>
    </a>
    <a href="samsung_galaxy_a05s-12222.php">
      <span>Samsung Galaxy A05s</span>
    </a>
    <a href="xiaomi_redmi_note_13-11111.php">
      <span>Xiaomi Redmi Note 13</span>
    </a>
  </div>
</body>
</html>
`;

const MOCK_SPECS_HTML = `
<html>
<body>
  <h1 class="specs-phone-name-title">Samsung Galaxy A06</h1>
  <table>
    <tr>
      <td class="ttl">Dimensions</td>
      <td class="nfo">167.3 x 77.3 x 8.0 mm</td>
    </tr>
    <tr>
      <td class="ttl">Weight</td>
      <td class="nfo">189 g</td>
    </tr>
    <tr>
      <td class="ttl">Display</td>
      <td class="nfo">6.7" PLS LCD, 720 x 1600 px, 20:9 ratio</td>
    </tr>
    <tr>
      <td class="ttl">Chipset</td>
      <td class="nfo">Mediatek Helio G85</td>
    </tr>
    <tr>
      <td class="ttl">Rear camera</td>
      <td class="nfo">50 MP, f/1.8 (wide), 2 MP, f/2.4 (macro), 2 MP, f/2.4 (depth)</td>
    </tr>
    <tr>
      <td class="ttl">Loudspeaker</td>
      <td class="nfo">Yes, with 3.5mm jack</td>
    </tr>
    <tr>
      <td class="ttl">Sensors</td>
      <td class="nfo">Fingerprint (side-mounted), accelerometer, proximity</td>
    </tr>
    <tr>
      <td class="ttl">USB</td>
      <td class="nfo">USB Type-C 2.0</td>
    </tr>
    <tr>
      <td class="ttl">Launched</td>
      <td class="nfo">2024, August</td>
    </tr>
    <tr>
      <td class="ttl">Also known as</td>
      <td class="nfo">SM-A065F, SM-A065M</td>
    </tr>
  </table>
</body>
</html>
`;

describe('parseSearchResults', () => {
  it('extracts phone names and paths from GSMArena search HTML', () => {
    const results = parseSearchResults(MOCK_SEARCH_HTML);
    expect(results.length).toBe(3);
    expect(results[0].title).toBe('Samsung Galaxy A06');
    expect(results[0].path).toBe('samsung_galaxy_a06-12345');
    expect(results[1].title).toBe('Samsung Galaxy A05s');
  });

  it('returns empty array for HTML without search results', () => {
    const results = parseSearchResults('<html><body>No results</body></html>');
    expect(results.length).toBe(0);
  });
});

describe('parseSpecsPage', () => {
  it('parses dimensions, screen, camera, and features', () => {
    const result = parseSpecsPage(MOCK_SPECS_HTML, 'https://gsmarena.com/samsung_galaxy_a06-12345.php');

    expect(result.success).toBe(true);
    expect(result.model).toBeDefined();
    expect(result.rawSpecs).toBeDefined();

    const model = result.model!;
    expect(model.fullName).toBe('Samsung Galaxy A06');
    expect(model.brand).toBe('Samsung');
    expect(model.dimensions.height).toBe(167.3);
    expect(model.dimensions.width).toBe(77.3);
    expect(model.dimensions.thickness).toBe(8.0);
    expect(model.dimensions.weightG).toBe(189);
    expect(model.screen.diagonalIn).toBe(6.7);
    expect(model.screen.aspectRatio).toBe('20:9');
    expect(model.features.hasHeadphoneJack).toBe(true);
    expect(model.features.fingerprint).toBe('side_power_button');
    expect(model.features.portType).toBe('usb_c');
    expect(model.camera.lensCount).toBe(3);
    expect(model.aliases).toContain('SM-A065F');
    expect(model.aliases).toContain('SM-A065M');
    expect(model.releaseYear).toBe(2024);
  });

  it('handles incomplete HTML gracefully', () => {
    const result = parseSpecsPage('<html><body><h1 class="specs-phone-name-title">Test Phone</h1></body></html>', 'http://example.com');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Incomplete specs');
  });

  it('detects missing device name', () => {
    const result = parseSpecsPage('<html><body>No name here</body></html>', 'http://example.com');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not find device name');
  });
});