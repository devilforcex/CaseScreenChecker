/* gsmarenaParser.ts - Parse GSMArena HTML into PhoneModel objects */
import * as cheerio from "cheerio";
import { PhoneModel, ScreenNotchType, CameraIslandShape } from "../../src/types.js";

export interface ParsedSearchResult { path: string; title: string; }
export interface GsmarenaParseResult {
  success: boolean; model?: PhoneModel; rawSpecs?: Record<string, string>; error?: string;
}

export function parseSearchResults(html: string, limit = 5): ParsedSearchResult[] {
  const dollar = cheerio.load(html);
  const results: ParsedSearchResult[] = [];
  dollar(".makers a, .search-results a, .st-text a").each((_i, el) => {
    const href = dollar(el).attr("href") || "";
    const title = dollar(el).find("span").text().trim() || dollar(el).text().trim();
    if (href && title && href.endsWith(".php") && !href.includes("results")) {
      results.push({ path: href.replace(".php", ""), title });
    }
  });
  if (results.length === 0) {
    dollar("ul li a").each((_i, el) => {
      const href = dollar(el).attr("href") || "";
      const title = dollar(el).text().trim();
      if (href && title && href.endsWith(".php") && !href.includes("results") && !href.includes("#")) {
        results.push({ path: href.replace(".php", ""), title });
      }
    });
  }
  return results.slice(0, limit);
}

export function parseSpecsPage(html: string, sourceUrl: string): GsmarenaParseResult {
  const dollar = cheerio.load(html);
  const rawSpecs: Record<string, string> = {};
  const model: Record<string, any> = {};

  const deviceName = dollar(
    ".specs-phone-name-title, h1.specs-phone-name, .article-info-name"
  ).first().text().trim();
  if (!deviceName) {
    return { success: false, error: "Could not find device name on the page." };
  }

  // Parse spec table rows
  dollar("table tr").each((_rowIdx, row) => {
    const dollarRow = dollar(row);
    const labelEl = dollarRow.find(".ttl, .specs-ttl");
    const valueEl = dollarRow.find(".nfo, .specs-nfo");
    if (labelEl.length && valueEl.length) {
      const label = labelEl.text().trim().toLowerCase();
      const value = valueEl.text().trim();
      if (label && value) rawSpecs[label] = value;
    }
  });

  // Alternative: li > strong label
  dollar(".specs-list li").each((_i, el) => {
    const dollarEl = dollar(el);
    const strong = dollarEl.find("strong").first();
    const label = strong.text().trim().toLowerCase().replace(/[:\s]+/g, "").trim();
    if (label) {
      strong.remove();
      const value = dollarEl.text().trim();
      if (value && !rawSpecs[label]) rawSpecs[label] = value;
    }
  });

  return _buildModel(rawSpecs, model, deviceName, sourceUrl);
}

function _buildModel(
  rawSpecs: Record<string, string>,
  model: Record<string, any>,
  deviceName: string,
  sourceUrl: string
): GsmarenaParseResult {
  model.fullName = deviceName;
  model.name = deriveShortName(deviceName);
  model.brand = deriveBrand(deviceName);

  // Dimensions: "167.3 x 77.3 x 8.0 mm"
  const dimRaw = rawSpecs["dimensions"] || rawSpecs["size"] || "";
  const dimMatch = dimRaw.match(/([0-9.]+)\s* x \s*([0-9.]+)\s* x \s*([0-9.]+)\s*mm/i);
  if (dimMatch) {
    model.dimensions = {
      height: parseFloat(dimMatch[1]),
      width: parseFloat(dimMatch[2]),
      thickness: parseFloat(dimMatch[3]),
    };
  }

  // Weight: "189 g"
  const weightRaw = rawSpecs["weight"] || "";
  const weightMatch = weightRaw.match(/([0-9]+)/);
  if (weightMatch) {
    if (!model.dimensions) model.dimensions = {};
    model.dimensions.weightG = parseInt(weightMatch[1], 10);
  }

  // Display: '6.7" PLS LCD'
  const displaySpec = rawSpecs["display"] || rawSpecs["type"] || "";
  const diagMatch = displaySpec.match(/([0-9.]+)"/);
  if (diagMatch) {
    model.screen = model.screen || {};
    model.screen.diagonalIn = parseFloat(diagMatch[1]);
    model.screen.aspectRatio = deriveAspectRatio(displaySpec);
    model.screen.curvature = displaySpec.toLowerCase().includes("curved")
      ? "2.5d_curved_edge"
      : "flat";
    model.screen.hasCurvedEdges = model.screen.curvature !== "flat";
  }

  // Notch type
  const notchDerived = deriveNotchType(displaySpec, deviceName);
  if (notchDerived && model.screen) {
    model.screen.notchType = notchDerived;
  }

  // Camera
  const cameraDesc = rawSpecs["rear camera"] || rawSpecs["camera"] || "";
  model.camera = {
    shape: deriveCameraIsland(deviceName, rawSpecs),
    lensCount: deriveLensCount(cameraDesc),
    bumpHeightMm: 1.5,
    position: "top_left",
  };

  // Features
  model.features = {
    hasHeadphoneJack: deriveHeadphoneJack(rawSpecs),
    fingerprint: deriveFingerprint(rawSpecs),
    portType: derivePortType(rawSpecs),
    buttonLayout: "power_right_vol_right",
  };

  // Aliases
  const aka = rawSpecs["also known as"] || rawSpecs["other names"] || "";
  model.aliases = aka ? aka.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  // Release year
  const launched = rawSpecs["launched"] || rawSpecs["announced"] || "";
  const yearMatch = launched.match(/([0-9]{4})/);
  model.releaseYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  // Generate ID
  const idBase = (model.brand + "-" + model.name)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
  model.id = "gsm-" + idBase + "-" + Date.now();

  // Notes
  const notes: string[] = ["Source: " + sourceUrl];
  if (rawSpecs["chipset"]) notes.push("Chipset: " + rawSpecs["chipset"]);
  model.notes = notes.join(" | ");

  // Validate
  if (!model.dimensions || !model.screen || !model.camera || !model.features) {
    return { success: false, rawSpecs, error: "Incomplete specs - missing required fields." };
  }

  return { success: true, model: model as PhoneModel, rawSpecs };
}

// Helper functions

function deriveShortName(fullName: string): string {
  let s = fullName;
  const prefixes = ["Samsung ", "Apple ", "Xiaomi ", "Motorola ", "Google ", "Huawei ", "Nokia ", "OnePlus ", "Oppo ", "Realme ", "Honor ", "Vivo "];
  for (const p of prefixes) {
    if (s.startsWith(p)) { s = s.slice(p.length); break; }
  }
  return s;
}

function deriveBrand(fullName: string): string {
  const brands = [
    { prefixes: ["Samsung"], name: "Samsung" },
    { prefixes: ["Apple", "iPhone"], name: "Apple" },
    { prefixes: ["Xiaomi", "Redmi", "Poco", "POCO"], name: "Xiaomi" },
    { prefixes: ["Motorola", "Moto"], name: "Motorola" },
    { prefixes: ["Google", "Pixel"], name: "Google" },
    { prefixes: ["Huawei", "Honor"], name: "Huawei" },
    { prefixes: ["Nokia"], name: "Nokia" },
  ];
  for (const b of brands) {
    for (const p of b.prefixes) {
      if (fullName.startsWith(p)) return b.name;
    }
  }
  return fullName.split(" ")[0] || "Unknown";
}

function deriveAspectRatio(displaySpec: string): string {
  const match = displaySpec.match(/([0-9.]+)\s*:\s*([0-9.]+)/);
  if (match) return match[1] + ":" + match[2];
  const resMatch = displaySpec.match(/([0-9]+)\s*x\s*([0-9]+)/);
  if (resMatch) {
    const w = parseInt(resMatch[1], 10);
    const h = parseInt(resMatch[2], 10);
    if (w > 0 && h > 0) {
      const ratio = w / h;
      if (ratio > 0.5) return "20:9";
      if (ratio > 0.47) return "19.5:9";
      return "19:9";
    }
  }
  return "20:9";
}

function deriveNotchType(displaySpec: string, deviceName: string): any {
  const s = (displaySpec + " " + deviceName).toLowerCase();
  if (s.includes("dynamic island")) return "dynamic_island";
  if (s.includes("punch-hole") || s.includes("punch hole")) return "punch_hole_center";
  if (s.includes("waterdrop") || s.includes("water drop")) return "waterdrop_u";
  if (s.includes("teardrop") || s.includes("v-notch")) return "teardrop_v";
  if (s.includes("notch")) return "wide_notch";
  return "punch_hole_center";
}

function deriveLensCount(cameraDesc: string): number {
  const mpMatches = cameraDesc.match(/\d+\s*mp/gi);
  if (mpMatches) {
    const count = mpMatches.length;
    if (count > 0 && count <= 5) return count;
  }
  const s = cameraDesc.toLowerCase();
  if (s.includes("triple")) return 3;
  if (s.includes("quad")) return 4;
  if (s.includes("dual")) return 2;
  return 1;
}

function deriveCameraIsland(deviceName: string, rawSpecs: Record<string, string>): any {
  const s = (deviceName + " " + JSON.stringify(rawSpecs)).toLowerCase();
  if (s.includes("square")) return "square_island";
  if (s.includes("rectangular")) return "rectangular_island";
  if (s.includes("circular") || s.includes("oreo")) return "circular_oreo";
  if (s.includes("horizontal")) return "horizontal_bar";
  if (s.includes("vertical") || s.includes("teardrop")) return "teardrop_vertical";
  return "individual_rings";
}

function deriveHeadphoneJack(rawSpecs: Record<string, string>): boolean {
  const s = (rawSpecs["audio"] || rawSpecs["features"] || "").toLowerCase();
  if (s.includes("3.5mm") || s.includes("jack") || s.includes("headphone")) return true;
  const loudspeaker = (rawSpecs["loudspeaker"] || "").toLowerCase();
  if (loudspeaker.includes("3.5mm")) return true;
  return false;
}

function deriveFingerprint(rawSpecs: Record<string, string>): string {
  const s = (rawSpecs["sensors"] || rawSpecs["security"] || rawSpecs["fingerprint"] || "").toLowerCase();
  if (s.includes("under display") || s.includes("optical") || s.includes("ultrasonic")) return "under_display";
  if (s.includes("side") || s.includes("power button")) return "side_power_button";
  if (s.includes("rear") || s.includes("back") || s.includes("fingerprint")) return "rear";
  return "none";
}

function derivePortType(rawSpecs: Record<string, string>): string {
  const s = (rawSpecs["usb"] || rawSpecs["ports"] || rawSpecs["charging"] || "").toLowerCase();
  if (s.includes("usb type-c") || s.includes("usb-c") || s.includes("type-c")) return "usb_c";
  if (s.includes("lightning")) return "lightning";
  if (s.includes("micro usb")) return "micro_usb";
  return "usb_c";
}
