/**
 * Discord Message Embed Field
 */
export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * Discord Message Embed Footer
 */
export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

/**
 * Discord Message Embed Author
 */
export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

/**
 * Discord Message Embed
 */
export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number; // Decimal color value
  timestamp?: string;
  fields?: DiscordEmbedField[];
  author?: DiscordEmbedAuthor;
  footer?: DiscordEmbedFooter;
  thumbnail?: { url: string };
  image?: { url: string };
}

/**
 * Discord Webhook Message
 */
export interface DiscordWebhookMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
}

/**
 * Discord Message Options
 */
export interface DiscordMessageOptions {
  webhookUrl: string;
  retryAttempts?: number;
  retryDelay?: number;
}
