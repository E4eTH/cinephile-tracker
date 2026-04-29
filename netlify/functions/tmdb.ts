/// <reference types="node" />
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const { endpoint, ...queryParams } = event.queryStringParameters || {};
  const apiKey = process.env.TMDB_API_KEY;

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing endpoint parameter' }),
    };
  }

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TMDB API key not configured on server' }),
    };
  }

  try {
    const searchParams = new URLSearchParams();
    searchParams.append('api_key', apiKey);
    
    // Add all other query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = `https://api.themoviedb.org/3/${endpoint}?${searchParams.toString()}`;
    // Using globalThis.fetch for better compatibility in Node environments
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error in TMDB function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
