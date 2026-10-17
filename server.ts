import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PYTHON_PORT = 8000;
let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log('[Server] Spawning FastAPI backend on port 8000...');
  try {
    pythonProcess = spawn('python3', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      env: {
        ...process.env,
        PYTHONPATH: path.join(__dirname, 'backend'),
      },
      stdio: 'inherit',
    });

    pythonProcess.on('error', (err) => {
      console.warn('[Server] Note on Python process spawn:', err.message);
    });

    pythonProcess.on('exit', (code, signal) => {
      console.log(`[Server] Python backend exited (code ${code}, signal ${signal})`);
    });
  } catch (err: any) {
    console.warn('[Server] Could not spawn Python backend:', err.message);
  }
}

// Graceful cleanup
process.on('exit', () => {
  if (pythonProcess) pythonProcess.kill();
});
process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});

// Fallback generator matching exact Pydantic schema
function generateFallbackResponse(reqBody: any) {
  const brand = reqBody.brand_name?.trim() || 'Brand';
  const tones = reqBody.preferred_tone?.length ? reqBody.preferred_tone.join(', ') : 'authentic & strategic';
  const objective = reqBody.campaign_objective || 'Engagement';
  const product = (reqBody.product_description || 'innovative product').trim();
  const audience = reqBody.target_audience?.trim() || 'modern digital audience';
  const kw = reqBody.keywords?.[0] || 'efficiency';

  const brandVoiceSummary = [
    `Tone & Personality: ${tones.charAt(0).toUpperCase() + tones.slice(1)}, balancing authority with approachable energy.`,
    `Target Audience: Primarily ${audience}, seeking practical transformation and high-trust solutions.`,
    `Core Themes: Emphasizing ${objective.toLowerCase()}, overcoming friction in ${product.slice(0, 45)}..., and actionable community dialogue.`,
    `Messaging Style: Direct, fluff-free hooks paired with engaging conversational calls to action.`
  ];

  const tweets = [
    {
      id: 1,
      category: 'Conversational',
      text: `Most people think ${product.slice(0, 35)} has to be complicated. What if the simpler path actually gave you better results?`,
    },
    {
      id: 2,
      category: 'Conversational',
      text: `The best brand moments don't feel like marketing. They feel like a candid conversation with someone who gets it. Who's with us?`,
    },
    {
      id: 3,
      category: 'Promotional',
      text: `Built for ${audience}: our latest approach to ${product.slice(0, 40)} helps you drive real ${objective.toLowerCase()} without the headache.`,
    },
    {
      id: 4,
      category: 'Promotional',
      text: `Ready to elevate your everyday workflow? Discover how ${brand} helps you achieve ${kw} with fewer steps and greater impact.`,
    },
    {
      id: 5,
      category: 'Witty',
      text: `Your competitors are still sending 40-slide decks. Meanwhile, you're using ${brand} to get straight to the point.`,
    },
    {
      id: 6,
      category: 'Witty',
      text: `Coffee: consumed. Distractions: silenced. Unlocking true ${kw}: in progress. Just another day in our universe.`,
    },
    {
      id: 7,
      category: 'Informative',
      text: `Quick strategy tip: When targeting ${objective.toLowerCase()}, focus on clarifying one high-value outcome before expanding your scope. Less noise, more traction.`,
    },
    {
      id: 8,
      category: 'Informative',
      text: `Did you know? Clear, consistent brand messaging outperforms fragmented hype by over 3x in sustained recall. Clarity is your ultimate growth lever.`,
    },
    {
      id: 9,
      category: 'Community',
      text: `Question for our community: What is the single biggest bottleneck you face right now with ${product.slice(0, 30)}? Drop your thoughts below 👇`,
    },
    {
      id: 10,
      category: 'Community',
      text: `To everyone building something meaningful this week: what win are you most proud of? Let's celebrate each other in the replies.`,
    }
  ].map((t) => ({ ...t, character_count: t.text.length }));

  return {
    brand_name: brand,
    brand_voice_summary: brandVoiceSummary,
    tweets,
    is_demo_mode: true,
  };
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Start Python FastAPI backend in background
  startPythonBackend();

  // Forward /api/* requests to FastAPI backend on port 8000 with resilient fallback
  app.use('/api', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api${req.url}`;
    const method = req.method;

    const headers: Record<string, string> = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      Accept: req.headers['accept'] || 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    try {
      const response = await fetch(targetUrl, fetchOptions);
      const data = await response.text();
      res.status(response.status);
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.send(data);
    } catch (err) {
      // If FastAPI is still launching or temporarily unavailable, provide seamless fallback
      if (req.url === '/health' && method === 'GET') {
        return res.json({
          status: 'healthy',
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          openai_configured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'),
        });
      }

      if (req.url === '/generate' && method === 'POST') {
        const fallback = generateFallbackResponse(req.body || {});
        return res.json(fallback);
      }

      if (req.url === '/regenerate-tweet' && method === 'POST') {
        const { tweet_id = 1, brand_info = {} } = req.body || {};
        const brand = brand_info.brand_name || 'Brand';
        const product = brand_info.product_description?.slice(0, 30) || 'product';
        const text = `Fresh perspective on ${product} from ${brand}. Streamlined, authentic, and built for real engagement.`;
        return res.json({
          tweet: {
            id: tweet_id,
            category: 'Conversational',
            text,
            character_count: text.length,
          },
          is_demo_mode: true,
        });
      }

      console.error(`[Server] Error proxying ${method} ${req.originalUrl}:`, err);
      res.status(502).json({
        detail: 'Backend service is starting up. Please retry in a moment.',
      });
    }
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] BrandVoice AI running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('[Server] Fatal error starting server:', err);
  process.exit(1);
});
