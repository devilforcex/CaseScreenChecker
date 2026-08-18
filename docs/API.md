# CaseScreenChecker API Specification

## Base URL
`/api/v1`

## Endpoints

### 1. Phone Models

#### `GET /api/v1/models`
Retrieve list of phone models with filtering and search.
- **Query Params**:
  - `q` (string): Search brand, model name, or alias (e.g. `A05s`, `iPhone 14`, `SM-A057F`)
  - `brand` (string): Filter by brand (`Samsung`, `Apple`, `Xiaomi`, `Motorola`, etc.)
  - `limit` (int, default 50)
  - `offset` (int, default 0)
- **Response**: `200 OK`
```json
{
  "total": 1,
  "items": [
    {
      "id": "m-samsung-a05s",
      "name": "Galaxy A05s",
      "brand": "Samsung",
      "releaseYear": 2023,
      "dimensions": { "height": 168.0, "width": 77.8, "thickness": 8.8, "weight": 194 },
      "screen": { "diagonal": 6.7, "curvature": "flat", "notchType": "waterdrop_u", "aspectRatio": "20:9" },
      "camera": { "shape": "individual_rings", "lensCount": 3, "bumpHeight": 1.4 },
      "features": { "hasHeadphoneJack": true, "fingerprint": "side_power_button", "port": "usb_c" },
      "aliases": ["SM-A057F", "SM-A057M", "Galaxy A05s 4G"]
    }
  ]
}
```

#### `GET /api/v1/models/:id`
Get complete technical profile and dimensions of a single phone model.

---

### 2. Compatibility Lookup

#### `GET /api/v1/compatibility/lookup`
Find all compatible accessories and alternative models for a target phone model.
- **Query Params**:
  - `modelId` (string, required): ID of the target phone
  - `category` (enum, optional): `screen_protector` | `phone_case` | `all_accessories`
  - `minConfidence` (int, default 50): Filter out incompatible items
- **Response**: `200 OK`
```json
{
  "targetModel": { "id": "m-samsung-a05s", "name": "Galaxy A05s", "brand": "Samsung" },
  "category": "screen_protector",
  "results": [
    {
      "candidateModel": {
        "id": "m-samsung-a05",
        "name": "Galaxy A05",
        "brand": "Samsung",
        "dimensions": { "height": 168.8, "width": 78.2, "thickness": 8.8 },
        "screen": { "diagonal": 6.7, "curvature": "flat", "notchType": "waterdrop_u" }
      },
      "category": "screen_protector",
      "confidenceLevel": "CONFIRMED_COMPATIBLE",
      "confidenceScore": 96,
      "fitNotes": "Tempered glass matches 100% active screen flat area and top U-notch cutout.",
      "caveats": "Screen protector fits perfectly. Case is NOT interchangeable due to camera lens spacing difference.",
      "isVerifiedByStaff": true,
      "diff": {
        "heightDeltaMm": 0.8,
        "widthDeltaMm": 0.4,
        "screenDiagonalDeltaIn": 0.0,
        "screenCurvatureMatch": true,
        "notchMatch": true
      }
    }
  ]
}
```

---

### 3. External Research & Discovery

#### `POST /api/v1/research/lookup`
Perform web research and tolerance simulation when a phone model has no local pairings.
- **Request Body**:
```json
{
  "queryModelName": "Xiaomi Poco X6 Neo",
  "category": "all_accessories"
}
```
- **Response**: `200 OK`
```json
{
  "query": "Xiaomi Poco X6 Neo",
  "candidatesFound": [
    {
      "candidateName": "Redmi Note 13R Pro",
      "category": "all_accessories",
      "confidenceLevel": "HIGHLY_LIKELY",
      "confidenceScore": 92,
      "evidenceSource": "GSMArena OEM Rebrand Matrix",
      "evidenceSnippet": "Identical chassis tooling (161.1 x 75 x 7.7 mm, 6.67 inch flat OLED).",
      "sourceUrl": "https://gsmarena.com"
    }
  ]
}
```

---

### 4. Admin Management

#### `POST /api/v1/admin/compatibility-pairs`
Create or update a verified compatibility pairing.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "sourceModelId": "m-samsung-a05s",
  "targetModelId": "m-samsung-a05",
  "category": "screen_protector",
  "confidenceLevel": "CONFIRMED_COMPATIBLE",
  "confidenceScore": 96,
  "fitNotes": "Verified in-store by shop staff.",
  "caveats": "Case does not fit."
}
```
