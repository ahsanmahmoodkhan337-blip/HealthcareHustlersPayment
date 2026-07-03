import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createReceiptSchema } from '@/lib/schema'
import { v4 as uuidv4 } from 'uuid'

// Helper: generate next receipt number
async function generateReceiptNumber(): Promise<string> {
  const lastReceipt = await prisma.receipt.findFirst({
    orderBy: { receiptNumber: 'desc' },
    select: { receiptNumber: true },
  })

  let nextNum = 1
  if (lastReceipt) {
    const match = lastReceipt.receiptNumber.match(/HH-2026-(\d{4})/)
    if (match) {
      nextNum = parseInt(match[1], 10) + 1
    }
  }

  return `HH-2026-${String(nextNum).padStart(4, '0')}`
}

// POST /api/receipts — Create a new receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createReceiptSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const receiptNumber = await generateReceiptNumber()

    // Auto-calculate nextDueDate if installment (15 days from paymentDate)
    let nextDueDate: Date | null = null
    let paymentDate: Date = new Date()
    if (data.paymentDate) {
      paymentDate = new Date(data.paymentDate)
    }

    if (data.isInstallment) {
      nextDueDate = new Date(paymentDate.getTime() + 15 * 24 * 60 * 60 * 1000)
    }

    const receipt = await prisma.receipt.create({
      data: {
        id: uuidv4(),
        receiptNumber,
        studentName: data.studentName,
        phoneNumber: data.phoneNumber,
        emailAddress: data.emailAddress,
        paymentMode: data.paymentMode,
        paymentModeOther: data.paymentModeOther || null,
        isInstallment: data.isInstallment,
        amountPaid: data.amountPaid,
        remainingAmount: data.remainingAmount ?? 0,
        paymentDate,
        nextDueDate,
      },
    })

    return NextResponse.json(
      {
        receipt,
        pdfUrl: `/api/receipts/${receipt.id}/pdf`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/receipts — List all receipts (with optional search)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptNumber = searchParams.get('receiptNumber')
    const studentName = searchParams.get('studentName')
    const phoneNumber = searchParams.get('phoneNumber')

    const where: Record<string, unknown> = {}

    if (receiptNumber) {
      where.receiptNumber = { contains: receiptNumber }
    }
    if (studentName) {
      where.studentName = { contains: studentName }
    }
    if (phoneNumber) {
      where.phoneNumber = { contains: phoneNumber }
    }

    const receipts = await prisma.receipt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ receipts })
  } catch (error) {
    console.error('Error listing receipts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}