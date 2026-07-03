import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReceiptPDF } from '@/lib/pdf'

// GET /api/receipts/[id]/pdf — Generate & return PDF
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
    })

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    const pdfBuffer = await generateReceiptPDF({
      receiptNumber: receipt.receiptNumber,
      studentName: receipt.studentName,
      phoneNumber: receipt.phoneNumber,
      emailAddress: receipt.emailAddress,
      paymentMode: receipt.paymentMode,
      paymentModeOther: receipt.paymentModeOther,
      isInstallment: receipt.isInstallment,
      amountPaid: receipt.amountPaid,
      remainingAmount: receipt.remainingAmount,
      paymentDate: receipt.paymentDate,
      nextDueDate: receipt.nextDueDate,
    })

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receipt.receiptNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}