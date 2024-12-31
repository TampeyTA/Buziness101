import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { sessionId } = req.query

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'Invalid session ID' })
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired session' })
    }

    res.status(200).json({ role: session.user.role })
  } catch (error) {
    console.error('Session check error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

