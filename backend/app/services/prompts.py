from typing import List, Optional
from app.schemas import GenerateRequest, TweetItem

def build_system_prompt() -> str:
    return """You are BrandVoice AI, an expert social media strategist, brand voice analyst, and copywriter.
Your task is to analyze the provided brand inputs and generate an authentic, strategic brand voice summary and exactly 10 high-performing, distinct tweets.

CRITICAL GUIDELINES:
1. Brand Voice Summary:
   - Provide EXACTLY 4 concise, high-impact bullet points summarizing:
     a) Tone & Personality
     b) Target Audience & Emotional Hooks
     c) Content Themes & Messaging Angles
     d) Writing Style, Vocabulary & CTA Style
   - If the brand name is provided without verified social media samples, treat this as an informed inference rather than verified knowledge.
   - If no brand name is supplied, infer the brand voice entirely from the product and audience details.
   - Do NOT invent fabricated brand facts, non-existent offers, false discounts, fake testimonials, or unsupported statistics.

2. Exactly 10 Original Tweets across 5 Required Categories (EXACTLY 2 PER CATEGORY):
   - ID 1-2: Category "Conversational" (engaging, relatable, conversational hook)
   - ID 3-4: Category "Promotional" (value proposition, product highlight, clear non-pushy CTA)
   - ID 5-6: Category "Witty" (humorous, sharp, playful, brand-safe wit)
   - ID 7-8: Category "Informative" (actionable tip, educational insight, problem-solving value)
   - ID 9-10: Category "Community" (thought-provoking question, poll prompt, audience discussion)

3. Format and Style Requirements:
   - Every tweet MUST match the inferred brand voice and respect the character limit.
   - Tweets must be distinct from one another. Avoid repetitive openings, identical hooks, or cloned CTAs.
   - Sound natural and human, not robotic.
   - Use hashtags sparingly and only when organically appropriate (maximum 1-2 per tweet, or none).
   - Never fabricate URLs or specific unverified pricing.
   - Strictly adhere to specified keywords, avoid-words, and language.

Return ONLY valid JSON matching the exact schema requested.
"""

def build_user_prompt(req: GenerateRequest) -> str:
    prompt_lines = [
        f"Brand Name: {req.brand_name if req.brand_name else 'Unspecified (Infer identity from product)'}",
        f"Industry / Category: {req.industry if req.industry else 'Unspecified'}",
        f"Campaign Objective: {req.campaign_objective}",
        f"Product / Service Description: {req.product_description}",
        f"Target Audience: {req.target_audience if req.target_audience else 'General consumer / relevant demographic'}",
        f"Preferred Tones: {', '.join(req.preferred_tone) if req.preferred_tone else 'Natural, engaging, and professional'}",
        f"Language: {req.language}",
        f"Max Character Limit Per Tweet: {req.max_character_limit} characters (including spaces & hashtags)",
    ]

    if req.keywords:
        prompt_lines.append(f"Keywords to weave in naturally: {', '.join(req.keywords)}")

    if req.avoid_words:
        prompt_lines.append(f"Words / Topics to strictly AVOID: {', '.join(req.avoid_words)}")

    if req.additional_instructions:
        prompt_lines.append(f"Additional Instructions: {req.additional_instructions}")

    if req.sample_posts:
        prompt_lines.append("Reference Brand Sample Posts (analyze tone/rhythm, do NOT copy verbatim):")
        for i, post in enumerate(req.sample_posts, start=1):
            prompt_lines.append(f"  Sample {i}: \"{post}\"")

    prompt_lines.append("\nPlease output the response as JSON containing:")
    prompt_lines.append("- brand_name (string)")
    prompt_lines.append("- brand_voice_summary (array of EXACTLY 4 bullet strings)")
    prompt_lines.append("- tweets (array of EXACTLY 10 objects, each with 'id' [1..10], 'category' ['Conversational'|'Promotional'|'Witty'|'Informative'|'Community'], and 'text' [string])")

    return "\n".join(prompt_lines)

def build_regeneration_prompt(
    brand_req: GenerateRequest,
    existing_tweets: List[TweetItem],
    target_id: int,
    category: str
) -> str:
    other_tweets_summary = []
    for t in existing_tweets:
        if t.id != target_id:
            other_tweets_summary.append(f"- [ID {t.id} - {t.category}]: {t.text}")

    existing_context = "\n".join(other_tweets_summary[:9])

    return f"""You need to regenerate a single tweet (ID {target_id}) for the following brand:
Brand Name: {brand_req.brand_name or 'Brand'}
Campaign Objective: {brand_req.campaign_objective}
Product: {brand_req.product_description}
Target Audience: {brand_req.target_audience or 'General'}
Tone: {', '.join(brand_req.preferred_tone) if brand_req.preferred_tone else 'Brand aligned'}
Language: {brand_req.language}
Required Category: {category}
Max Character Limit: {brand_req.max_character_limit} characters

Keywords to include: {', '.join(brand_req.keywords) if brand_req.keywords else 'None'}
Words to avoid: {', '.join(brand_req.avoid_words) if brand_req.avoid_words else 'None'}

Here are the other tweets in this collection (the new tweet MUST be fresh, distinct, and not repeat their hooks):
{existing_context}

Please generate ONLY one replacement tweet for ID {target_id} in category "{category}".
Respond in JSON format:
{{
  "id": {target_id},
  "category": "{category}",
  "text": "New replacement tweet text here"
}}
"""
