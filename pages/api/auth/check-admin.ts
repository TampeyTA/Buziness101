import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the token from the cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ isAdmin: false });
  }

  try {
    const tokenData = await verifyToken(token);
    if (!tokenData) {
      return res.status(401).json({ isAdmin: false });
    }

    res.status(200).json({ isAdmin: tokenData.role === 'admin' });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ isAdmin: false });
  }
}

