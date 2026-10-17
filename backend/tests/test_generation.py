import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_VALID_RESPONSE = {
    "brand_name": "EcoCup",
    "brand_voice_summary": [
        "Warm, mindful, and purpose-driven personality with grounded optimism.",
        "Targeted at eco-conscious consumers, coffee enthusiasts, and zero-waste champions.",
        "Core themes emphasize sustainability, morning rituals, and durable minimalism.",
        "Clear, conversational tone avoiding guilt-trips and using affirmative invitations."
    ],
    "tweets": [
        {"id": 1, "category": "Conversational", "text": "Your morning coffee ritual deserves a cup as deliberate as your roast."},
        {"id": 2, "category": "Conversational", "text": "What does your current mug say about your morning vibe?"},
        {"id": 3, "category": "Promotional", "text": "Meet the EcoCup: vacuum insulated, ceramic-lined, and built to last a lifetime."},
        {"id": 4, "category": "Promotional", "text": "Upgrade your desk setup with sustainable craftsmanship that keeps drinks hot for 8 hours."},
        {"id": 5, "category": "Witty", "text": "Paper cups were so last decade. Give your brew the home it actually deserves."},
        {"id": 6, "category": "Witty", "text": "Warning: switching to EcoCup may cause severe side effects of smug satisfaction."},
        {"id": 7, "category": "Informative", "text": "Did you know 16 billion single-use coffee cups end up in landfills annually? One reusable cup breaks the cycle."},
        {"id": 8, "category": "Informative", "text": "Ceramic interior vs stainless steel: ceramic preserves the delicate floral notes of specialty coffee without metallic aftertaste."},
        {"id": 9, "category": "Community", "text": "Calling all coffee drinkers: Pour-over, espresso, or French press to kick off your Saturday?"},
        {"id": 10, "category": "Community", "text": "Tag your favorite local coffee roaster who keeps you energized throughout the week!"}
    ]
}

def test_successful_generation_with_mocked_ai():
    """Test 5, 6, 7: Generation with mocked OpenAI returns 4 bullets, 10 tweets, and unique IDs."""
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(SAMPLE_VALID_RESPONSE)
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]

    with patch("app.services.ai_service.get_openai_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_completion
        mock_get_client.return_value = mock_client

        payload = {
            "brand_name": "EcoCup",
            "industry": "Sustainability & Food",
            "campaign_objective": "Product Launch",
            "product_description": "A reusable ceramic-lined coffee tumbler.",
            "target_audience": "Urban commuters & coffee lovers",
            "preferred_tone": ["Friendly", "Inspirational"],
            "keywords": ["zero waste", "morning ritual"],
            "max_character_limit": 280
        }

        response = client.post("/api/generate", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Test 6: Exactly four brand voice summary bullets
        assert len(data["brand_voice_summary"]) == 4
        for bullet in data["brand_voice_summary"]:
            assert isinstance(bullet, str) and len(bullet.strip()) > 0

        # Test 7: Exactly 10 generated tweets
        assert len(data["tweets"]) == 10
        categories = [t["category"] for t in data["tweets"]]
        assert categories.count("Conversational") == 2
        assert categories.count("Promotional") == 2
        assert categories.count("Witty") == 2
        assert categories.count("Informative") == 2
        assert categories.count("Community") == 2

        # Check unique IDs 1..10
        ids = [t["id"] for t in data["tweets"]]
        assert ids == list(range(1, 11))

def test_demo_mode_generation_when_no_credentials():
    """Test demo mode fallback produces valid 4-bullet summary and 10 tweets."""
    with patch("app.services.ai_service.get_openai_client", return_value=None):
        payload = {
            "brand_name": "CloudScale",
            "campaign_objective": "Brand Awareness",
            "product_description": "Serverless edge computing platform for global latency reduction."
        }
        response = client.post("/api/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["is_demo_mode"] is True
        assert len(data["brand_voice_summary"]) == 4
        assert len(data["tweets"]) == 10

def test_regeneration_of_single_tweet():
    """Test 11: Regeneration of one tweet preserves ID, category, and updates text."""
    payload = {
        "brand_info": {
            "brand_name": "EcoCup",
            "campaign_objective": "Product Launch",
            "product_description": "Reusable coffee mug"
        },
        "existing_tweets": [
            {"id": 1, "category": "Conversational", "text": "Original tweet 1"},
            {"id": 2, "category": "Conversational", "text": "Original tweet 2"}
        ],
        "tweet_id": 1
    }
    response = client.post("/api/regenerate-tweet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tweet" in data
    assert data["tweet"]["id"] == 1
    assert data["tweet"]["category"] == "Conversational"
    assert len(data["tweet"]["text"]) > 0

def test_handling_of_ai_api_failures():
    """Test 13: Handling of AI API failure triggers proper HTTP status and message."""
    import openai

    with patch("app.services.ai_service.get_openai_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = openai.RateLimitError(
            message="Rate limit reached", response=MagicMock(status_code=429), body=None
        )
        mock_get_client.return_value = mock_client

        payload = {
            "brand_name": "TestCorp",
            "campaign_objective": "Engagement",
            "product_description": "High performance analytics platform."
        }
        response = client.post("/api/generate", json=payload)
        assert response.status_code == 429
        assert "rate limit" in response.text.lower()
