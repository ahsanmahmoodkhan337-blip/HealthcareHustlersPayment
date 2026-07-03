import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/daily-summary — Returns all DailySummary records, auto-creates today's
export async function GET(_request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if today's summary exists
    const existing = await prisma.dailySummary.findUnique({
      where: { date: today },
    })

    if (!existing) {
      // Calculate totals from today's receipts
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const todaysReceipts = await prisma.receipt.findMany({
        where: {
          paymentDate: { gte: today, lt: tomorrow },
        },
      })
      const totalAmount = todaysReceipts.reduce((s, r) => s + r.amountPaid, 0)

      await prisma.dailySummary.create({
        data: {
          date: today,
          totalAmount,
          receiptCount: todaysReceipts.length,
        },
      })
    }

    const summaries = await prisma.dailySummary.findMany({
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error('Error fetching daily summaries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}