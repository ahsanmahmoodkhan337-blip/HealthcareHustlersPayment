declare module 'pdfmake/build/pdfmake' {
  const pdfMake: {
    createPdfKitDocument(docDefinition: any): any
    vfs: any
  }
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: {
    pdfMake: { vfs: any }
    vfs: any
  }
  export default vfs
}