import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Trabajo, LineaTrabajo } from '../types'

export async function generarPresupuestoPDF(trabajo: Trabajo, lineas: LineaTrabajo[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const azul = [0, 122, 255] as [number, number, number]
  const gris = [142, 142, 147] as [number, number, number]
  const negro = [28, 28, 30] as [number, number, number]
  const pageW = doc.internal.pageSize.getWidth()

  // Cabecera
  doc.setFillColor(...azul)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESUPUESTO', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(fecha, pageW - 14, 12, { align: 'right' })

  // Info trabajo
  doc.setTextColor(...negro)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(trabajo.descripcion, 14, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...gris)
  doc.text(`Ubicación: ${trabajo.ubicacion}`, 14, 47)

  if (trabajo.notas) {
    doc.setTextColor(...negro)
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(trabajo.notas, pageW - 28)
    doc.text(lines, 14, 55)
  }

  // Tabla de líneas
  const rows = lineas.map((l) => [
    l.nombre_tipo,
    `${Number(l.metros).toFixed(2)} ${l.unidad === 'pies' ? 'ft' : 'm'}`,
    `${Number(l.precio_unitario).toFixed(2)} $/${l.unidad === 'pies' ? 'ft' : 'm'}`,
    `${Number(l.subtotal).toFixed(2)} $`,
  ])

  autoTable(doc, {
    startY: trabajo.notas ? 68 : 55,
    head: [['Partida', 'Cantidad', 'Precio unit.', 'Subtotal']],
    body: rows,
    headStyles: { fillColor: azul, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: negro },
    alternateRowStyles: { fillColor: [242, 242, 247] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  })

  // Total
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
  doc.setDrawColor(...azul)
  doc.setLineWidth(0.5)
  doc.line(14, finalY, pageW - 14, finalY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...azul)
  doc.text('TOTAL PRESUPUESTADO', 14, finalY + 8)
  doc.text(`${Number(trabajo.total_calculado).toFixed(2)} $`, pageW - 14, finalY + 8, { align: 'right' })

  if (trabajo.estado === 'cobrado' && trabajo.total_cobrado !== null) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...gris)
    doc.text('Total cobrado', 14, finalY + 16)
    const diff = Number(trabajo.total_cobrado) - Number(trabajo.total_calculado)
    doc.setTextColor(diff >= 0 ? 52 : 255, diff >= 0 ? 199 : 59, diff >= 0 ? 89 : 48)
    doc.text(`${Number(trabajo.total_cobrado).toFixed(2)} $`, pageW - 14, finalY + 16, { align: 'right' })
  }

  // Pie
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('Generado con TrabajoPorMetros', pageW / 2, 285, { align: 'center' })

  const pdfBlob = doc.output('blob')
  const fileName = `presupuesto-${trabajo.descripcion.replace(/\s+/g, '-').toLowerCase()}.pdf`
  const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Presupuesto' })
  } else {
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
}
