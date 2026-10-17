from typing import Any, Dict, List
from app.schemas import GenerateResponse, TweetItem, TWEET_CATEGORIES

class AIOutputValidationError(Exception):
    """Raised when AI model response fails schema or business rules validation."""
    pass

def validate_and_parse_ai_output(data: Dict[str, Any], max_char_limit: int = 280, default_brand_name: str = "Brand") -> GenerateResponse:
    if not isinstance(data, dict):
        raise AIOutputValidationError("AI output is not a JSON object.")

    brand_name = data.get("brand_name")
    if not brand_name or not isinstance(brand_name, str) or not brand_name.strip():
        brand_name = default_brand_name

    # Validate brand_voice_summary
    summary = data.get("brand_voice_summary")
    if not isinstance(summary, list):
        raise AIOutputValidationError("brand_voice_summary must be a list of strings.")
    
    cleaned_summary = [str(item).strip() for item in summary if str(item).strip()]
    if len(cleaned_summary) != 4:
        raise AIOutputValidationError(f"brand_voice_summary must contain exactly 4 bullet points, got {len(cleaned_summary)}.")

    # Validate tweets
    tweets_raw = data.get("tweets")
    if not isinstance(tweets_raw, list):
        raise AIOutputValidationError("tweets must be a list of tweet objects.")

    if len(tweets_raw) != 10:
        raise AIOutputValidationError(f"Expected exactly 10 tweets, received {len(tweets_raw)}.")

    parsed_tweets: List[TweetItem] = []
    seen_ids = set()

    for idx, item in enumerate(tweets_raw, start=1):
        if not isinstance(item, dict):
            raise AIOutputValidationError(f"Tweet at index {idx} is not an object.")

        tweet_id = item.get("id")
        if tweet_id is None:
            tweet_id = idx
        elif not isinstance(tweet_id, int):
            try:
                tweet_id = int(tweet_id)
            except (ValueError, TypeError):
                tweet_id = idx

        if tweet_id in seen_ids:
            # Enforce unique IDs 1..10
            tweet_id = idx
        seen_ids.add(tweet_id)

        category = str(item.get("category", "")).strip()
        if not category:
            # Default category based on index
            cat_idx = (idx - 1) // 2
            category = TWEET_CATEGORIES[min(cat_idx, len(TWEET_CATEGORIES) - 1)]

        text = str(item.get("text", "")).strip()
        if not text:
            raise AIOutputValidationError(f"Tweet #{tweet_id} has empty text.")

        char_len = len(text)
        if char_len > max_char_limit:
            # Strictly trim at word boundary or exact character limit
            trimmed = text[:max_char_limit].rsplit(" ", 1)[0]
            text = trimmed if trimmed else text[:max_char_limit]
            char_len = len(text)

        parsed_tweets.append(TweetItem(
            id=tweet_id,
            category=category,
            text=text,
            character_count=char_len
        ))

    # Sort by ID
    parsed_tweets.sort(key=lambda t: t.id)

    return GenerateResponse(
        brand_name=brand_name.strip(),
        brand_voice_summary=cleaned_summary,
        tweets=parsed_tweets,
        is_demo_mode=False
    )
