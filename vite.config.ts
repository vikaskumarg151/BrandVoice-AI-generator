import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'brandvoice-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body for POST requests
        let body: any = {};
        if (req.method === 'POST') {
          try {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            if (dataStr) {
              body = JSON.parse(dataStr);
            }
          } catch (e) {
            body = {};
          }
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/health' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'healthy',
              version: '1.0.0',
              environment: 'development',
              openai_configured: Boolean(
                process.env.OPENAI_API_KEY &&
                  process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
              ),
            })
          );
        }

        if (req.url === '/api/generate' && req.method === 'POST') {
          const brand = body.brand_name?.trim() || 'Brand';
          const tones = body.preferred_tone?.length
            ? body.preferred_tone.join(', ')
            : 'authentic & strategic';
          const objective = body.campaign_objective || 'Engagement';
          const product = (body.product_description || 'innovative product').trim();
          const audience = body.target_audience?.trim() || 'modern digital audience';
          const kw = body.keywords?.[0] || 'efficiency';

          const brandVoiceSummary = [
            `Tone & Personality: ${
              tones.charAt(0).toUpperCase() + tones.slice(1)
            }, balancing authority with approachable energy.`,
            `Target Audience: Primarily ${audience}, seeking practical transformation and high-trust solutions.`,
            `Core Themes: Emphasizing ${objective.toLowerCase()}, overcoming friction in ${product.slice(
              0,
              45
            )}..., and actionable community dialogue.`,
            `Messaging Style: Direct, fluff-free hooks paired with engaging conversational calls to action.`,
          ];

          const tweets = [
            {
              id: 1,
              category: 'Conversational',
              text: `Most people think ${product.slice(
                0,
                35
              )} has to be complicated. What if the simpler path actually gave you better results?`,
            },
            {
              id: 2,
              category: 'Conversational',
              text: `The best brand moments don't feel like marketing. They feel like a candid conversation with someone who gets it. Who's with us?`,
            },
            {
              id: 3,
              category: 'Promotional',
              text: `Built for ${audience}: our latest approach to ${product.slice(
                0,
                40
              )} helps you drive real ${objective.toLowerCase()} without the headache.`,
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
              text: `Question for our community: What is the single biggest bottleneck you face right now with ${product.slice(
                0,
                30
              )}? Drop your thoughts below 👇`,
            },
            {
              id: 10,
              category: 'Community',
              text: `To everyone building something meaningful this week: what win are you most proud of? Let's celebrate each other in the replies.`,
            },
          ].map((t) => ({ ...t, character_count: t.text.length }));

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              brand_name: brand,
              brand_voice_summary: brandVoiceSummary,
              tweets,
              is_demo_mode: true,
            })
          );
        }

        if (req.url === '/api/regenerate-tweet' && req.method === 'POST') {
          const { tweet_id = 1, brand_info = {} } = body || {};
          const brand = brand_info.brand_name || 'Brand';
          const product = brand_info.product_description?.slice(0, 30) || 'product';
          const text = `Fresh perspective on ${product} from ${brand}. Streamlined, authentic, and built for real engagement.`;

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              tweet: {
                id: tweet_id,
                category: 'Conversational',
                text,
                character_count: text.length,
              },
              is_demo_mode: true,
            })
          );
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
