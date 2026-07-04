import fs from 'fs'
import path from 'path'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

const BRAND_BLUE = '#046bd2'
const BRAND_DARK = '#045cb4'
const BRAND_YELLOW = '#fad23b'
const DARK_TEXT = '#1e293b'
const LIGHT_BG = '#F0F5FA'

export interface ReceiptPDFData {
  receiptNumber: string
  studentName: string
  phoneNumber: string
  emailAddress: string
  paymentMode: string
  paymentModeOther?: string | null
  currency: string
  isInstallment: boolean
  amountPaid: number
  remainingAmount: number | null
  paymentDate: Date
  nextDueDate?: Date | null
}

function getSymbol(currency: string): string {
  return currency === 'USD' ? '$' : 'PKR'
}

export function generateReceiptPDF(data: ReceiptPDFData): Promise<Buffer> {
  const dateStr = new Date(data.paymentDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
  const sym = getSymbol(data.currency)

  const modeStr = data.paymentMode === 'OTHER' && data.paymentModeOther
    ? `Other: ${data.paymentModeOther}`
    : data.paymentMode

  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoB64 = fs.readFileSync(logoPath).toString('base64')

  const docDef: any = {
    defaultStyle: { fontSize: 10, color: DARK_TEXT },
    info: { title: `Receipt ${data.receiptNumber}`, author: 'Healthcare Hustlers' },
    content: [
      { columns: [
        { width: 100, image: 'logo', fit: [90, 90] },
        { width: '*', stack: [
          { text: 'HEALTHCARE HUSTLERS', fontSize: 22, bold: true, color: BRAND_BLUE, margin: [10, 10, 0, 2] },
          { text: 'Securities & Exchange Commission of Pakistan (SECP) Registered Institution', fontSize: 8, color: '#555', margin: [10, 0, 0, 4] },
          { text: 'www.healthcarehustlers.org', fontSize: 9, color: BRAND_BLUE, decoration: 'underline', margin: [10, 0, 0, 0] },
        ]},
        { width: 'auto', stack: [
          { text: 'OFFICIAL RECEIPT', fontSize: 14, bold: true, color: BRAND_BLUE, alignment: 'right' },
          { text: `Receipt #: ${data.receiptNumber}`, fontSize: 10, alignment: 'right', margin: [0, 4, 0, 0] },
          { text: `Date: ${dateStr}`, fontSize: 9, alignment: 'right', color: '#555' },
        ]},
      ]},
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: BRAND_BLUE }], margin: [0, 10, 0, 10] },
      { text: 'STUDENT DETAILS', fontSize: 12, bold: true, color: BRAND_BLUE, margin: [0, 0, 0, 8] },
      { table: {
        headerRows: 1, widths: ['30%', '70%'],
        body: [
          [{ text: 'Field', bold: true, fillColor: LIGHT_BG, color: BRAND_DARK }, { text: 'Value', bold: true, fillColor: LIGHT_BG, color: BRAND_DARK }],
          [{ text: 'Student Name' }, { text: data.studentName }],
          [{ text: 'Phone Number' }, { text: data.phoneNumber }],
          [{ text: 'Email Address' }, { text: data.emailAddress }],
          [{ text: 'Payment Method' }, { text: modeStr }],
          [{ text: 'Amount Paid' }, { text: `${sym} ${data.amountPaid.toLocaleString()}`, bold: true, color: BRAND_BLUE }],
          [{ text: 'Currency' }, { text: data.currency }],
        ],
      }, layout: { hLineWidth: (i: number) => i < 2 ? 1 : 0.5, vLineWidth: () => 0, hLineColor: (i: number) => i < 2 ? BRAND_BLUE : '#ddd' } },
      ...(data.isInstallment ? [
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: BRAND_YELLOW }], margin: [0, 15, 0, 5] },
        { text: 'INSTALLMENT PLAN', fontSize: 12, bold: true, color: BRAND_YELLOW, margin: [0, 0, 0, 8] },
        { table: { headerRows: 1, widths: ['30%', '70%'], body: [
          [{ text: 'Field', bold: true, fillColor: '#fefce8' }, { text: 'Value', bold: true, fillColor: '#fefce8' }],
          [{ text: 'Balance Due' }, { text: `${sym} ${(data.remainingAmount ?? 0).toLocaleString()}`, bold: true, color: '#c0392b' }],
          [{ text: 'Next Due Date' }, { text: data.nextDueDate ? new Date(data.nextDueDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', bold: true }],
        ]}, layout: { hLineWidth: (i: number) => i < 2 ? 1 : 0.5, vLineWidth: () => 0, hLineColor: (i: number) => i < 2 ? BRAND_YELLOW : '#ddd' } },
      ] : []),
      { text: '', margin: [0, 20, 0, 0] },
      { text: 'Thank you for your payment!', fontSize: 12, bold: true, color: BRAND_BLUE, alignment: 'center', margin: [0, 10, 0, 5] },
      { text: 'This is a computer-generated receipt and does not require a physical signature.', fontSize: 8, color: '#888', alignment: 'center' },
      { text: '', margin: [0, 15, 0, 0] },
      { columns: [
        { text: 'info@healthcarehustlers.org', fontSize: 8, color: '#666', alignment: 'left' },
        { text: '+92 335 0340888', fontSize: 8, color: '#666', alignment: 'center' },
        { text: 'www.healthcarehustlers.org', fontSize: 8, color: '#666', alignment: 'right' },
      ]},
    ],
    images: { logo: logoB64 },
  }

  return new Promise((resolve, reject) => {
    const pdfDoc = pdfMake.createPdf(docDef)
    try {
      pdfDoc.getBuffer((buffer: any) => resolve(buffer))
    } catch (e) {
      reject(e)
    }
  })
}