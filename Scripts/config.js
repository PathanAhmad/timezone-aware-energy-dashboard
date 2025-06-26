// Configuration file for environment variables
// This file is generated at build time by Render
// For local development, this file may be empty
// In production, it will contain: window.OPENAI_API_KEY = 'your_api_key_here';

// Local development fallback - this will be overridden in production
if (typeof window.OPENAI_API_KEY === 'undefined') {
    window.OPENAI_API_KEY = null;
}
