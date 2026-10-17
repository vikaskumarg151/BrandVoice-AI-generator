import os
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import openai
from dotenv import load_dotenv

from app.schemas import (
    GenerateRequest,
    GenerateResponse,
    RegenerateTweetRequest,
    RegenerateTweetResponse,
    HealthResponse,
)
from app.services.ai_service import (
    generate_tweets_service,
    regenerate_tweet_service,
    get_openai_client,
)
from app.utils.validation import AIOutputValidationError

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("brandvoice_ai")

app = FastAPI(
    title="BrandVoice AI API",
    description="Backend API for AI-powered brand voice analysis and 10-tweet generation.",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_loc = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = str(err.get("msg", "Invalid value"))
        errors.append(f"{field_loc}: {msg}" if field_loc else msg)
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error: " + "; ".join(errors)},
    )

@app.exception_handler(AIOutputValidationError)
async def ai_validation_exception_handler(request, exc: AIOutputValidationError):
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"detail": f"AI Generation Validation Error: {str(exc)}"},
    )

@app.get("/api/health", response_model=HealthResponse)
async def get_health():
    client = get_openai_client()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=os.getenv("ENVIRONMENT", "development"),
        openai_configured=client is not None,
    )

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_tweets(req: GenerateRequest):
    try:
        response = await generate_tweets_service(req)
        return response
    except openai.AuthenticationError as auth_err:
        logger.warning(f"OpenAI Authentication Error ({str(auth_err)}): Falling back to Demo Mode")
        from app.services.ai_service import generate_mock_brand_voice_and_tweets
        return generate_mock_brand_voice_and_tweets(req)
    except openai.RateLimitError:
        logger.error("OpenAI Rate Limit reached")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OpenAI API rate limit exceeded. Please wait a moment and try again.",
        )
    except (openai.APITimeoutError, openai.APIConnectionError) as net_err:
        logger.error(f"Network error connecting to OpenAI: {str(net_err)}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Network error or timeout contacting AI provider. Please retry.",
        )
    except AIOutputValidationError as ve:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Unexpected error in /api/generate: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating tweets. Please try again.",
        )

@app.post("/api/regenerate-tweet", response_model=RegenerateTweetResponse)
async def regenerate_tweet(req: RegenerateTweetRequest):
    try:
        response = await regenerate_tweet_service(req)
        return response
    except Exception as e:
        logger.error(f"Error in /api/regenerate-tweet: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate tweet. Please try again.",
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
