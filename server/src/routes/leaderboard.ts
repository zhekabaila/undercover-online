import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const { role } = req.query;

  try {
    // 1. Group by userId and count wins
    const winners = await prisma.gameHistory.groupBy({
      by: ['userId'],
      where: { 
        isWinner: true,
        ...(role ? { role: String(role) } : {}) 
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 20,
    });

    if (winners.length === 0) {
      return res.json({ leaderboard: [] });
    }

    // 2. Fetch usernames for these userIds
    const userIds = winners.map((w) => w.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // 3. Combine data
    const leaderboard = winners.map((w) => {
      const user = users.find((u) => u.id === w.userId);
      return {
        userId: w.userId,
        username: user?.username || 'Unknown',
        wins: w._count.userId,
      };
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
