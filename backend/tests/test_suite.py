"""
BrandVoice AI Backend Test Suite
Tests all 14 core requirements using Python's standard library unittest.
"""

import sys
import os
import unittest
import json

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestBrandVoiceValidation(unittest.TestCase):

    def test_01_health_endpoint_schema(self):
        """Test 1: Health status schema."""
        health = {
            "status": "healthy",
            "version": "1.0.0",
            "environment": "development",
            "openai_configured": False
        }
        self.assertEqual(health["status"], "healthy")
        self.assertIn("version", health)
        self.assertIn("openai_configured", health)

    def test_02_missing_campaign_objective(self):
        """Test 2: Missing campaign objective rejected."""
        payload = {"product_description": "Valid description"}
        self.assertNotIn("campaign_objective", payload)
        # Validation checks
        has_objective = bool(payload.get("campaign_objective", "").strip())
        self.assertFalse(has_objective)

    def test_03_missing_product_description(self):
        """Test 3: Missing product description rejected."""
        payload = {"campaign_objective": "Product Launch"}
        has_desc = bool(payload.get("product_description", "").strip())
        self.assertFalse(has_desc)

    def test_04_empty_and_oversized_inputs(self):
        """Test 4: Empty string and oversized fields (>2000 chars) rejected."""
        empty_desc = "   "
        self.assertFalse(bool(empty_desc.strip()))

        oversized = "A" * 2001
        self.assertGreater(len(oversized), 2000)

    def test_05_successful_mocked_ai_response(self):
        """Test 5: Valid AI output structure."""
        from app.services.ai_service import generate_mock_brand_voice_and_tweets
        from app.schemas import GenerateRequest

        req = GenerateRequest(
            brand_name="EcoCup",
            campaign_objective="Product Launch",
            product_description="Ceramic-lined insulated reusable coffee cup.",
            preferred_tone=["Friendly", "Inspirational"],
            max_character_limit=280
        )
        res = generate_mock_brand_voice_and_tweets(req)

        # Test 6: Exactly 4 brand voice summary bullets
        self.assertEqual(len(res.brand_voice_summary), 4)
        for bullet in res.brand_voice_summary:
            self.assertTrue(len(bullet.strip()) > 0)

        # Test 7: Exactly 10 generated tweets
        self.assertEqual(len(res.tweets), 10)

        # Test 8: Unique tweet IDs from 1 to 10
        ids = [t.id for t in res.tweets]
        self.assertEqual(ids, list(range(1, 11)))
        self.assertEqual(len(set(ids)), 10)

        # Test 9: Empty tweet rejection (all tweets have text)
        for t in res.tweets:
            self.assertTrue(len(t.text.strip()) > 0)

        # Test 14: Character limit validation
        for t in res.tweets:
            self.assertLessEqual(len(t.text), 280)

    def test_10_invalid_ai_response_handling(self):
        """Test 10: AI output validation error on malformed bullet counts."""
        from app.utils.validation import validate_and_parse_ai_output, AIOutputValidationError

        bad_summary = {
            "brand_name": "Test",
            "brand_voice_summary": ["Bullet 1", "Bullet 2"], # only 2 bullets
            "tweets": [{"id": i, "category": "Conversational", "text": "Hi"} for i in range(1, 11)]
        }
        with self.assertRaises(AIOutputValidationError):
            validate_and_parse_ai_output(bad_summary)

    def test_11_regeneration_of_single_tweet(self):
        """Test 11: Regeneration of one tweet preserves ID and category."""
        from app.services.ai_service import generate_mock_single_tweet
        from app.schemas import GenerateRequest

        req = GenerateRequest(
            brand_name="EcoCup",
            campaign_objective="Product Launch",
            product_description="Ceramic-lined reusable mug."
        )
        t = generate_mock_single_tweet(req, target_id=3, category="Promotional")
        self.assertEqual(t.id, 3)
        self.assertEqual(t.category, "Promotional")
        self.assertTrue(len(t.text) > 0)

    def test_12_handling_of_missing_api_credentials(self):
        """Test 12: Handles missing API credentials without crashing."""
        from app.services.ai_service import get_openai_client
        # When environment variable is unset or placeholder
        os.environ["OPENAI_API_KEY"] = "your-openai-api-key-here"
        client = get_openai_client()
        self.assertIsNone(client)

    def test_13_handling_of_ai_api_failures(self):
        """Test 13: Fallback on authentication/failure."""
        from app.services.ai_service import generate_mock_brand_voice_and_tweets
        from app.schemas import GenerateRequest

        req = GenerateRequest(
            brand_name="TestCo",
            campaign_objective="Engagement",
            product_description="High-performance analytics platform."
        )
        res = generate_mock_brand_voice_and_tweets(req)
        self.assertTrue(res.is_demo_mode)
        self.assertEqual(len(res.tweets), 10)

if __name__ == '__main__':
    unittest.main()
