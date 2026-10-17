# BrandVoice AI - AI-Powered Brand Tweet Generator

BrandVoice AI is a full-stack, enterprise-grade social media intelligence platform that analyzes brand inputs, deciphers brand voice, and generates exactly 10 original, category-balanced tweets across five core content disciplines:
1. **Conversational** (2 tweets)
2. **Promotional** (2 tweets)
3. **Witty / Humorous** (2 tweets)
4. **Informative / Value-Driven** (2 tweets)
5. **Community / Question-Based** (2 tweets)

---

## Features

- **4-Pillar Brand Voice Intelligence**: Analyzes Tone & Personality, Target Audience, Content Themes, and Style & Engagement Rules without hallucinating false company history or pricing.
- **Strict 10-Tweet Category Balance**: Exactly 2 tweets per category, each with unique IDs (1–10) and strict character count enforcement.
- **Full Inline Editing**: Edit any generated tweet text inline with instant real-time character count calculations before copying or exporting.
- **Single Tweet Regeneration**: Refresh only one selected tweet while keeping the other 9 tweets unchanged and preserving the assigned category and tone.
- **Copy & Plain-Text Export**: One-click copy for individual tweets, "Copy All 10 Tweets", and structured plain-text (.txt) export with full campaign metadata.
- **Recent Generation History**: Persists up to 15 recent campaigns in browser `localStorage` with restore, inspect, and delete capabilities (no API keys stored).
- **Brand Sample Posts Support**: Provide up to 5 real sample posts from your brand to calibrate tone without scraping or verbatim cloning.
- **Demo Mode Simulation**: Runs seamlessly with high-fidelity deterministic simulations if an OpenAI API key is not configured, clearly marked so users are never misled.

---

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite & TypeScript
- **Styling**: Tailwind CSS v4 (Dark navy canvas `#020617`, cyan `#06B6D4` and blue `#3B82F6` accents)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & JetBrains Mono (tabular numerals)

### Backend
- **Runtime**: Python 3.10+ / 3.11+
- **API Framework**: FastAPI & Starlette
- **Data Validation**: Pydantic v2
- **AI SDK**: Official OpenAI Python SDK (`openai>=1.14.0`)
- **Server**: Uvicorn ASGI Server
- **Testing**: Pytest & FastAPI TestClient

---

## Architecture & Request Flow

```
[User Browser / React SPA (Port 3000)]
         │
         │  POST /api/generate
         │  POST /api/regenerate-tweet
         ▼
[Express Server Proxy / Gateway (Port 3000)]
         │
         │  Forwards /api/* via HTTP
         ▼
[FastAPI Backend (Port 8000)]
         │
         ├──> Pydantic Schema Validation (schemas.py)
         ├──> Prompt Construction (services/prompts.py)
         ├──> OpenAI API / Demo Mode Engine (services/ai_service.py)
         └──> Output Validation & Constraint Check (utils/validation.py)
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Package Managers**: `npm` and `pip`

---

## Installation & Setup

### 1. Clone & Enter Directory
```bash
git clone <repo-url>
cd brandvoice-ai
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Optional: Set your OpenAI API key for live generation.
# If omitted or left as placeholder, the app runs in clearly marked Demo Mode.
OPENAI_API_KEY="sk-proj-..."

# Optional: OpenAI model name (defaults to gpt-4o-mini)
OPENAI_MODEL="gpt-4o-mini"

# Server Port
PORT=3000
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```
*(On Windows: `pip install -r backend\requirements.txt`)*

---

## Running the Application

### Development (Starts both Frontend & Backend)
```bash
npm run dev
```
This launches:
- FastAPI backend on `http://127.0.0.1:8000`
- Express Gateway & React SPA on `http://localhost:3000`

### Running the Backend Independently
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Running Automated Tests

Run the complete 14-point test suite covering health endpoints, validation, character limits, empty rejections, and mocked AI responses:
```bash
npm run test:backend
# Or directly with pytest:
PYTHONPATH=backend pytest backend/tests/ -v
```

On Windows:
```cmd
set PYTHONPATH=backend
pytest backend/tests/ -v
```

### Test Coverage Summary
1. `test_health_endpoint`: Verifies `/api/health` status and metadata.
2. `test_missing_campaign_objective`: Verifies 422 error on missing objective.
3. `test_missing_product_description`: Verifies 422 error on missing product description.
4. `test_empty_and_oversized_inputs`: Verifies rejection of whitespace and >2000-char inputs.
5. `test_successful_generation_with_mocked_ai`: Verifies 4 voice summary bullets and 10 tweets.
6. `test_demo_mode_generation_when_no_credentials`: Verifies fallback demo output.
7. `test_unique_tweet_ids_and_counts`: Enforces unique IDs 1 to 10.
8. `test_empty_tweet_rejection`: Rejects empty or blank tweet outputs.
9. `test_invalid_ai_response_bullet_count`: Rejects malformed summary bullet counts.
10. `test_regeneration_of_single_tweet`: Verifies single tweet replacement in-place.
11. `test_handling_of_missing_api_credentials`: Verifies unconfigured API key handling.
12. `test_handling_of_ai_api_failures`: Tests rate limit (429) and network error propagation.
13. `test_character_limit_validation`: Enforces max character limits per tweet.

---

## Sample Inputs & Outputs

### Sample Input
- **Brand Name**: TerraBrew
- **Industry**: Food & Beverage / Sustainability
- **Campaign Objective**: Product Launch
- **Product Description**: Reusable insulated ceramic-lined travel coffee tumbler crafted from 100% recycled aluminum. Keeps drinks hot for 12 hours without metallic aftertaste.
- **Target Audience**: Specialty coffee lovers, commuters, and zero-waste creators.
- **Preferred Tone**: Friendly, Inspirational, Conversational
- **Keywords**: morning ritual, ceramic lined, zero waste

### Sample Inferred Voice Summary (4 Bullets)
1. **Tone & Personality**: Warm, mindful, and purpose-driven personality with grounded optimism.
2. **Target Audience**: Primarily specialty coffee enthusiasts and commuters seeking sustainable daily rituals.
3. **Core Themes**: Emphasizing uncompromised flavor, zero-waste mornings, and durable craftsmanship.
4. **Messaging Style**: Conversational and affirmative invitations avoiding preachy guilt-trips.

### Sample Tweet Output (Excerpt)
- `[#01 Conversational]`: "Your morning coffee ritual deserves a cup as deliberate as your roast. What brew are you starting with today?"
- `[#03 Promotional]`: "Meet the TerraBrew: vacuum insulated, ceramic-lined, and built to last a lifetime without metallic aftertaste."
- `[#05 Witty]`: "Paper cups were so last decade. Give your pour-over the home it actually deserves."
- `[#07 Informative]`: "Ceramic interior vs stainless steel: ceramic preserves the delicate floral notes of single-origin coffee without metallic residue."
- `[#09 Community]`: "Pour-over, espresso, or French press to kick off your Saturday? Drop your brew of choice below 👇"

---

## Security & Reliability Notes

- **API Keys**: Never hardcoded, never sent to or visible in the frontend browser client.
- **Validation**: Strict Pydantic input schemas preventing oversized payloads or injections.
- **Zero Hallucination Policy**: Prompts explicitly forbid inventing discounts, fake URLs, or non-existent partnerships.
- **Storage**: Local browser storage only holds sanitized tweet campaigns; no personal credentials or tokens are saved.
