import { NextApiRequest, NextApiResponse } from 'next';
import { createToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, adminCode } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      // Check if there are already 3 active users
      const activeUsers = await prisma.user.count();
      if (activeUsers >= 3) {
        return res.status(403).json({ message: 'Maximum number of users reached' });
      }

      // Create a new user
      user = await prisma.user.create({
        data: {
          username,
          role: adminCode === process.env.ADMIN_CODE ? 'admin' : 'user',
        },
      });
    } else if (adminCode === process.env.ADMIN_CODE && user.role !== 'admin') {
      // Update existing user to admin if correct admin code is provided
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });
    }

    const token = await createToken({ userId: user.id, role: user.role });
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    res.status(200).json({ message: 'Logged in successfully', role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}