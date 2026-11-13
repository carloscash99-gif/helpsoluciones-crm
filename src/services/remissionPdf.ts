import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoHorizontalBase64 } from '../assets/logoBase64';

export interface RemissionPDFData {
    numero: string;
    fecha: string;
    cliente: {
        nombre: string;
        nit: string;
        direccion: string;
        telefono: string;
        correo: string;
    };
    items: {
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];
    total: number;
    observaciones?: string;
}

export const generateRemissionPDF = (data: RemissionPDFData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header & Logo
    try {
        if (logoHorizontalBase64) {
            // El logo corporativo horizontal en alta definición (PNG)
            doc.addImage(logoHorizontalBase64, 'PNG', 15, 12, 60, 10.25);
        }
    } catch (e) {
        console.error('Error adding logo to PDF', e);
    }

    doc.setFontSize(18);
    doc.setTextColor(0, 74, 153); // Corporate Blue (#004a99)
    doc.setFont('helvetica', 'bold');
    doc.text('REMISIÓN DE ENTREGA', pageWidth - 15, 20, { align: 'right' });

    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.setFont('helvetica', 'bold');
    doc.text(`N°: ${data.numero}`, pageWidth - 15, 28, { align: 'right' });
    
    let fechaFormateada = data.fecha;
    try {
        const d = new Date(data.fecha);
        fechaFormateada = isNaN(d.getTime()) ? data.fecha : d.toLocaleDateString('es-CO');
    } catch (_) {}
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fechaFormateada}`, pageWidth - 15, 35, { align: 'right' });

    // 2. Company Info (Static)
    doc.setFontSize(8.5);
    doc.setTextColor(30);
    doc.setFont('helvetica', 'bold');
    doc.text('HELP SOLUCIONES INFORMATICAS HSI SAS', 15, 28);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT: 900686378-7', 15, 33);
    doc.text('Celular: 3043358650 - 3003453610 | gerencia@helpsoluciones.com.co', 15, 38);
    doc.text('Bogotá D.C. - Colombia', 15, 43);

    // 3. Client Info
    doc.setDrawColor(200);
    doc.line(15, 48, pageWidth - 15, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 74, 153);
    doc.text('DATOS DEL CLIENTE:', 15, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30);
    doc.text(`Nombre: ${data.cliente.nombre || 'N/A'}`, 15, 62);
    doc.text(`NIT: ${data.cliente.nit || 'N/A'}`, 15, 67);
    doc.text(`Dirección: ${data.cliente.direccion || 'N/A'}`, 15, 72);
    doc.text(`Teléfono: ${data.cliente.telefono || 'N/A'}`, 110, 62);
    doc.text(`Email: ${data.cliente.correo || 'N/A'}`, 110, 67);

    // 4. Items Table (Usando autoTable directamente como función)
    autoTable(doc, {
        startY: 78,
        head: [['Descripción', 'Cantidad', 'V. Unitario', 'Subtotal']],
        body: (data.items || []).map(item => [
            item.descripcion || '',
            Number(item.cantidad || 0).toLocaleString('es-CO'),
            `$${Math.round(Number(item.precio_unitario || 0)).toLocaleString('es-CO')}`,
            `$${Math.round(Number(item.subtotal || 0)).toLocaleString('es-CO')}`
        ]),
        headStyles: { fillColor: [0, 74, 153], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 15, right: 15 }
    });

    const finalY = ((doc as any).lastAutoTable?.finalY || 80) + 10;

    // 5. Totals & Notes
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 74, 153);
    doc.text(`TOTAL: $${Math.round(Number(data.total || 0)).toLocaleString('es-CO')}`, pageWidth - 15, finalY, { align: 'right' });

    if (data.observaciones) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(70);
        doc.text('Observaciones:', 15, finalY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        const splitObs = doc.splitTextToSize(data.observaciones, pageWidth - 30);
        doc.text(splitObs, 15, finalY + 14);
    }

    // 6. Signatures
    const sigY = Math.max(finalY + 45, 245);
    doc.setDrawColor(150);
    doc.line(15, sigY, 85, sigY);
    doc.line(pageWidth - 85, sigY, pageWidth - 15, sigY);
    
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Entregado por (Firma / Sello)', 15, sigY + 5);
    doc.text('Recibido por (Firma / Sello)', pageWidth - 15, sigY + 5, { align: 'right' });

    // 7. Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    const footerText = 'Este documento es una remisión informativa y no constituye una factura de venta.';
    doc.text(footerText, pageWidth / 2, 285, { align: 'center' });

    doc.save(`Remision_${data.numero}.pdf`);
};
