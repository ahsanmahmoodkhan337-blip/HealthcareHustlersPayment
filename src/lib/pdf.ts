import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

export interface ReceiptPDFData {
  receiptNumber: string
  studentName: string
  phoneNumber: string
  emailAddress: string
  paymentMode: string
  paymentModeOther?: string | null
  isInstallment: boolean
  amountPaid: number
  remainingAmount: number | null
  paymentDate: Date
  nextDueDate?: Date | null
}

export function generateReceiptPDF(data: ReceiptPDFData): Promise<Uint8Array> {
  const paymentDate = new Date(data.paymentDate).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const paymentModeStr =
    data.paymentMode === 'OTHER' && data.paymentModeOther
      ? `Other: ${data.paymentModeOther}`
      : data.paymentMode

  const docDefinition: any = {
    defaultStyle: {
      fontSize: 10,
    },
    content: [
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'HEALTHCARE HUSTLERS', fontSize: 22, bold: true, color: '#1a5276' },
              { text: 'Registered under SECP', fontSize: 9, color: '#555' },
              { text: 'www.healthcarehustlers.org', fontSize: 9, color: '#2980b9', decoration: 'underline' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'OFFICIAL RECEIPT', fontSize: 16, bold: true, color: '#1a5276', alignment: 'right' },
              { text: `Receipt #: ${data.receiptNumber}`, fontSize: 10, alignment: 'right', margin: [0, 4, 0, 0] },
              { text: `Date Issued: ${paymentDate}`, fontSize: 10, alignment: 'right', color: '#555' },
            ],
          },
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#1a5276' }], margin: [0, 10, 0, 10] },
      { text: 'STUDENT DETAILS', fontSize: 12, bold: true, color: '#1a5276', margin: [0, 0, 0, 8] },
      {
        table: {
          headerRows: 1,
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Field', bold: true, fillColor: '#eaf2f8' },
              { text: 'Value', bold: true, fillColor: '#eaf2f8' },
            ],
            [{ text: 'Student Name' }, { text: data.studentName }],
            [{ text: 'Phone Number' }, { text: data.phoneNumber }],
            [{ text: 'Email Address' }, { text: data.emailAddress }],
            [{ text: 'Payment Method' }, { text: paymentModeStr }],
            [{ text: 'Amount Paid' }, { text: `PKR ${data.amountPaid.toLocaleString()}`, bold: true }],
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 || i === 1 ? '#1a5276' : '#ddd'),
        },
      },
      ...(data.isInstallment
        ? [
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e67e22' }], margin: [0, 15, 0, 5] },
            { text: 'INSTALLMENT PLAN', fontSize: 12, bold: true, color: '#e67e22', margin: [0, 0, 0, 8] },
            {
              table: {
                headerRows: 1,
                widths: ['30%', '70%'],
                body: [
                  [
                    { text: 'Field', bold: true, fillColor: '#fef5e7' },
                    { text: 'Value', bold: true, fillColor: '#fef5e7' },
                  ],
                  [
                    { text: 'Balance Due' },
                    { text: `PKR ${(data.remainingAmount ?? 0).toLocaleString()}`, bold: true, color: '#c0392b' },
                  ],
                  [
                    { text: 'Next Due Date' },
                    {
                      text: data.nextDueDate
                        ? new Date(data.nextDueDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A',
                      bold: true,
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
                vLineWidth: () => 0,
                hLineColor: (i: number) => (i === 0 || i === 1 ? '#e67e22' : '#ddd'),
              },
            },
          ]
        : []),
      { text: '', margin: [0, 20, 0, 0] },
      { text: 'Thank you for your payment!', fontSize: 12, bold: true, color: '#1a5276', alignment: 'center', margin: [0, 10, 0, 5] },
      { text: 'This is a computer-generated receipt and does not require a physical signature.', fontSize: 8, color: '#888', alignment: 'center' },
    ],
  }

  return new Promise((resolve, reject) => {
    const doc = pdfMake.createPdf(docDefinition)
    doc.getBuffer((err: Error | null, buffer: Uint8Array) => {
      if (err) return reject(err)
      resolve(buffer)
    })
  })
}