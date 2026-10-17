export type CampaignObjective =
  | 'Engagement'
  | 'Product Promotion'
  | 'Brand Awareness'
  | 'Education'
  | 'Product Launch'
  | 'Website Traffic'
  | 'Community Building';

export type TweetCategory =
  | 'Conversational'
  | 'Promotional'
  | 'Witty'
  | 'Informative'
  | 'Community';

export interface TweetItem {
  id: number;
  category: TweetCategory | string;
  text: string;
  character_count?: number;
}

export interface GenerateRequest {
  brand_name?: string;
  industry?: string;
  campaign_objective: CampaignObjective | string;
  product_description: string;
  target_audience?: string;
  preferred_tone: string[];
  keywords: string[];
  avoid_words: string[];
  language: string;
  additional_instructions?: string;
  sample_posts: string[];
  max_character_limit: number;
  force_demo?: boolean;
}

export interface GenerateResponse {
  brand_name: string;
  brand_voice_summary: string[];
  tweets: TweetItem[];
  is_demo_mode: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  formatted_date: string;
  brand_name: string;
  campaign_objective: string;
  brand_voice_summary: string[];
  tweets: TweetItem[];
  request_payload: GenerateRequest;
  is_demo_mode: boolean;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  openai_configured: boolean;
}
