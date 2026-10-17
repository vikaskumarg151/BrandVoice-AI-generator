import { GenerateRequest } from '../types';

export interface BrandPreset {
  id: string;
  name: string;
  industry: string;
  data: GenerateRequest;
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'eco-tumbler',
    name: 'TerraBrew (Eco & Food)',
    industry: 'Food & Beverage',
    data: {
      brand_name: 'TerraBrew',
      industry: 'Food & Beverage / Sustainability',
      campaign_objective: 'Product Launch',
      product_description: 'An insulated ceramic-lined travel coffee tumbler crafted from 100% recycled aerospace-grade aluminum. Keeps brews piping hot for 12 hours without metallic aftertaste.',
      target_audience: 'Specialty coffee lovers, urban commuters, and sustainability-conscious creators.',
      preferred_tone: ['Friendly', 'Inspirational', 'Conversational'],
      keywords: ['morning ritual', 'ceramic lined', 'zero waste'],
      avoid_words: ['cheap', 'disposable', 'plastic', 'miracle'],
      language: 'English',
      additional_instructions: 'Focus on the tactile luxury of morning coffee and mindful living.',
      sample_posts: [
        'Great coffee isn’t rushed. Neither is great design.',
        'Your daily brew deserves better than a plastic liner that ruins the finish.'
      ],
      max_character_limit: 280,
    },
  },
  {
    id: 'dev-platform',
    name: 'VoxelCloud (Tech SaaS)',
    industry: 'Technology',
    data: {
      brand_name: 'VoxelCloud',
      industry: 'Developer Tools & Cloud',
      campaign_objective: 'Engagement',
      product_description: 'Instant edge-deployments and serverless distributed databases with sub-10ms global latency and zero cold starts for frontend teams.',
      target_audience: 'Full-stack engineers, tech founders, and DevOps leaders.',
      preferred_tone: ['Bold', 'Witty', 'Informative'],
      keywords: ['zero cold starts', 'sub-10ms latency', 'edge deploy'],
      avoid_words: ['synergy', 'game-changing', 'disrupt'],
      language: 'English',
      additional_instructions: 'Keep it relatable for developers who hate slow CI/CD pipelines.',
      sample_posts: [
        'Shipping to prod on Friday because your rollback is literally one click away.',
        'Cold starts are 2018 energy. Stop making your users wait.'
      ],
      max_character_limit: 280,
    },
  },
  {
    id: 'fitness-wear',
    name: 'Aether Athletics (Fitness)',
    industry: 'Fitness & Apparel',
    data: {
      brand_name: 'Aether Athletics',
      industry: 'Activewear & Fitness',
      campaign_objective: 'Brand Awareness',
      product_description: 'Seamless ergonomic compression activewear built with sweat-wicking silver-ion antimicrobial thread for marathoners and powerlifters.',
      target_audience: 'Hybrid athletes, marathon runners, and dedicated gym regulars.',
      preferred_tone: ['Inspirational', 'Bold', 'Minimal'],
      keywords: ['train relentless', 'antimicrobial', 'zero chafing'],
      avoid_words: ['easy fix', 'magic', 'instant'],
      language: 'English',
      additional_instructions: 'Empowering, disciplined, no-nonsense athletic mindset.',
      sample_posts: [
        'The workout doesn’t get easier. Your discipline just gets quieter.',
        'Built for the 5 AM miles when the city is still asleep.'
      ],
      max_character_limit: 280,
    },
  },
  {
    id: 'edtech-math',
    name: 'Luminary Academy (Education)',
    industry: 'Education & EdTech',
    data: {
      brand_name: 'Luminary Academy',
      industry: 'Education',
      campaign_objective: 'Education',
      product_description: 'Interactive visual mathematics curriculum designed for high schoolers to master calculus and physics through hands-on simulations.',
      target_audience: 'Curious students, STEM educators, and parents.',
      preferred_tone: ['Informative', 'Friendly', 'Inspirational'],
      keywords: ['visual intuition', 'STEM mastery', 'hands-on simulation'],
      avoid_words: ['hard', 'impossible', 'memorize'],
      language: 'English',
      additional_instructions: 'Make complex concepts feel intuitive and fascinating rather than intimidating.',
      sample_posts: [
        'If you hated calculus, nobody showed you what the curve was actually doing.',
        'Math isn’t memorization; it’s learning how to look at the universe with high-res glasses.'
      ],
      max_character_limit: 280,
    },
  },
];
