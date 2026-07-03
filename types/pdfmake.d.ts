declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeDoc {
    getBuffer(callback: (buffer: Buffer) => void): void
    getBase64(callback: (base64: string) => void): void
    getBlob(callback: (blob: Blob) => void): void
    getDataUrl(callback: (dataUrl: string) => void): void
    download(defaultFilename?: string, cb?: () => void): void
    open(): void
    print(): void
  }

  interface PdfMakeStatic {
    createPdf(docDefinition: any): PdfMakeDoc
    vfs: any
  }

  const pdfMake: PdfMakeStatic
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: {
    pdfMake?: { vfs: any }
    vfs: any
  }
  export default vfs
}