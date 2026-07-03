import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/installments — Filtered list where isInstallment == true
export async function GET(_request: NextRequest) {
  try {
    const installments = await prisma.receipt.findMany({
      where: { isInstallment: true },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json({ installments })
  } catch (error) {
    console.error('Error fetching installments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}