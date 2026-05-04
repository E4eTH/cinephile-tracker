import { Handler } from '@netlify/functions';
import crypto from 'crypto';

export const handler: Handler = async (event) => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!apiSecret || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Cloudinary credentials not configured on server' }),
    };
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params: any = {
      timestamp: timestamp,
      upload_preset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cinephile',
    };

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // Append API Secret
    const toSign = signatureString + apiSecret;

    // Create SHA1 hash
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    return {
      statusCode: 200,
      body: JSON.stringify({
        signature,
        timestamp,
        apiKey,
        uploadPreset: params.upload_preset,
        cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate signature' }),
    };
  }
};
