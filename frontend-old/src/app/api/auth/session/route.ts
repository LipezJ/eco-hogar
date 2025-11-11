import { NextResponse } from 'next/server';
import { getSession } from '@/lib/actions/auth-actions';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
    },
  });
}
