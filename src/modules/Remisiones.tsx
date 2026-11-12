import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateRemissionPDF } from '../services/remissionPdf';
import { ClientSearchSelect } from '../components/ClientSearchSelect';
import ProductSearchSelect from '../components/ProductSearchSelect';
import { type Cliente, type Producto, type AppUser } from '../types/crm';

interface IProps {
    clientes: Cliente[];
    productos: Producto[];
    currentUser: AppUser | null;
}

interface RemissionDetail {
    id: string;
    producto_id: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Remission {
    id: string;
    numero: string;
    fecha: string;
    cliente_id: string;
    total: number;
    estado: string;
    observaciones: string;
    cliente?: Cliente;
    detalles?: RemissionDetail[];
}

const RemisionesModule: React.FC<IProps> = ({ clientes = [], productos = [], currentUser }) => {
    const [remisiones, setRemisiones] = useState<Remission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filtroTabla, setFiltroTabla] = useState('');
    
    // Form State
    const [selectedClienteId, setSelectedClienteId] = useState('');
    const [remissionItems, setRemissionItems] = useState<Partial<RemissionDetail>[]>([]);
    const [observations, setObservations] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRemisiones();
    }, [clientes]);

    const fetchRemisiones = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('mkt_remisiones')
                .select(`
                    *,
                    detalles:mkt_remision_detalles(*)
                `)
                .order('fecha', { ascending: false });

            if (error) {
                console.error('Error fetching remissions:', error);
            } else {
                const enriched = (data || []).map((r: any) => ({
                    ...r,
                    cliente: clientes.find(c => c.id === r.cliente_id)
                }));
                setRemisiones(enriched);
            }
        } catch (err) {
            console.error('Crash in fetchRemisiones:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        const tempId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        setRemissionItems([...remissionItems, { id: tempId, producto_id: '', descripcion: '', cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
    };

    const handleUpdateItem = (id: string, field: keyof RemissionDetail, value: any) => {
        setRemissionItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'producto_id') {
                    const prod = productos.find(p => p.id === value);
                    updated.descripcion = prod?.nombre || '';
                    updated.precio_unitario = Math.round((prod?.precioCompra || 0) * 1.15 * 100) / 100; // precio sugerido
                }
                updated.subtotal = (Number(updated.cantidad) || 0) * (Number(updated.precio_unitario) || 0);
                return updated;
            }
            return item;
        }));
    };

    const handleRemoveItem = (id: string) => {
        setRemissionItems(prev => prev.filter(i => i.id !== id));
    };

    const calculateTotal = () => {
        return remissionItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    };

    const handleSave = async () => {
        if (!selectedClienteId || remissionItems.length === 0) {
            alert('Por favor seleccione un cliente y al menos un producto.');
            return;
        }

        // Validar que todos los items tengan un producto y una descripción válidos
        const tieneItemsInvalidos = remissionItems.some(item => !item.producto_id || !item.descripcion);
        if (tieneItemsInvalidos) {
            alert('Por favor seleccione un producto para todos los items agregados.');
            return;
        }

        setIsSaving(true);
        try {
            const numero = `REM-${Date.now().toString(36).toUpperCase()}`;
            const total = calculateTotal();

            const { data: header, error: hError } = await supabase
                .from('mkt_remisiones')
                .insert([{
                    numero,
                    cliente_id: selectedClienteId,
                    total,
                    estado: 'entregada',
                    observaciones: observations,
                    usuario_id: currentUser?.id
                }])
                .select();

            if (hError || !header || header.length === 0) {
                alert('Error al guardar cabecera: ' + (hError?.message || 'Sin respuesta'));
                setIsSaving(false);
                return;
            }

            const detailsPayload = remissionItems.map(item => ({
                remision_id: header[0].id,
                producto_id: item.producto_id,
                descripcion: item.descripcion || 'Producto',
                cantidad: Number(item.cantidad) || 1,
                precio_unitario: Number(item.precio_unitario) || 0,
                subtotal: Number(item.subtotal) || 0
            }));

            const { error: dError } = await supabase
                .from('mkt_remision_detalles')
                .insert(detailsPayload);

            if (dError) {
                alert('Error al guardar detalles: ' + dError.message);
            } else {
                alert('Remisión guardada con éxito.');
                setShowForm(false);
                setSelectedClienteId('');
                setRemissionItems([]);
                setObservations('');
                fetchRemisiones();
            }
        } catch (err: any) {
            console.error('Error in handleSave:', err);
            alert('Error inesperado al guardar: ' + (err.message || ''));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadPDF = async (r: Remission) => {
        try {
            let clienteObj = r.cliente || clientes.find(c => c.id === r.cliente_id);
            if (!clienteObj && r.cliente_id) {
                // Intento directo a la base de datos si aún no estaba en memoria
                const { data: cData } = await supabase.from('clientes').select('*').eq('id', r.cliente_id).maybeSingle();
                if (cData) clienteObj = cData;
            }

            const clienteFinal = {
                nombre: clienteObj?.nombre || 'Cliente General',
                nit: clienteObj?.nit || 'N/A',
                direccion: clienteObj?.direccion || 'N/A',
                telefono: clienteObj?.telefono || 'N/A',
                correo: clienteObj?.correo || 'N/A'
            };

            generateRemissionPDF({
                numero: r.numero,
                fecha: r.fecha,
                cliente: clienteFinal,
                items: (r.detalles || []).map(d => ({
                    descripcion: d.descripcion,
                    cantidad: Number(d.cantidad) || 0,
                    precio_unitario: Number(d.precio_unitario) || 0,
                    subtotal: Number(d.subtotal) || 0
                })),
                total: Number(r.total) || 0,
                observaciones: r.observaciones
            });
        } catch (err: any) {
            console.error('Error al generar PDF de remisión:', err);
            alert('Error al generar PDF: ' + (err.message || 'Error desconocido'));
        }
    };

    const remisionesFiltradas = remisiones.filter(r => {
        if (!filtroTabla.trim()) return true;
        const term = filtroTabla.toLowerCase();
        const numMatch = (r.numero || '').toLowerCase().includes(term);
        const cliMatch = (r.cliente?.nombre || '').toLowerCase().includes(term);
        const nitMatch = (r.cliente?.nit || '').toLowerCase().includes(term);
        const obsMatch = (r.observaciones || '').toLowerCase().includes(term);
        return numMatch || cliMatch || nitMatch || obsMatch;
    });

    if (showForm) {
        return (
            <div className="card" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>📄 Nueva Remisión</h2>
                    <button className="btn-expand" onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem' }}>✕</button>
                </div>

                <div className="form-grid-modern" style={{ marginBottom: '2rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontWeight: 700, marginBottom: '0.4rem', display: 'block', color: '#1e293b' }}>
                            Cliente <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <ClientSearchSelect
                            clientes={clientes}
                            value={selectedClienteId}
                            onChange={(id) => setSelectedClienteId(id)}
                            placeholder="🔍 Buscar cliente por nombre, NIT, contacto o ciudad..."
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: '#475569' }}>Productos / Servicios</h4>
                        <button className="btn btn-success" onClick={handleAddItem}>+ Añadir Item</button>
                    </div>
                    
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <table className="data-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '280px' }}>Producto</th>
                                    <th style={{ width: '100px' }}>Cant.</th>
                                    <th style={{ width: '150px' }}>P. Unitario</th>
                                    <th style={{ width: '150px' }}>Subtotal</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {remissionItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                                            No hay items agregados. Haga clic en <strong>+ Añadir Item</strong> para comenzar.
                                        </td>
                                    </tr>
                                ) : (
                                    remissionItems.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ padding: '4px 8px' }}>
                                                <ProductSearchSelect
                                                    productos={productos}
                                                    value={item.producto_id || ''}
                                                    onChange={(val) => handleUpdateItem(item.id!, 'producto_id', val)}
                                                    placeholder="-- Buscar producto o parte --"
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="input-field"
                                                    style={{ border: 'none', background: 'transparent', textAlign: 'center' }}
                                                    value={item.cantidad}
                                                    onChange={(e) => handleUpdateItem(item.id!, 'cantidad', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="input-field"
                                                    style={{ border: 'none', background: 'transparent', textAlign: 'right' }}
                                                    value={item.precio_unitario}
                                                    onChange={(e) => handleUpdateItem(item.id!, 'precio_unitario', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                ${(item.subtotal || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="btn-delete-icon" onClick={() => handleRemoveItem(item.id!)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot style={{ background: '#f8fafc' }}>
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800 }}>TOTAL:</td>
                                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#2563eb', fontSize: '1.1rem' }}>
                                        ${calculateTotal().toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label style={{ fontWeight: 700, color: '#1e293b' }}>Observaciones</label>
                    <textarea 
                        className="input-field"
                        style={{ height: '80px' }}
                        placeholder="Notas adicionales para la entrega..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                    ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : '💾 Guardar Remisión'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Histórico de Remisiones</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Gestión y descarga de documentos de remisión de entrega.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '260px' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="🔍 Buscar remisión o cliente..."
                            value={filtroTabla}
                            onChange={(e) => setFiltroTabla(e.target.value)}
                            style={{ paddingLeft: '2rem', height: '38px', fontSize: '0.9rem' }}
                        />
                        {filtroTabla && (
                            <button
                                type="button"
                                onClick={() => setFiltroTabla('')}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>
                        + Nueva Remisión
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                                <th style={{ textAlign: 'center' }}>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        Cargando remisiones...
                                    </td>
                                </tr>
                            ) : remisionesFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        {filtroTabla ? 'No se encontraron remisiones que coincidan con la búsqueda.' : 'No se encontraron remisiones registradas.'}
                                    </td>
                                </tr>
                            ) : (
                                remisionesFiltradas.map((r) => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 700, color: '#1e293b' }}>{r.numero}</td>
                                        <td>{new Date(r.fecha).toLocaleDateString('es-CO')}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{r.cliente?.nombre || 'Buscando...'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.cliente?.nit}</div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                            ${(Number(r.total) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                                                {r.estado}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button 
                                                className="btn-download" 
                                                onClick={() => handleDownloadPDF(r)}
                                                title="Descargar PDF de Remisión"
                                                style={{ fontSize: '1.2rem', cursor: 'pointer', background: 'transparent', border: 'none' }}
                                            >
                                                📄
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RemisionesModule;
