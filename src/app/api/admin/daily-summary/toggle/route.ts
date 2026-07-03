import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/daily-summary/toggle — Toggle isCompleted for a date
export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date string (YYYY-MM-DD) required' }, { status: 400 })
    }

    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    const summary = await prisma.dailySummary.findUnique({
      where: { date: dateObj },
    })

    if (!summary) {
      return NextResponse.json({ error: 'No summary found for this date' }, { status: 404 })
    }

    const updated = await prisma.dailySummary.update({
      where: { id: summary.id },
      data: {
        isCompleted: !summary.isCompleted,
        completedAt: summary.isCompleted ? null : new Date(),
      },
    })

    return NextResponse.json({ summary: updated })
  } catch (error) {
    console.error('Error toggling daily summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}