import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.validation import validate_and_parse_ai_output, AIOutputValidationError

client = TestClient(app)

def test_missing_campaign_objective():
    """Test 2: Missing campaign objective returns 422 Unprocessable Entity."""
    payload = {
        "brand_name": "TestCorp",
        "product_description": "A high-performance cloud database.",
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 422
    assert "campaign_objective" in response.text

def test_missing_product_description():
    """Test 3: Missing product description returns 422 Unprocessable Entity."""
    payload = {
        "brand_name": "TestCorp",
        "campaign_objective": "Product Launch",
    }
    response = client.post("/api/generate", json=payload)
    assert response.status_code == 422
    assert "product_description" in response.text

def test_empty_and_oversized_inputs():
    """Test 4: Empty string and oversized fields are rejected."""
    # Empty product description
    empty_payload = {
        "campaign_objective": "Engagement",
        "product_description": "   ",
    }
    resp_empty = client.post("/api/generate", json=empty_payload)
    assert resp_empty.status_code == 422

    # Oversized product description (> 2000 chars)
    oversized_payload = {
        "campaign_objective": "Engagement",
        "product_description": "A" * 2001,
    }
    resp_oversized = client.post("/api/generate", json=oversized_payload)
    assert resp_oversized.status_code == 422

def test_unique_tweet_ids_and_counts():
    """Test 8: Unique tweet IDs are enforced and correctly numbered 1 to 10."""
    raw_data = {
        "brand_name": "TestCo",
        "brand_voice_summary": ["Tone 1", "Audience 2", "Theme 3", "Style 4"],
        "tweets": [
            {"id": 1, "category": "Conversational", "text": f"Tweet text {i}"}
            for i in range(1, 11)
        ]
    }
    # Even if IDs in raw data were duplicates, validation ensures uniqueness
    raw_data["tweets"][1]["id"] = 1  # duplicate ID
    result = validate_and_parse_ai_output(raw_data)
    ids = [t.id for t in result.tweets]
    assert len(ids) == 10
    assert len(set(ids)) == 10  # All unique

def test_empty_tweet_rejection():
    """Test 9: Empty tweet rejection raises validation error."""
    raw_data = {
        "brand_name": "TestCo",
        "brand_voice_summary": ["Tone", "Audience", "Themes", "Style"],
        "tweets": [
            {"id": i, "category": "Conversational", "text": "Valid text"}
            for i in range(1, 10)
        ] + [{"id": 10, "category": "Community", "text": "   "}]
    }
    with pytest.raises(AIOutputValidationError):
        validate_and_parse_ai_output(raw_data)

def test_invalid_ai_response_bullet_count():
    """Test 10: Invalid AI response handling (wrong number of bullets or tweets)."""
    # Only 3 bullets instead of exactly 4
    bad_summary_data = {
        "brand_name": "TestCo",
        "brand_voice_summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
        "tweets": [{"id": i, "category": "Conversational", "text": f"T{i}"} for i in range(1, 11)]
    }
    with pytest.raises(AIOutputValidationError) as exc:
        validate_and_parse_ai_output(bad_summary_data)
    assert "exactly 4 bullet points" in str(exc.value)

    # Only 9 tweets instead of exactly 10
    bad_tweets_data = {
        "brand_name": "TestCo",
        "brand_voice_summary": ["1", "2", "3", "4"],
        "tweets": [{"id": i, "category": "Conversational", "text": f"T{i}"} for i in range(1, 10)]
    }
    with pytest.raises(AIOutputValidationError) as exc2:
        validate_and_parse_ai_output(bad_tweets_data)
    assert "Expected exactly 10 tweets" in str(exc2.value)

def test_character_limit_validation():
    """Test 14: Character-limit calculation and enforcement."""
    long_text = "This is a very long tweet sentence that goes on and on to test our character limit constraint validation. " * 3
    raw_data = {
        "brand_name": "TestCo",
        "brand_voice_summary": ["1", "2", "3", "4"],
        "tweets": [{"id": i, "category": "Conversational", "text": f"Normal tweet {i}"} for i in range(1, 10)] + [
            {"id": 10, "category": "Community", "text": long_text}
        ]
    }
    result = validate_and_parse_ai_output(raw_data, max_char_limit=280)
    for tweet in result.tweets:
        assert tweet.character_count is not None
        assert tweet.character_count <= 280
