import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard | Undercover Online',
  description: 'Lihat siapa pemain Undercover terbaik di seluruh dunia!',
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
