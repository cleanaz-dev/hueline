import OpenAI from 'openai'

export const moonshot = new OpenAI({
  apiKey: process.env['MOONSHOT_API_KEY'],
  baseURL: "https://api.moonshot.ai/v1"
}) 

