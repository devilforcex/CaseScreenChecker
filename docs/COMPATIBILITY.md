# Compatibility Evaluation Engine Specification

## 1. Physical Tolerance Matrix

Compatibility between phone accessories is defined by strict physical metrics rather than marketing names.

### 1.1 Screen Protectors (Tempered Glass / Hydrogel)

| Metric | Ideal Fit | Acceptable Tolerance | Incompatible Threshold | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Screen Diagonal** | Δ = 0.0 in | \|Δ\| ≤ 0.05 in | \|Δ\| > 0.1 in | Direct surface coverage |
| **Aspect Ratio** | Identical | Δ ≤ 2% width/height ratio | Ratio mismatch | Distorts cutout alignment |
| **Glass Curvature** | Flat to Flat | 2.5D with 1.5mm edge margin | Curved 3D on Flat / Vice versa | Curved glass lifts on flat; flat leaves "halo" on 3D |
| **Front Camera Cutout** | Identical type | Punch hole inside teardrop area | Punch hole covered by black border | Teardrop glass on punch hole phone works; inverted often blocks camera |
| **Top Earpiece Speaker** | Match clearance | Slit offset ≤ 0.8 mm | Slit blocked by glass | Must not obstruct call speaker |

### 1.2 Phone Cases (TPU, Silicone, Hard Shell)

| Metric | TPU / Soft Silicone | Polycarbonate / Hard Case | Notes |
| :--- | :--- | :--- | :--- |
| **Height Delta** | \|Δ\| ≤ 0.5 mm | \|Δ\| ≤ 0.2 mm | Case pops off or stretches |
| **Width Delta** | \|Δ\| ≤ 0.4 mm | \|Δ\| ≤ 0.2 mm | Sides bow out or squeeze buttons |
| **Thickness Delta** | \|Δ\| ≤ 0.3 mm | \|Δ\| ≤ 0.15 mm | Loose back or excessive pressure |
| **Camera Island Cutout** | Candidate cutout ≥ Target island | Exact perimeter match | If candidate cutout is smaller, camera is blocked |
| **Button Alignment** | Position shift ≤ 1.5 mm | Position shift ≤ 0.5 mm | Prevents accidental press or unresponsive keys |
| **Port Alignment** | USB-C opening margin ≥ 2.0 mm | Precise port hole | Cable must insert completely |
| **3.5mm Headphone Jack** | Cutout must exist if Target requires | Exact opening | If missing, store staff must warn customer |

## 2. Confidence Tier Classification

```
  100% ------------------------ EXACT_MATCH
        Chassis / Screen is physically identical or identical tooling mold
        (e.g., iPhone 13 & iPhone 14 screen protectors)
        
   90% ------------------------ CONFIRMED_COMPATIBLE
        Physically tested & verified in-store by staff
        (e.g., Galaxy A05 protector on Galaxy A04)
        
   75% ------------------------ HIGHLY_LIKELY
        Dimensional deviation <= 0.3mm, compatible camera cutout bounds
        
   50% ------------------------ POSSIBLE_WITH_CAUTION
        Functional with minor cosmetic gap or slightly larger camera window
        
    0% ------------------------ NOT_COMPATIBLE
        Blocked camera, unaligned buttons, or chassis size mismatch
```

## 3. Web Research & Evidence Processing

When local database records are missing:
1. Search public hardware specification repositories for exact dimensional schematics.
2. Extract length, width, thickness, camera island dimensions, and screen curvature.
3. Compute simulated tolerance diffs against target device.
4. Mark result with `UNKNOWN` or `POSSIBLE` confidence and tag as `EXTERNAL_EVIDENCE` until verified by store staff.
