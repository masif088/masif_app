import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'tracking-script.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error serving tracking script:', error);
    res.status(404).json({ message: 'Tracking script not found' });
  }
}

