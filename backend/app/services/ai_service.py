import os
import json
import logging
from typing import Optional, Dict, Any, List
import openai
from dotenv import load_dotenv

from app.schemas import (
    GenerateRequest,
    GenerateResponse,
    TweetItem,
    RegenerateTweetRequest,
    RegenerateTweetResponse,
    TWEET_CATEGORIES,
)
from app.services.prompts import (
    build_system_prompt,
    build_user_prompt,
    build_regeneration_prompt,
)
from app.utils.validation import validate_and_parse_ai_output, AIOutputValidationError

load_dotenv()
logger = logging.getLogger("brandvoice_ai")

def get_openai_client() -> Optional[openai.OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None
    # Filter out common placeholders or invalid dummy keys
    if api_key in ["your-openai-api-key-here", "MY_OPENAI_API_KEY", "sk-...", "sk-proj-..."] or len(api_key) < 20 or not api_key.startswith("sk-"):
        logger.info(f"OPENAI_API_KEY '{api_key[:8]}...' does not match valid OpenAI key format. Defaulting to Demo Mode.")
        return None
    return openai.OpenAI(api_key=api_key)

def get_model_name() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")

def generate_mock_brand_voice_and_tweets(req: GenerateRequest) -> GenerateResponse:
    """Generate high-quality, authentic brand voice analysis and 10 structured tweets for Demo Mode."""
    brand = req.brand_name.strip() if req.brand_name else "Brand"
    tones = ", ".join(req.preferred_tone) if req.preferred_tone else "authentic and strategic"
    objective = req.campaign_objective
    product = req.product_description.strip()
    audience = req.target_audience.strip() if req.target_audience else "modern digital consumers"
    
    summary = [
        f"Tone & Personality: {tones.capitalize()}, balancing professional credibility with an approachable, magnetic energy.",
        f"Target Audience: Primarily {audience}, seeking practical transformation and high-trust solutions.",
        f"Core Themes: Focusing on {objective.lower()}, overcoming friction points in {product[:45]}..., and actionable community dialogue.",
        f"Messaging Style: Direct, fluff-free hooks paired with engaging conversational calls to action."
    ]

    # Pre-crafted dynamic templates adapted to user input
    kw = req.keywords[0] if req.keywords else "excellence"
    
    # 2 Conversational, 2 Promotional, 2 Witty, 2 Informative, 2 Community
    tweets = [
        # Conversational
        TweetItem(
            id=1,
            category="Conversational",
            text=f"Most people think {product[:35]} has to be complicated. What if the simpler path actually gave you better results?",
            character_count=118
        ),
        TweetItem(
            id=2,
            category="Conversational",
            text=f"The best brand moments don't feel like marketing. They feel like a candid conversation with someone who gets it. Who's with us?",
            character_count=133
        ),
        # Promotional
        TweetItem(
            id=3,
            category="Promotional",
            text=f"Built for {audience}: our latest approach to {product[:40]} is designed to help you drive real {objective.lower()} without the headache.",
            character_count=141
        ),
        TweetItem(
            id=4,
            category="Promotional",
            text=f"Ready to elevate your everyday workflow? Discover how {brand} helps you achieve {kw} with fewer steps and greater impact.",
            character_count=132
        ),
        # Witty
        TweetItem(
            id=5,
            category="Witty",
            text=f"Your competitors are still sending 40-slide decks. Meanwhile, you're using {brand} to get straight to the point.",
            character_count=116
        ),
        TweetItem(
            id=6,
            category="Witty",
            text=f"Coffee: consumed. Distractions: silenced. Unlocking true {kw}: in progress. Just another Tuesday in our universe.",
            character_count=119
        ),
        # Informative
        TweetItem(
            id=7,
            category="Informative",
            text=f"Quick strategy tip: When targeting {objective.lower()}, focus on clarifying one high-value outcome before expanding your scope. Less noise, more traction.",
            character_count=164
        ),
        TweetItem(
            id=8,
            category="Informative",
            text=f"Did you know? Clear, consistent brand messaging outperforms fragmented hype by over 3x in sustained recall. Clarity is your ultimate growth lever.",
            character_count=159
        ),
        # Community
        TweetItem(
            id=9,
            category="Community",
            text=f"Question for our community: What is the single biggest bottleneck you face right now with {product[:30]}? Drop your thoughts below 👇",
            character_count=139
        ),
        TweetItem(
            id=10,
            category="Community",
            text=f"To everyone building something meaningful this week: what win are you most proud of? Let's celebrate each other in the replies.",
            character_count=138
        )
    ]

    # Calculate exact character counts
    for t in tweets:
        t.character_count = len(t.text)

    return GenerateResponse(
        brand_name=brand,
        brand_voice_summary=summary,
        tweets=tweets,
        is_demo_mode=True
    )

def generate_mock_single_tweet(
    brand_req: GenerateRequest,
    target_id: int,
    category: str
) -> TweetItem:
    brand = brand_req.brand_name or "Brand"
    product = brand_req.product_description[:30]
    
    mock_replacements = {
        "Conversational": f"Here is a candid thought: sometimes the quietest updates in your {product} strategy create the loudest positive impact. Agree or disagree?",
        "Promotional": f"Say goodbye to friction. {brand} brings speed, clarity, and precision to your daily routine. Experience the difference today.",
        "Witty": f"Nobody said managing {product} was easy, but doing it the old-fashioned way is definitely a choice.",
        "Informative": f"Actionable insight: The secret to sustained engagement isn't posting more—it's speaking directly to your audience's core frustration.",
        "Community": f"Over to you: What's one feature or tip you wish you knew earlier when getting started with {product}? Share below!"
    }
    
    text = mock_replacements.get(category, f"Fresh perspective on {product} from {brand}. What do you think?")
    return TweetItem(
        id=target_id,
        category=category,
        text=text,
        character_count=len(text)
    )

async def generate_tweets_service(req: GenerateRequest) -> GenerateResponse:
    if getattr(req, "force_demo", False):
        logger.info("force_demo is True. Using Demo Mode generator.")
        return generate_mock_brand_voice_and_tweets(req)

    client = get_openai_client()
    
    # If no OpenAI client or key configured, gracefully fall back to Demo Mode with rich sample output
    if client is None:
        logger.info("OPENAI_API_KEY is not set or invalid. Using Demo Mode generator.")
        return generate_mock_brand_voice_and_tweets(req)

    model_name = get_model_name()
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(req)

    # Attempt generation with retry for JSON validation
    last_err: Optional[Exception] = None
    for attempt in range(2):
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=2000,
                timeout=45.0
            )

            raw_content = completion.choices[0].message.content
            if not raw_content:
                raise AIOutputValidationError("AI model returned empty response content.")

            parsed_json = json.loads(raw_content)
            result = validate_and_parse_ai_output(
                parsed_json,
                max_char_limit=req.max_character_limit,
                default_brand_name=req.brand_name or "Brand"
            )
            result.is_demo_mode = False
            return result

        except openai.AuthenticationError as auth_err:
            logger.warning(f"OpenAI Authentication Error ({str(auth_err)}). Falling back to Demo Mode.")
            return generate_mock_brand_voice_and_tweets(req)
        except (openai.RateLimitError, openai.APIConnectionError, openai.APITimeoutError) as api_err:
            logger.error(f"OpenAI API Error: {str(api_err)}")
            raise api_err
        except (json.JSONDecodeError, AIOutputValidationError) as val_err:
            logger.warning(f"Attempt {attempt + 1} validation failed: {str(val_err)}. Retrying if attempts remain...")
            last_err = val_err
        except Exception as general_err:
            logger.error(f"Unexpected AI error: {str(general_err)}")
            last_err = general_err

    # If retries fail
    raise AIOutputValidationError(f"Failed to generate valid brand voice and tweets: {str(last_err)}")

async def regenerate_tweet_service(req: RegenerateTweetRequest) -> RegenerateTweetResponse:
    client = get_openai_client()
    
    # Determine the category for the target tweet
    target_category = "Conversational"
    for t in req.existing_tweets:
        if t.id == req.tweet_id:
            target_category = t.category
            break

    if client is None:
        logger.info("OPENAI_API_KEY is not set. Regenerating tweet in Demo Mode.")
        replacement = generate_mock_single_tweet(req.brand_info, req.tweet_id, target_category)
        return RegenerateTweetResponse(tweet=replacement, is_demo_mode=True)

    model_name = get_model_name()
    prompt = build_regeneration_prompt(req.brand_info, req.existing_tweets, req.tweet_id, target_category)

    try:
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are BrandVoice AI. You write high-performing social copy adhering strictly to brand guidelines and JSON output."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
            max_tokens=400,
            timeout=25.0
        )
        content = completion.choices[0].message.content or "{}"
        data = json.loads(content)
        
        tweet_text = str(data.get("text", "")).strip()
        if not tweet_text:
            raise AIOutputValidationError("Regenerated tweet text was empty.")

        if len(tweet_text) > req.brand_info.max_character_limit:
            tweet_text = tweet_text[:req.brand_info.max_character_limit].rsplit(" ", 1)[0]

        new_tweet = TweetItem(
            id=req.tweet_id,
            category=target_category,
            text=tweet_text,
            character_count=len(tweet_text)
        )
        return RegenerateTweetResponse(tweet=new_tweet, is_demo_mode=False)

    except Exception as e:
        logger.error(f"Error during tweet regeneration: {str(e)}")
        # Graceful fallback so user doesn't get blocked
        fallback = generate_mock_single_tweet(req.brand_info, req.tweet_id, target_category)
        return RegenerateTweetResponse(tweet=fallback, is_demo_mode=True)
