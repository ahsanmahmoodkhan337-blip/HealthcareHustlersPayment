declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeDoc {
    getBuffer(callback: (err: Error | null, buffer: Uint8Array) => void): void
    getBase64(callback: (err: Error | null, base64: string) => void): void
    getBlob(callback: (err: Error | null, blob: Blob) => void): void
    getDataUrl(callback: (err: Error | null, dataUrl: string) => void): void
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