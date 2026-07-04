import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats — Daily summary
export async function GET(_request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    const dailyReceipts = await prisma.receipt.findMany({
      where: {
        paymentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const totalAmount = dailyReceipts.reduce((sum, r) => sum + r.amountPaid, 0)
    const totalReceipts = dailyReceipts.length

    return NextResponse.json({
      date: today.toISOString().split('T')[0],
      totalReceipts,
      totalAmount,
      receipts: dailyReceipts,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}