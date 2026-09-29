import type {
  AppUser, Cliente, Proveedor, Producto, Cotizacion, CotizacionItem,
  Conductor, VentaManual, SalesBudget, Despacho, DespachoItem
} from '../App';

export const DEMO_USER: AppUser = {
  id: 'demo-user-1',
  nombre: 'Carlos Demo',
  usuario: 'demo',
  cargo: 'Gerente Comercial',
  email: 'demo@helpsoluciones.com.co',
  telefono: '304-335-8650',
  rol: 'Admin',
  permisos: ['dashboard','cotizaciones','clientes','productos','proveedores','logistica','informes','admin','vendedores','reparaciones','alquileres','facturacion','ventas-manuales','comisiones','leads-web','registros-web','agente-informes','conductores','ordenes-compra','remisiones'],
  password: 'demo123'
};

export const DEMO_USERS: AppUser[] = [
  DEMO_USER,
  { id: 'demo-user-2', nombre: 'Laura Ramírez', usuario: 'lauram', cargo: 'Asesora Comercial', email: 'l.ramirez@helpsoluciones.com.co', telefono: '311-234-5678', rol: 'Comercial', permisos: ['cotizaciones','clientes','informes'], password: 'demo123' },
  { id: 'demo-user-3', nombre: 'Miguel Torres', usuario: 'miguelt', cargo: 'Coordinador Logístico', email: 'm.torres@helpsoluciones.com.co', telefono: '315-987-6543', rol: 'Logistica', permisos: ['logistica','conductores','ordenes-compra'], password: 'demo123' },
  { id: 'demo-user-4', nombre: 'Ana Gómez', usuario: 'anag', cargo: 'Asesora Comercial Senior', email: 'a.gomez@helpsoluciones.com.co', telefono: '317-456-7890', rol: 'Comercial', permisos: ['cotizaciones','clientes','informes'], password: 'demo123' },
];

export const DEMO_CLIENTES: Cliente[] = [
  { id: 'dc-1', nombre: 'Constructora Andina S.A.S.', nit: '900.123.456-1', contacto: 'Ricardo Bermúdez', telefono: '601-345-6789', correo: 'r.bermudez@constructoraandina.com', direccion: 'Cra. 15 No. 93-75 Of. 202, Bogotá D.C.', ciudad: 'Bogotá', compradores: [], sedes: [], poseeCredito: true, cupoCredito: 50000000, regimen: 'Régimen Común', tesoreriaNombre: 'Marta Pineda', tesoreriaTelefono: '601-345-6790', tesoreriaEmail: 'tesoreria@constructoraandina.com', contabilidadNombre: 'Felipe Ochoa', contabilidadTelefono: '601-345-6791', contabilidadEmail: 'contabilidad@constructoraandina.com', usuarioId: 'demo-user-2' },
  { id: 'dc-2', nombre: 'Clínica San Rafael IPS', nit: '800.987.654-3', contacto: 'Dra. Claudia Ríos', telefono: '602-234-5678', correo: 'sistemas@clinicasanrafael.com.co', direccion: 'Calle 34 No. 28-45, Cali, Valle del Cauca', ciudad: 'Cali', compradores: [], sedes: [], poseeCredito: true, cupoCredito: 80000000, regimen: 'Régimen Común', tesoreriaNombre: 'Gustavo Mendez', tesoreriaTelefono: '602-234-5679', tesoreriaEmail: 'tesoreria@clinicasanrafael.com.co', contabilidadNombre: 'Patricia Vásquez', contabilidadTelefono: '602-234-5680', contabilidadEmail: 'contabilidad@clinicasanrafael.com.co', usuarioId: 'demo-user-4' },
  { id: 'dc-3', nombre: 'Alcaldía Municipal de Palmira', nit: '890.456.789-2', contacto: 'Ing. Hernán Salcedo', telefono: '602-987-1234', correo: 'sistemas@palmira.gov.co', direccion: 'Carrera 28 No. 28-04, Palmira, Valle del Cauca', ciudad: 'Palmira', compradores: [], sedes: [], poseeCredito: false, regimen: 'Régimen Simplificado', tesoreriaNombre: '', tesoreriaTelefono: '', tesoreriaEmail: '', contabilidadNombre: '', contabilidadTelefono: '', contabilidadEmail: '', usuarioId: 'demo-user-2' },
  { id: 'dc-4', nombre: 'Universidad del Suroccidente', nit: '900.234.567-8', contacto: 'Arq. Pilar Montes', telefono: '602-345-9876', correo: 'tic@unisuroccidente.edu.co', direccion: 'Autopista Simón Bolívar, Popayán, Cauca', ciudad: 'Popayán', compradores: [], sedes: [], poseeCredito: true, cupoCredito: 120000000, regimen: 'Régimen Común', tesoreriaNombre: 'Jorge Castañeda', tesoreriaTelefono: '602-345-9877', tesoreriaEmail: 'tesoreria@unisuroccidente.edu.co', contabilidadNombre: 'Diana Salinas', contabilidadTelefono: '602-345-9878', contabilidadEmail: 'contabilidad@unisuroccidente.edu.co', usuarioId: 'demo-user-4' },
  { id: 'dc-5', nombre: 'Ferretería Industrial Los Andes Ltda.', nit: '800.345.678-1', contacto: 'Jorge Pizarro', telefono: '604-678-9012', correo: 'compras@ferreteriandina.com', direccion: 'Calle 50 No. 43-96, Medellín, Antioquia', ciudad: 'Medellín', compradores: [], sedes: [], poseeCredito: false, regimen: 'Régimen Simplificado', tesoreriaNombre: '', tesoreriaTelefono: '', tesoreriaEmail: '', contabilidadNombre: '', contabilidadTelefono: '', contabilidadEmail: '', usuarioId: 'demo-user-2' },
];

export const DEMO_PROVEEDORES: Proveedor[] = [
  { id: 'dp-prov-1', nombre: 'TechSupply Colombia S.A.S.', nit: '901.234.567-1', contacto: 'Andrea Castillo', telefono: '601-456-7890', correo: 'ventas@techsupply.com.co', direccion: 'Zona Franca de Bogotá, Bodega 12', coordenadas: '', regimen: 'Régimen Común' },
  { id: 'dp-prov-2', nombre: 'Importadora Digital del Valle Ltda.', nit: '800.876.543-2', contacto: 'Francisco Montoya', telefono: '602-567-8901', correo: 'pedidos@importadoradigital.co', direccion: 'Cra. 100 No. 16-55, Yumbo, Valle', coordenadas: '', regimen: 'Régimen Común' },
  { id: 'dp-prov-3', nombre: 'Distribuciones IT Norte S.A.', nit: '890.765.432-3', contacto: 'Camila Rondón', telefono: '605-678-9012', correo: 'comercial@distribucionesitnorte.com', direccion: 'Calle 72 No. 53-78, Barranquilla, Atlántico', coordenadas: '', regimen: 'Régimen Común' },
];

export const DEMO_PRODUCTOS: Producto[] = [
  { id: 'dp-prod-1', nombre: 'Laptop HP EliteBook 840 G9', numPart: 'HP-840G9-I7', descripcion: 'Laptop empresarial Intel Core i7-1255U, 16GB RAM, SSD 512GB, 14" FHD', unidad: 'Und', precioCompra: 3800000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [{ date: '2026-01-10', price: 3700000 }, { date: '2026-03-01', price: 3800000 }] },
  { id: 'dp-prod-2', nombre: 'Desktop Dell OptiPlex 7090', numPart: 'DEL-OPT7090-I5', descripcion: 'PC escritorio Intel Core i5-10500, 8GB RAM, SSD 256GB, Win 11 Pro', unidad: 'Und', precioCompra: 2900000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [{ date: '2026-01-15', price: 2850000 }] },
  { id: 'dp-prod-3', nombre: 'Servidor HP ProLiant DL380 Gen10', numPart: 'HP-DL380-XEON', descripcion: 'Servidor 2U, Xeon Silver 4210R, 32GB ECC, 4x SAS 600GB, RAID 5', unidad: 'Und', precioCompra: 15500000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [{ date: '2026-02-01', price: 15200000 }] },
  { id: 'dp-prod-4', nombre: 'Monitor LG 27" Full HD IPS', numPart: 'LG-27MP60G', descripcion: 'Monitor LED IPS 27 pulgadas, 1920x1080, 75Hz, HDMI/DisplayPort', unidad: 'Und', precioCompra: 980000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [{ date: '2026-01-10', price: 950000 }] },
  { id: 'dp-prod-5', nombre: 'Switch Cisco Catalyst 24 puertos PoE', numPart: 'CSC-WS-C2960L-24', descripcion: 'Switch gestionable 24 x GbE PoE+, 4 x SFP uplink, Cisco IOS', unidad: 'Und', precioCompra: 2200000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-6', nombre: 'UPS APC Smart-UPS 1000VA', numPart: 'APC-SMT1000I', descripcion: 'Sistema UPS 1000VA/700W, Online Doble Conversión, 6 tomas IEC', unidad: 'Und', precioCompra: 780000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-7', nombre: 'Licencia Windows Server 2022 Std', numPart: 'MS-WS2022-STD-16C', descripcion: 'Microsoft Windows Server 2022 Standard, 16 Cores, OEM', unidad: 'Und', precioCompra: 3200000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-8', nombre: 'Microsoft 365 Business Standard', numPart: 'MS-365-BS-1Y', descripcion: 'Suscripción anual por usuario, Office + Teams + OneDrive 1TB', unidad: 'Licencia/año', precioCompra: 285000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-9', nombre: 'Router MikroTik RB4011iGS+RM', numPart: 'MTK-RB4011-RM', descripcion: 'Router 10x Gigabit, 1x SFP+ 10Gbps, RouterOS L5, 1U Rack', unidad: 'Und', precioCompra: 950000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-10', nombre: 'Impresora HP LaserJet Pro M404n', numPart: 'HP-W1A52A', descripcion: 'Impresora láser monocromática, 40ppm, Red Ethernet, USB', unidad: 'Und', precioCompra: 1650000, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-11', nombre: 'Cable UTP Cat6 LSZH (por metro)', numPart: 'CABLE-UTP-CAT6-M', descripcion: 'Cable de datos UTP Cat6 LSZH 550MHz, certificado Fluke', unidad: 'Metro', precioCompra: 2500, moneda: 'COP', tipo: 'Producto', exentoIva: false, history: [] },
  { id: 'dp-prod-12', nombre: 'Mantenimiento Preventivo PC / Laptop', numPart: 'SVC-MANT-PREV', descripcion: 'Servicio integral: limpieza, diagnóstico, actualización drivers y SO', unidad: 'Servicio', precioCompra: 0, moneda: 'COP', tipo: 'Servicio', exentoIva: false, history: [] },
];

const makeItems = (items: { id: string; productoId: string; proveedorId: string; unidad: string; cantidad: number; costoUnitario: number; precioVenta: number }[]): CotizacionItem[] =>
  items.map(i => ({
    ...i,
    utilidad: i.precioVenta - i.costoUnitario,
    iva: Math.round(i.precioVenta * i.cantidad * 0.19),
    moneda: 'COP' as const
  }));

// Quote 1 - Ganado
const q1Items = makeItems([
  { id: 'q1i1', productoId: 'dp-prod-1', proveedorId: 'dp-prov-1', unidad: 'Und', cantidad: 5, costoUnitario: 3800000, precioVenta: 4560000 },
  { id: 'q1i2', productoId: 'dp-prod-4', proveedorId: 'dp-prov-1', unidad: 'Und', cantidad: 3, costoUnitario: 980000, precioVenta: 1176000 },
]);
const q1Sub = 5*4560000 + 3*1176000;
const q1Iva = q1Items.reduce((s, i) => s + i.iva, 0);

// Quote 2 - Seguimiento
const q2Items = makeItems([
  { id: 'q2i1', productoId: 'dp-prod-3', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 1, costoUnitario: 15500000, precioVenta: 18600000 },
  { id: 'q2i2', productoId: 'dp-prod-6', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 2, costoUnitario: 780000, precioVenta: 936000 },
]);
const q2Sub = 18600000 + 2*936000;
const q2Iva = q2Items.reduce((s, i) => s + i.iva, 0);

// Quote 3 - Ganado
const q3Items = makeItems([
  { id: 'q3i1', productoId: 'dp-prod-2', proveedorId: 'dp-prov-1', unidad: 'Und', cantidad: 10, costoUnitario: 2900000, precioVenta: 3480000 },
  { id: 'q3i2', productoId: 'dp-prod-5', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 2, costoUnitario: 2200000, precioVenta: 2640000 },
]);
const q3Sub = 10*3480000 + 2*2640000;
const q3Iva = q3Items.reduce((s, i) => s + i.iva, 0);

// Quote 4 - Seguimiento
const q4Items = makeItems([
  { id: 'q4i1', productoId: 'dp-prod-1', proveedorId: 'dp-prov-1', unidad: 'Und', cantidad: 8, costoUnitario: 3800000, precioVenta: 4560000 },
  { id: 'q4i2', productoId: 'dp-prod-8', proveedorId: 'dp-prov-2', unidad: 'Licencia/año', cantidad: 8, costoUnitario: 285000, precioVenta: 342000 },
]);
const q4Sub = 8*4560000 + 8*342000;
const q4Iva = q4Items.reduce((s, i) => s + i.iva, 0);

// Quote 5 - Perdido
const q5Items = makeItems([
  { id: 'q5i1', productoId: 'dp-prod-10', proveedorId: 'dp-prov-3', unidad: 'Und', cantidad: 2, costoUnitario: 1650000, precioVenta: 1980000 },
  { id: 'q5i2', productoId: 'dp-prod-11', proveedorId: 'dp-prov-3', unidad: 'Metro', cantidad: 200, costoUnitario: 2500, precioVenta: 3000 },
]);
const q5Sub = 2*1980000 + 200*3000;
const q5Iva = q5Items.reduce((s, i) => s + i.iva, 0);

// Quote 6 - Seguimiento
const q6Items = makeItems([
  { id: 'q6i1', productoId: 'dp-prod-3', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 1, costoUnitario: 15500000, precioVenta: 18600000 },
  { id: 'q6i2', productoId: 'dp-prod-7', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 1, costoUnitario: 3200000, precioVenta: 3840000 },
]);
const q6Sub = 18600000 + 3840000;
const q6Iva = q6Items.reduce((s, i) => s + i.iva, 0);

// Quote 7 - Ganado (servicios de mantenimiento)
const q7Items = makeItems([
  { id: 'q7i1', productoId: 'dp-prod-12', proveedorId: 'dp-prov-1', unidad: 'Servicio', cantidad: 20, costoUnitario: 0, precioVenta: 85000 },
]);
const q7Sub = 20*85000;
const q7Iva = q7Items.reduce((s, i) => s + i.iva, 0);

// Quote 8 - Seguimiento
const q8Items = makeItems([
  { id: 'q8i1', productoId: 'dp-prod-9', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 5, costoUnitario: 950000, precioVenta: 1140000 },
  { id: 'q8i2', productoId: 'dp-prod-5', proveedorId: 'dp-prov-2', unidad: 'Und', cantidad: 3, costoUnitario: 2200000, precioVenta: 2640000 },
]);
const q8Sub = 5*1140000 + 3*2640000;
const q8Iva = q8Items.reduce((s, i) => s + i.iva, 0);

export const DEMO_COTIZACIONES: Cotizacion[] = [
  {
    id: 'dq-1', fecha: '2026-02-05', clienteId: 'dc-1', clienteNombre: 'Constructora Andina S.A.S.',
    consecutivo: 'QUOTE-2026-001', compradorNombre: 'Ricardo Bermúdez', compradorTelefono: '601-345-6789', compradorEmail: 'r.bermudez@constructoraandina.com',
    items: q1Items, subtotal: q1Sub, iva: q1Iva, total: q1Sub + q1Iva,
    utilidadTotal: (760000*5 + 196000*3), ejecutivo: 'Laura Ramírez', ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Ganado', autorizada: true, autorizadoPor: 'Carlos Demo', fechaAutorizacion: '2026-02-06',
    condiciones: 'Pago a 30 días. Garantía 12 meses.', observaciones: 'Cliente adjudicó propuesta. Solicita entrega en 10 días hábiles.', trm: 4200
  },
  {
    id: 'dq-2', fecha: '2026-03-10', clienteId: 'dc-2', clienteNombre: 'Clínica San Rafael IPS',
    consecutivo: 'QUOTE-2026-002', compradorNombre: 'Dra. Claudia Ríos', compradorTelefono: '602-234-5678', compradorEmail: 'sistemas@clinicasanrafael.com.co',
    items: q2Items, subtotal: q2Sub, iva: q2Iva, total: q2Sub + q2Iva,
    utilidadTotal: (3100000 + 312000), ejecutivo: 'Ana Gómez', ejecutivoEmail: 'a.gomez@helpsoluciones.com.co', ejecutivoTelefono: '317-456-7890',
    usuarioId: 'demo-user-4', estado: 'Seguimiento', requiereAutorizacion: false,
    condiciones: 'Pago 50% anticipo, 50% contra entrega.', observaciones: 'Requieren instalaciíon y configuración incluida.', trm: 4200
  },
  {
    id: 'dq-3', fecha: '2026-03-15', clienteId: 'dc-3', clienteNombre: 'Alcaldía Municipal de Palmira',
    consecutivo: 'QUOTE-2026-003', compradorNombre: 'Ing. Hernán Salcedo', compradorTelefono: '602-987-1234', compradorEmail: 'sistemas@palmira.gov.co',
    items: q3Items, subtotal: q3Sub, iva: q3Iva, total: q3Sub + q3Iva,
    utilidadTotal: (5800000 + 880000), ejecutivo: 'Laura Ramírez', ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Ganado', autorizada: true, autorizadoPor: 'Carlos Demo', fechaAutorizacion: '2026-03-16',
    condiciones: 'Proceso de contratación pública. Pago 45 días post-entrega.', trm: 4200
  },
  {
    id: 'dq-4', fecha: '2026-04-02', clienteId: 'dc-4', clienteNombre: 'Universidad del Suroccidente',
    consecutivo: 'QUOTE-2026-004', compradorNombre: 'Arq. Pilar Montes',
    items: q4Items, subtotal: q4Sub, iva: q4Iva, total: q4Sub + q4Iva,
    utilidadTotal: (6080000 + 456000), ejecutivo: 'Ana Gómez', ejecutivoEmail: 'a.gomez@helpsoluciones.com.co', ejecutivoTelefono: '317-456-7890',
    usuarioId: 'demo-user-4', estado: 'Seguimiento', trm: 4200
  },
  {
    id: 'dq-5', fecha: '2026-03-20', clienteId: 'dc-5', clienteNombre: 'Ferretería Industrial Los Andes Ltda.',
    consecutivo: 'QUOTE-2026-005', compradorNombre: 'Jorge Pizarro',
    items: q5Items, subtotal: q5Sub, iva: q5Iva, total: q5Sub + q5Iva,
    utilidadTotal: (660000 + 100000), ejecutivo: 'Laura Ramírez', ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Perdido', observaciones: 'Cliente eligió proveedor local por precio. Seguimiento en Q3.', trm: 4200
  },
  {
    id: 'dq-6', fecha: '2026-04-10', clienteId: 'dc-1', clienteNombre: 'Constructora Andina S.A.S.',
    consecutivo: 'QUOTE-2026-006', compradorNombre: 'Ricardo Bermúdez',
    items: q6Items, subtotal: q6Sub, iva: q6Iva, total: q6Sub + q6Iva,
    utilidadTotal: (3100000 + 640000), ejecutivo: 'Ana Gómez', ejecutivoEmail: 'a.gomez@helpsoluciones.com.co', ejecutivoTelefono: '317-456-7890',
    usuarioId: 'demo-user-4', estado: 'Seguimiento', requiereAutorizacion: false, trm: 4200
  },
  {
    id: 'dq-7', fecha: '2026-04-18', clienteId: 'dc-2', clienteNombre: 'Clínica San Rafael IPS',
    consecutivo: 'QUOTE-2026-007', compradorNombre: 'Dra. Claudia Ríos',
    items: q7Items, subtotal: q7Sub, iva: q7Iva, total: q7Sub + q7Iva,
    utilidadTotal: 1700000, ejecutivo: 'Laura Ramírez', ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Ganado', autorizada: true, autorizadoPor: 'Carlos Demo', fechaAutorizacion: '2026-04-19', trm: 4200
  },
  {
    id: 'dq-8', fecha: '2026-05-03', clienteId: 'dc-3', clienteNombre: 'Alcaldía Municipal de Palmira',
    consecutivo: 'QUOTE-2026-008', compradorNombre: 'Ing. Hernán Salcedo',
    items: q8Items, subtotal: q8Sub, iva: q8Iva, total: q8Sub + q8Iva,
    utilidadTotal: (950000 + 1320000), ejecutivo: 'Ana Gómez', ejecutivoEmail: 'a.gomez@helpsoluciones.com.co', ejecutivoTelefono: '317-456-7890',
    usuarioId: 'demo-user-4', estado: 'Seguimiento', trm: 4200
  },
];

export const DEMO_CONDUCTORES: Conductor[] = [
  { id: 'ddrv-1', nombre: 'Juan Carlos Pérez', cedula: '79.456.123', telefono: '314-567-8901', placaVehiculo: 'SPQ-456', modeloVehiculo: 'Renault Kangoo 2022', tipoVehiculo: 'Furgón' },
  { id: 'ddrv-2', nombre: 'Andrés Mosquera', cedula: '1.092.345.678', telefono: '320-987-6543', placaVehiculo: 'HKL-789', modeloVehiculo: 'Chevrolet N300 2021', tipoVehiculo: 'Camioneta' },
];

const makeDespItems = (items: { productoId: string; nombre: string; numPart: string; cantidad: number }[]): DespachoItem[] =>
  items.map(i => ({ productoId: i.productoId, nombreProducto: i.nombre, numPart: i.numPart, cantidad: i.cantidad }));

export const DEMO_DESPACHOS: Despacho[] = [
  {
    id: 'ddes-1', cotizacionId: 'dq-1', consecutivoCotizacion: 'QUOTE-2026-001', fechaSolicitud: '2026-02-06',
    clienteId: 'dc-1', clienteNombre: 'Constructora Andina S.A.S.', direccion: 'Cra. 15 No. 93-75 Of. 202, Bogotá D.C.',
    items: makeDespItems([{ productoId: 'dp-prod-1', nombre: 'Laptop HP EliteBook 840 G9', numPart: 'HP-840G9-I7', cantidad: 5 }, { productoId: 'dp-prod-4', nombre: 'Monitor LG 27" Full HD IPS', numPart: 'LG-27MP60G', cantidad: 3 }]),
    total: q1Sub + q1Iva, ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Entregado', conductorId: 'ddrv-1', conductorNombre: 'Juan Carlos Pérez', facturado: true, fechaFacturado: '2026-02-20'
  },
  {
    id: 'ddes-2', cotizacionId: 'dq-3', consecutivoCotizacion: 'QUOTE-2026-003', fechaSolicitud: '2026-03-16',
    clienteId: 'dc-3', clienteNombre: 'Alcaldía Municipal de Palmira', direccion: 'Carrera 28 No. 28-04, Palmira',
    items: makeDespItems([{ productoId: 'dp-prod-2', nombre: 'Desktop Dell OptiPlex 7090', numPart: 'DEL-OPT7090-I5', cantidad: 10 }, { productoId: 'dp-prod-5', nombre: 'Switch Cisco Catalyst 24 puertos PoE', numPart: 'CSC-WS-C2960L-24', cantidad: 2 }]),
    total: q3Sub + q3Iva, ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Despachado', conductorId: 'ddrv-2', conductorNombre: 'Andrés Mosquera', facturado: false
  },
  {
    id: 'ddes-3', cotizacionId: 'dq-7', consecutivoCotizacion: 'QUOTE-2026-007', fechaSolicitud: '2026-04-19',
    clienteId: 'dc-2', clienteNombre: 'Clínica San Rafael IPS', direccion: 'Calle 34 No. 28-45, Cali',
    items: makeDespItems([{ productoId: 'dp-prod-12', nombre: 'Mantenimiento Preventivo PC / Laptop', numPart: 'SVC-MANT-PREV', cantidad: 20 }]),
    total: q7Sub + q7Iva, ejecutivoEmail: 'l.ramirez@helpsoluciones.com.co', ejecutivoTelefono: '311-234-5678',
    usuarioId: 'demo-user-2', estado: 'Entregado', conductorId: 'ddrv-1', conductorNombre: 'Juan Carlos Pérez', facturado: true, fechaFacturado: '2026-05-02'
  },
];

export const DEMO_VENTAS: VentaManual[] = [
  { id: 'dvm-1', fecha: '2026-01-20', clienteId: 'dc-5', clienteNombre: 'Ferretería Industrial Los Andes Ltda.', usuarioId: 'demo-user-2', usuarioNombre: 'Laura Ramírez', monto: 12000000, moneda: 'COP', tipoVenta: 'Contrato', descripcion: 'Contrato anual de mantenimiento preventivo 48 equipos', costo: 5000000 },
  { id: 'dvm-2', fecha: '2026-02-15', clienteId: 'dc-4', clienteNombre: 'Universidad del Suroccidente', usuarioId: 'demo-user-4', usuarioNombre: 'Ana Gómez', monto: 8500000, moneda: 'COP', tipoVenta: 'Licencia', descripcion: 'Licenciamiento antivirus corporativo 120 equipos - 1 año', costo: 3200000 },
  { id: 'dvm-3', fecha: '2026-03-08', clienteId: 'dc-1', clienteNombre: 'Constructora Andina S.A.S.', usuarioId: 'demo-user-2', usuarioNombre: 'Laura Ramírez', monto: 25000000, moneda: 'COP', tipoVenta: 'Contrato', descripcion: 'Proyecto cableado estructurado Torre B - Piso 5 al 12', costo: 14000000 },
  { id: 'dvm-4', fecha: '2026-04-10', clienteId: 'dc-2', clienteNombre: 'Clínica San Rafael IPS', usuarioId: 'demo-user-4', usuarioNombre: 'Ana Gómez', monto: 42000000, moneda: 'COP', tipoVenta: 'Licitacion', descripcion: 'Licitación 2026-007: Renovación infraestructura tecnológica UCI', costo: 28000000 },
  { id: 'dvm-5', fecha: '2026-05-02', clienteId: 'dc-3', clienteNombre: 'Alcaldía Municipal de Palmira', usuarioId: 'demo-user-2', usuarioNombre: 'Laura Ramírez', monto: 18000000, moneda: 'COP', tipoVenta: 'Contrato', descripcion: 'Contrato mantenimiento correctivo y preventivo 2026', costo: 8500000 },
];

export const DEMO_BUDGETS: SalesBudget[] = [
  { id: 'dbdg-1', usuarioId: 'demo-user-2', nombreVendedor: 'Laura Ramírez', anio: 2026, mes: 1, monto: 80000000 },
  { id: 'dbdg-2', usuarioId: 'demo-user-4', nombreVendedor: 'Ana Gómez',     anio: 2026, mes: 1, monto: 60000000 },
  { id: 'dbdg-3', usuarioId: 'demo-user-2', nombreVendedor: 'Laura Ramírez', anio: 2026, mes: 2, monto: 80000000 },
  { id: 'dbdg-4', usuarioId: 'demo-user-4', nombreVendedor: 'Ana Gómez',     anio: 2026, mes: 2, monto: 60000000 },
  { id: 'dbdg-5', usuarioId: 'demo-user-2', nombreVendedor: 'Laura Ramírez', anio: 2026, mes: 3, monto: 90000000 },
  { id: 'dbdg-6', usuarioId: 'demo-user-4', nombreVendedor: 'Ana Gómez',     anio: 2026, mes: 3, monto: 65000000 },
  { id: 'dbdg-7', usuarioId: 'demo-user-2', nombreVendedor: 'Laura Ramírez', anio: 2026, mes: 4, monto: 90000000 },
  { id: 'dbdg-8', usuarioId: 'demo-user-4', nombreVendedor: 'Ana Gómez',     anio: 2026, mes: 4, monto: 65000000 },
  { id: 'dbdg-9', usuarioId: 'demo-user-2', nombreVendedor: 'Laura Ramírez', anio: 2026, mes: 4, monto: 95000000 },
  { id: 'dbdg-10', usuarioId: 'demo-user-4', nombreVendedor: 'Ana Gómez',    anio: 2026, mes: 4, monto: 70000000 },
];
