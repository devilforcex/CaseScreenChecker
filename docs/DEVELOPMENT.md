# CaseScreenChecker Development & Operations Guide

## 1. Local & VPS Environment Setup

### Prerequisites
- Node.js >= 18 or 20 LTS
- npm >= 9

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd CaseScreenChecker

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

## 2. Language & Code Style Mandate
- **All code, comments, documentation, UI labels, and commit messages MUST be in English.**
- No Cyrillic or non-English language packs or dictionaries in the core codebase.

## 3. Testing Requirements
- **Unit Tests**: Test dimensional tolerance math (screen diagonal delta, chassis millimeter threshold calculation).
- **Verification Tests**: Verify that known exact pairs (e.g. iPhone 13 / 14 screen protectors) evaluate to `EXACT_MATCH` (100%), and known incompatible cases evaluate to `NOT_COMPATIBLE`.
- **E2E / Component Tests**: Validate instant search autocomplete, category tab switching, and visual overlay renderer.
