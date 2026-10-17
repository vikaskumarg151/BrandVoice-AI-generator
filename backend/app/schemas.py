from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

CAMPAIGN_OBJECTIVES = [
    "Engagement",
    "Product Promotion",
    "Brand Awareness",
    "Education",
    "Product Launch",
    "Website Traffic",
    "Community Building",
]

ALLOWED_TONES = [
    "Professional",
    "Friendly",
    "Humorous",
    "Witty",
    "Premium",
    "Bold",
    "Informative",
    "Minimal",
    "Inspirational",
    "Conversational",
]

TWEET_CATEGORIES = [
    "Conversational",
    "Promotional",
    "Witty",
    "Informative",
    "Community",
]

class GenerateRequest(BaseModel):
    brand_name: Optional[str] = Field(default=None, max_length=100)
    industry: Optional[str] = Field(default=None, max_length=100)
    campaign_objective: str = Field(..., min_length=1, max_length=100)
    product_description: str = Field(..., min_length=3, max_length=2000)
    target_audience: Optional[str] = Field(default=None, max_length=300)
    preferred_tone: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    avoid_words: List[str] = Field(default_factory=list)
    language: str = Field(default="English", max_length=50)
    additional_instructions: Optional[str] = Field(default=None, max_length=1000)
    sample_posts: List[str] = Field(default_factory=list)
    max_character_limit: int = Field(default=280, ge=50, le=500)
    force_demo: bool = Field(default=False)

    @field_validator("campaign_objective")
    @classmethod
    def validate_objective(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Campaign objective cannot be empty or just whitespace.")
        return trimmed

    @field_validator("product_description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Product or service description cannot be empty or just whitespace.")
        if len(trimmed) < 3:
            raise ValueError("Product or service description must be at least 3 characters.")
        return trimmed

    @field_validator("sample_posts")
    @classmethod
    def validate_sample_posts(cls, v: List[str]) -> List[str]:
        cleaned = [s.strip() for s in v if s.strip()]
        return cleaned[:5]  # limit to max 5 sample posts


class TweetItem(BaseModel):
    id: int = Field(..., ge=1, le=10)
    category: str = Field(...)
    text: str = Field(..., min_length=1)
    character_count: Optional[int] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Tweet text cannot be empty.")
        return trimmed


class GenerateResponse(BaseModel):
    brand_name: str
    brand_voice_summary: List[str] = Field(..., min_length=4, max_length=4)
    tweets: List[TweetItem] = Field(..., min_length=10, max_length=10)
    is_demo_mode: bool = False


class RegenerateTweetRequest(BaseModel):
    brand_info: GenerateRequest
    existing_tweets: List[TweetItem] = Field(default_factory=list)
    tweet_id: int = Field(..., ge=1, le=10)


class RegenerateTweetResponse(BaseModel):
    tweet: TweetItem
    is_demo_mode: bool = False


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str = "production"
    openai_configured: bool = False
