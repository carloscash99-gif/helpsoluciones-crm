import React, { useState } from 'react';
import type { Conductor, Despacho, OrdenCompra, Cliente, Proveedor, Devolucion, Reparacion } from '../App';
import { supabase } from '../lib/supabaseClient';

interface IProps {
    conductores: Conductor[];
    despachos: Despacho[];
    ordenesCompra: OrdenCompra[];
    devoluciones: Devolucion[];
    reparaciones: Reparacion[];
    proveedores: Proveedor[];
    clientes: Cliente[];
    onAdd: (c: Conductor) => void;
    onUpdate: (c: Conductor) => void;
    onDelete: (id: string) => void;
    onUpdateDespacho: (d: Despacho) => void;
    onUpdateOC: (oc: OrdenCompra) => void;
    onUpdateDevolucion: (d: Devolucion) => void;
    onUpdateReparacion: (r: Reparacion) => void;
    onSendWhatsApp: (phone: string, message: string) => void;
}

const ConductoresModule: React.FC<IProps> = ({
    conductores,
    despachos,
    ordenesCompra,
    devoluciones,
    reparaciones,
    proveedores,
    clientes,
    onAdd,
    onUpdate,
    onDelete,
    onUpdateDespacho,
    onUpdateOC,
    onUpdateDevolucion,
    onUpdateReparacion,
    onSendWhatsApp
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Conductor>>({});
    const [viewingRoutesId, setViewingRoutesId] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [verifyingOC, setVerifyingOC] = useState<OrdenCompra | null>(null);
    const [verificationMatches, setVerificationMatches] = useState<{ [key: string]: boolean }>({});

    const handleSave = () => {
        if (formData.nombre && formData.cedula) {
            if (editingId) {
                onUpdate({ ...formData, id: editingId } as Conductor);
                setEditingId(null);
            } else {
                onAdd({ ...formData, id: crypto.randomUUID() } as Conductor);
                setIsAdding(false);
            }
            setFormData({});
        } else {
            alert('Por favor complete Nombre y Cédula');
        }
    };

    const handleFileChange = (field: keyof Conductor, file: File | null) => {
        if (file) {
            setFormData({ ...formData, [field]: file.name });
        }
    };

    const startEdit = (c: Conductor) => {
        setFormData(c);
        setEditingId(c.id);
        setIsAdding(false);
        setViewingRoutesId(null);
    };

    const cancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({});
    };

    const handleProofUpload = async (item: any, type: 'fotoEntrega' | 'fotoRemision', isOC: boolean, file: File | null) => {
        if (!file) return;

        // Generate unique file path
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${isOC ? 'recogidas' : 'entregas'}/${item.id}/${type}_${timestamp}_${safeName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('entregas')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error('Error subiendo archivo:', uploadError);
            alert(`Error al subir archivo: ${uploadError.message}`);
            return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('entregas')
            .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl || '';

        const updatedItem = { ...item, [type]: publicUrl };
        if (isOC) {
            onUpdateOC(updatedItem);
        } else if (updatedItem.consecutivo?.startsWith('DEV')) {
            onUpdateDevolucion(updatedItem as Devolucion);
        } else {
            onUpdateDespacho(updatedItem);
        }

        alert('✅ Archivo subido exitosamente.');
    };

    // Helpers to find provider and client robustly by ID or name
    const findProvider = (id?: string, name?: string): Proveedor | undefined => {
        if (id) {
            const byId = proveedores.find(p => p.id === id);
            if (byId) return byId;
        }
        if (name) {
            const clean = name.toLowerCase().trim();
            const byExact = proveedores.find(p => p.nombre && p.nombre.toLowerCase().trim() === clean);
            if (byExact) return byExact;
            const byPartial = proveedores.find(p => p.nombre && (
                p.nombre.toLowerCase().includes(clean) || clean.includes(p.nombre.toLowerCase().trim())
            ));
            if (byPartial) return byPartial;
        }
        return undefined;
    };

    const findClient = (id?: string, name?: string): Cliente | undefined => {
        if (id) {
            const byId = clientes.find(c => c.id === id);
            if (byId) return byId;
        }
        if (name) {
            const clean = name.toLowerCase().trim();
            const byExact = clientes.find(c => c.nombre && c.nombre.toLowerCase().trim() === clean);
            if (byExact) return byExact;
            const byPartial = clientes.find(c => c.nombre && (
                c.nombre.toLowerCase().includes(clean) || clean.includes(c.nombre.toLowerCase().trim())
            ));
            if (byPartial) return byPartial;
        }
        return undefined;
    };

    const cleanLocation = (target?: string | null): string => {
        if (!target) return '';
        const trimmed = target.trim();
        // Check if target is a coordinate pair: "lat, lng" or "lat,lng"
        const coordMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (coordMatch) {
            return `${coordMatch[1]},${coordMatch[2]}`;
        }
        return trimmed;
    };

    const getOCLocation = (oc: OrdenCompra): string => {
        const prov = findProvider(oc.proveedorId, oc.nombreProveedor);
        // Priority: provider coordinates (just updated) > provider address > oc georeferencia > oc name
        const raw = prov?.coordenadas || prov?.direccion || oc.georeferencia || oc.nombreProveedor;
        return cleanLocation(raw);
    };

    const getDespachoLocation = (d: Despacho): string => {
        const client = findClient(d.clienteId, d.clienteNombre);
        const raw = client?.coordenadas || d.georeferencia || d.direccion || client?.direccion || d.clienteNombre;
        return cleanLocation(raw);
    };

    const getDevolucionLocation = (dev: Devolucion): string => {
        const prov = findProvider(dev.proveedorId, dev.nombreProveedor);
        const raw = prov?.coordenadas || prov?.direccion || dev.nombreProveedor;
        return cleanLocation(raw);
    };

    const getReparacionLocation = (r: Reparacion): string => {
        const prov = findProvider(r.proveedorId, r.proveedorNombre);
        const client = findClient(r.clienteId, r.clienteNombre);
        const raw = prov?.coordenadas || client?.coordenadas || prov?.direccion || client?.direccion || r.proveedorNombre || r.clienteNombre;
        return cleanLocation(raw);
    };

    const openMap = (addressOrCoords: string) => {
        const target = cleanLocation(addressOrCoords);
        if (!target) {
            alert('No se encontró dirección o coordenadas para esta parada.');
            return;
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`, '_blank');
    };

    const openWaze = (addressOrCoords: string) => {
        const target = cleanLocation(addressOrCoords);
        if (!target) {
            alert('No se encontró dirección o coordenadas para esta parada.');
            return;
        }
        const coordMatch = target.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
        if (coordMatch) {
            // Con coordenadas GPS exactas abre Waze e inicia la navegación directa
            window.open(`https://waze.com/ul?ll=${coordMatch[1]},${coordMatch[2]}&navigate=yes`, '_blank');
        } else {
            // Con dirección o nombre busca y navega en Waze
            window.open(`https://waze.com/ul?q=${encodeURIComponent(target)}&navigate=yes`, '_blank');
        }
    };

    const openFirstSelectedInWaze = () => {
        if (selectedTasks.length === 0) return;
        const selectedDespachos = despachos.filter(d => selectedTasks.includes(d.id));
        const selectedOCs = ordenesCompra.filter(oc => selectedTasks.includes(oc.id));
        const selectedDevs = devoluciones.filter(dev => selectedTasks.includes(dev.id));
        const selectedReps = reparaciones.filter(r => selectedTasks.includes(r.id));

        const firstLoc = [
            ...selectedDespachos.map(getDespachoLocation),
            ...selectedOCs.map(getOCLocation),
            ...selectedDevs.map(getDevolucionLocation),
            ...selectedReps.map(getReparacionLocation)
        ].find(p => !!p && p.trim() !== '');

        if (!firstLoc) {
            alert('No se encontró ubicación válida en las paradas seleccionadas.');
            return;
        }
        openWaze(firstLoc);
    };

    const toggleTaskSelection = (id: string) => {
        setSelectedTasks(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const generateOptimizedRoute = () => {
        const selectedDespachos = despachos.filter(d => selectedTasks.includes(d.id));
        const selectedOCs = ordenesCompra.filter(oc => selectedTasks.includes(oc.id));
        const selectedDevs = devoluciones.filter(dev => selectedTasks.includes(dev.id));
        const selectedReps = reparaciones.filter(r => selectedTasks.includes(r.id));

        const routePoints = [
            "Help Soluciones Informáticas", // Punto de partida (Sede Empresa)
            ...selectedDespachos.map(getDespachoLocation),
            ...selectedOCs.map(getOCLocation),
            ...selectedDevs.map(getDevolucionLocation),
            ...selectedReps.map(getReparacionLocation)
        ].filter(p => !!p && p.trim() !== '');

        if (routePoints.length === 0) {
            alert('Seleccione al menos una parada para la ruta.');
            return;
        }

        // Google Maps Directions URL: https://www.google.com/maps/dir/Point1/Point2...
        const baseUrl = "https://www.google.com/maps/dir/";
        const routeString = routePoints.map(p => encodeURIComponent(p)).join('/');
        window.open(`${baseUrl}${routeString}`, '_blank');
    };

    const markAsCompleted = (item: any, type: 'oc' | 'dev' | 'despacho' | 'rep') => {
        if (type === 'oc') {
            onUpdateOC({ ...item, estado: 'Recogido' });
        } else if (type === 'dev') {
            onUpdateDevolucion({ ...item, estado: 'Completado' });
        } else if (type === 'rep') {
            onUpdateReparacion({ ...item, estado: 'Entregado' });
        } else {
            const despacho = item as Despacho;
            onUpdateDespacho({ ...despacho, estado: 'Entregado' });

            // WhatsApp notification to the person who created the quotation
            const message = `✅ *Entrega Realizada*\n\nOrden: ${despacho.consecutivoCotizacion}\nCliente: ${despacho.clienteNombre}\nDirección: ${despacho.direccion || 'N/A'}\nEstado: ENTREGADO\nConductor: ${currentConductor?.nombre || 'N/A'}`;

            // Notify the quote creator (ejecutivo) via WhatsApp
            if (despacho.ejecutivoTelefono) {
                onSendWhatsApp(despacho.ejecutivoTelefono, message);
            }
        }
    };

    const allAssignedDespachos = viewingRoutesId ? despachos.filter(d => d.conductorId === viewingRoutesId) : [];
    const allAssignedOCs = viewingRoutesId ? ordenesCompra.filter(oc => oc.conductorId === viewingRoutesId) : [];
    const allAssignedDevs = viewingRoutesId ? devoluciones.filter(dev => dev.conductorId === viewingRoutesId) : [];
    const allAssignedReps = viewingRoutesId ? reparaciones.filter(r => r.conductorId === viewingRoutesId) : [];

    const pendingDespachos = allAssignedDespachos.filter(d => d.estado !== 'Entregado');
    const completedDespachos = allAssignedDespachos.filter(d => d.estado === 'Entregado');

    const pendingOCs = allAssignedOCs.filter(oc => oc.estado !== 'Recogido');
    const completedOCs = allAssignedOCs.filter(oc => oc.estado === 'Recogido');

    const pendingDevs = allAssignedDevs.filter(dev => dev.estado !== 'Completado');
    const completedDevs = allAssignedDevs.filter(dev => dev.estado === 'Completado');

    const pendingReps = allAssignedReps.filter(r => r.estado !== 'Entregado' && r.estado !== 'Cerrado');
    const completedReps = allAssignedReps.filter(r => r.estado === 'Entregado' || r.estado === 'Cerrado');

    const currentConductor = conductores.find(c => c.id === viewingRoutesId);

    return (
        <div className="module-container">
            <div className="module-header">
                <h2>Gestión de Conductores</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({}); setViewingRoutesId(null); }}>+ Nuevo Conductor</button>
                </div>
            </div>

            {(isAdding || editingId) && (
                <div className="card animate-fade-in" style={{ marginBottom: '2rem', border: editingId ? '2px solid var(--primary-blue)' : 'none' }}>
                    <h3>{editingId ? 'Editar Conductor' : 'Añadir Nuevo Conductor'}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input className="input-field" placeholder="Nombre completo" value={formData.nombre || ''} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Cédula</label>
                            <input className="input-field" placeholder="Número de identificación" value={formData.cedula || ''} onChange={e => setFormData({ ...formData, cedula: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input className="input-field" placeholder="Celular" value={formData.telefono || ''} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Placa Vehículo</label>
                            <input className="input-field" placeholder="ABC-123" value={formData.placaVehiculo || ''} onChange={e => setFormData({ ...formData, placaVehiculo: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Modelo Vehículo</label>
                            <input className="input-field" placeholder="Ej: 2024" value={formData.modeloVehiculo || ''} onChange={e => setFormData({ ...formData, modeloVehiculo: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Tipo Vehículo</label>
                            <input className="input-field" placeholder="Ej: Camioneta, Camión, Moto" value={formData.tipoVehiculo || ''} onChange={e => setFormData({ ...formData, tipoVehiculo: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Tarjeta de Propiedad</label>
                            <div className="file-input-wrapper">
                                <input type="file" onChange={e => handleFileChange('tarjetaPropiedad', e.target.files?.[0] || null)} />
                                <small>{formData.tarjetaPropiedad || 'Ningún archivo'}</small>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>SOAT</label>
                            <div className="file-input-wrapper">
                                <input type="file" onChange={e => handleFileChange('soat', e.target.files?.[0] || null)} />
                                <small>{formData.soat || 'Ningún archivo'}</small>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tecnomecánica</label>
                            <div className="file-input-wrapper">
                                <input type="file" onChange={e => handleFileChange('tecnomecanica', e.target.files?.[0] || null)} />
                                <small>{formData.tecnomecanica || 'Ningún archivo'}</small>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button onClick={handleSave} className="btn-success">{editingId ? 'Actualizar' : 'Guardar'}</button>
                        <button className="btn-secondary" onClick={cancel}>Cancelar</button>
                    </div>
                </div>
            )}

            {!viewingRoutesId ? (
                <div className="card table-card animate-fade-in">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ minWidth: '180px' }}>Nombre</th>
                                    <th style={{ minWidth: '120px' }}>Cédula</th>
                                    <th style={{ minWidth: '100px' }}>Placa</th>
                                    <th style={{ minWidth: '150px' }}>Vehículo</th>
                                    <th className="text-center" style={{ minWidth: '180px' }}>Documentación</th>
                                    <th className="text-center" style={{ minWidth: '150px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conductores.length > 0 ? conductores.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>{c.nombre}</strong><br /><small>{c.telefono}</small></td>
                                        <td>{c.cedula}</td>
                                        <td><code className="part-number-badge">{c.placaVehiculo}</code></td>
                                        <td>{c.tipoVehiculo} ({c.modeloVehiculo})</td>
                                        <td className="text-center">
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                <span className={`doc-badge ${c.tarjetaPropiedad ? 'active' : ''}`}>📇 TP</span>
                                                <span className={`doc-badge ${c.soat ? 'active' : ''}`}>🛡️ S</span>
                                                <span className={`doc-badge ${c.tecnomecanica ? 'active' : ''}`}>🔧 T</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button className="btn-route" onClick={() => setViewingRoutesId(c.id)} title="Ver Rutas">🚚</button>
                                                <button className="btn-edit" onClick={() => startEdit(c)} title="Editar">✏️</button>
                                                <button className="btn-delete-icon" onClick={() => { if (window.confirm('¿Eliminar este conductor?')) onDelete(c.id) }} title="Eliminar">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No hay conductores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="route-assignment-view animate-fade-in">
                    <div className="route-header">
                        <button className="btn-back" onClick={() => { setViewingRoutesId(null); setSelectedTasks([]); }}>← Volver a lista</button>
                        <div className="route-title-group">
                            <h3>Hoja de Ruta: {currentConductor?.nombre}</h3>
                            <p>{currentConductor?.placaVehiculo} • {selectedTasks.length} paradas seleccionadas</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <button
                                className="btn-waze-header"
                                disabled={selectedTasks.length === 0}
                                onClick={openFirstSelectedInWaze}
                                title="Abrir la 1ª parada seleccionada directamente en Waze"
                            >
                                🚗 Waze (1ª Parada)
                            </button>
                            <button
                                className="btn-optimize"
                                disabled={selectedTasks.length === 0}
                                onClick={generateOptimizedRoute}
                                title="Generar ruta multipunto completa en Google Maps"
                            >
                                🚀 Ruta Maps ({selectedTasks.length})
                            </button>
                        </div>
                    </div>

                    <div className="tasks-grid">
                        <div className="task-column">
                            <h4>📦 Entregas Pendientes</h4>
                            {pendingDespachos.length > 0 ? pendingDespachos.map(d => {
                                const client = findClient(d.clienteId, d.clienteNombre);
                                const targetLoc = getDespachoLocation(d);
                                return (
                                <div key={d.id} className={`task-card ${selectedTasks.includes(d.id) ? 'selected-task' : ''}`}>
                                    <div className="task-main">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span className={`status-tag status-${d.estado.toLowerCase().replace(' ', '-')}`}>{d.estado}</span>
                                            <input
                                                type="checkbox"
                                                className="task-checkbox"
                                                checked={selectedTasks.includes(d.id)}
                                                onChange={() => toggleTaskSelection(d.id)}
                                            />
                                        </div>
                                        <p>{d.clienteNombre}</p>
                                        <strong>OC: {d.consecutivoCotizacion}</strong>
                                        <small>{d.direccion || client?.direccion || 'Sin dirección registrada'}</small>
                                        {(client?.coordenadas || d.georeferencia) && (
                                            <small style={{ display: 'block', color: 'var(--primary-blue)', fontWeight: 600 }}>
                                                📍 {client?.coordenadas || d.georeferencia}
                                            </small>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                <button className="btn-geo" onClick={() => openMap(targetLoc)} title="Abrir ubicación en Google Maps">📍 Maps</button>
                                                <button className="btn-waze" onClick={() => openWaze(targetLoc)} title="Navegar con Waze">🚗 Waze</button>
                                            </div>
                                            <button
                                                className="btn-complete"
                                                onClick={() => markAsCompleted(d, 'despacho')}
                                                disabled={d.estado === 'Entregado'}
                                            >
                                                🏁 Entregado
                                            </button>
                                        </div>
                                        <div className="upload-grid">
                                            <div className="upload-group">
                                                <label>📸 Foto Entrega</label>
                                                <input type="file" onChange={(e) => handleProofUpload(d, 'fotoEntrega', false, e.target.files?.[0] || null)} />
                                                {d.fotoEntrega && <span className="upload-success">✅ {d.fotoEntrega}</span>}
                                            </div>
                                            <div className="upload-group">
                                                <label>📄 Foto Remisión</label>
                                                <input type="file" onChange={(e) => handleProofUpload(d, 'fotoRemision', false, e.target.files?.[0] || null)} />
                                                {d.fotoRemision && <span className="upload-success">✅ {d.fotoRemision}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                            }) : <p className="empty-msg">No tiene entregas asignadas.</p>}
                        </div>

                        <div className="task-column">
                            <h4>🏭 Recogidas Pendientes</h4>
                            {pendingOCs.length > 0 ? pendingOCs.map(oc => {
                                const prov = findProvider(oc.proveedorId, oc.nombreProveedor);
                                const targetLoc = getOCLocation(oc);
                                return (
                                <div key={oc.id} className={`task-card oc-task ${selectedTasks.includes(oc.id) ? 'selected-task' : ''}`}>
                                    <div className="task-main">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span className={`status-tag status-${oc.estado.toLowerCase().replace(' ', '-')}`}>{oc.estado}</span>
                                            <input
                                                type="checkbox"
                                                className="task-checkbox"
                                                checked={selectedTasks.includes(oc.id)}
                                                onChange={() => toggleTaskSelection(oc.id)}
                                            />
                                        </div>
                                        <p>{oc.nombreProveedor}</p>
                                        <strong>Recogida: {oc.consecutivo}</strong>
                                        <small style={{ display: 'block' }}>{prov?.direccion ? prov.direccion : 'Cargar al proveedor asignado'}</small>
                                        {prov?.coordenadas && (
                                            <small style={{ display: 'block', color: 'var(--primary-blue)', fontWeight: 600 }}>
                                                📍 {prov.coordenadas}
                                            </small>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                <button className="btn-geo" onClick={() => openMap(targetLoc)} title="Abrir ubicación en Google Maps">📍 Maps</button>
                                                <button className="btn-waze" onClick={() => openWaze(targetLoc)} title="Navegar con Waze">🚗 Waze</button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                <button
                                                    className="btn-verify"
                                                    onClick={() => {
                                                        setVerifyingOC(oc);
                                                        setVerificationMatches({});
                                                    }}
                                                    title="Verificar items vs OC"
                                                >
                                                    🔍 Verificar
                                                </button>
                                                <button
                                                    className="btn-complete"
                                                    onClick={() => markAsCompleted(oc, 'oc')}
                                                    disabled={oc.estado === 'Recogido'}
                                                    style={{ backgroundColor: '#8b5cf6' }}
                                                >
                                                    🏁 Recogido
                                                </button>
                                            </div>
                                        </div>
                                        <div className="upload-grid">
                                            <div className="upload-group">
                                                <label>📸 Foto Recogida</label>
                                                <input type="file" onChange={(e) => handleProofUpload(oc, 'fotoEntrega', true, e.target.files?.[0] || null)} />
                                                {oc.fotoEntrega && <span className="upload-success">✅ {oc.fotoEntrega}</span>}
                                            </div>
                                            <div className="upload-group">
                                                <label>📄 Foto Remisión Prov.</label>
                                                <input type="file" onChange={(e) => handleProofUpload(oc, 'fotoRemision', true, e.target.files?.[0] || null)} />
                                                {oc.fotoRemision && <span className="upload-success">✅ {oc.fotoRemision}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                            }) : <p className="empty-msg">No tiene recogidas asignadas.</p>}
                        </div>

                        <div className="task-column">
                            <h4>🔙 Devoluciones Pendientes</h4>
                            {pendingDevs.length > 0 ? pendingDevs.map(dev => {
                                const prov = findProvider(dev.proveedorId, dev.nombreProveedor);
                                const targetLoc = getDevolucionLocation(dev);
                                return (
                                <div key={dev.id} className={`task-card dev-task ${selectedTasks.includes(dev.id) ? 'selected-task' : ''}`} style={{ borderLeftColor: '#f59e0b' }}>
                                    <div className="task-main">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span className={`status-tag status-${dev.estado.toLowerCase().replace(' ', '-')}`} style={{ background: '#fef3c7', color: '#92400e' }}>{dev.estado}</span>
                                            <input
                                                type="checkbox"
                                                className="task-checkbox"
                                                checked={selectedTasks.includes(dev.id)}
                                                onChange={() => toggleTaskSelection(dev.id)}
                                            />
                                        </div>
                                        <p>{dev.nombreProveedor}</p>
                                        <strong>Devolución: {dev.consecutivo}</strong>
                                        <small style={{ display: 'block' }}>{prov?.direccion ? prov.direccion : 'Llevar al proveedor asignado'}</small>
                                        {prov?.coordenadas && (
                                            <small style={{ display: 'block', color: '#b45309', fontWeight: 600 }}>
                                                📍 {prov.coordenadas}
                                            </small>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                <button className="btn-geo" onClick={() => openMap(targetLoc)} title="Abrir ubicación en Google Maps">📍 Maps</button>
                                                <button className="btn-waze" onClick={() => openWaze(targetLoc)} title="Navegar con Waze">🚗 Waze</button>
                                            </div>
                                            <button
                                                className="btn-complete"
                                                onClick={() => markAsCompleted(dev, 'dev')}
                                                disabled={dev.estado === 'Completado'}
                                                style={{ backgroundColor: '#f59e0b' }}
                                            >
                                                🏁 Entregado
                                            </button>
                                        </div>
                                        <div className="upload-grid">
                                            <div className="upload-group">
                                                <label>📸 Foto Entrega</label>
                                                <input type="file" onChange={(e) => handleProofUpload(dev, 'fotoEntrega', false, e.target.files?.[0] || null)} />
                                                {(dev as any).fotoEntrega && <span className="upload-success">✅ {(dev as any).fotoEntrega}</span>}
                                            </div>
                                            <div className="upload-group">
                                                <label>📄 Foto Remisión</label>
                                                <input type="file" onChange={(e) => handleProofUpload(dev, 'fotoRemision', false, e.target.files?.[0] || null)} />
                                                {(dev as any).fotoRemision && <span className="upload-success">✅ {(dev as any).fotoRemision}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                            }) : <p className="empty-msg">No tiene devoluciones asignadas.</p>}
                        </div>

                        <div className="task-column">
                            <h4>🛠️ Reparaciones (Ext.)</h4>
                            {pendingReps.length > 0 ? pendingReps.map(r => {
                                const prov = findProvider(r.proveedorId, r.proveedorNombre);
                                const client = findClient(r.clienteId, r.clienteNombre);
                                const targetLoc = getReparacionLocation(r);
                                return (
                                <div key={r.id} className={`task-card rep-task ${selectedTasks.includes(r.id) ? 'selected-task' : ''}`} style={{ borderLeftColor: '#0ea5e9' }}>
                                    <div className="task-main">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span className={`status-tag status-${r.estado.toLowerCase().replace(' ', '-')}`} style={{ background: '#e0f2fe', color: '#0369a1' }}>{r.estado}</span>
                                            <input
                                                type="checkbox"
                                                className="task-checkbox"
                                                checked={selectedTasks.includes(r.id)}
                                                onChange={() => toggleTaskSelection(r.id)}
                                            />
                                        </div>
                                        <p>{r.proveedorNombre || 'Proveedor Externo'}</p>
                                        <strong>Equip: {r.tipo} {r.marca}</strong>
                                        <small style={{ display: 'block' }}>Reparación de {r.clienteNombre} {prov?.direccion ? `• ${prov.direccion}` : ''}</small>
                                        {(prov?.coordenadas || client?.coordenadas) && (
                                            <small style={{ display: 'block', color: '#0369a1', fontWeight: 600 }}>
                                                📍 {prov?.coordenadas || client?.coordenadas}
                                            </small>
                                        )}
                                    </div>
                                    <div className="task-actions">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                                <button className="btn-geo" onClick={() => openMap(targetLoc)} title="Abrir ubicación en Google Maps">📍 Maps</button>
                                                <button className="btn-waze" onClick={() => openWaze(targetLoc)} title="Navegar con Waze">🚗 Waze</button>
                                            </div>
                                            <button
                                                className="btn-complete"
                                                onClick={() => markAsCompleted(r, 'rep')}
                                                disabled={r.estado === 'Entregado'}
                                                style={{ backgroundColor: '#0ea5e9' }}
                                            >
                                                🏁 Entregado
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                            }) : <p className="empty-msg">No tiene reparaciones asignadas.</p>}
                        </div>
                    </div>

                    {(completedDespachos.length > 0 || completedOCs.length > 0 || completedDevs.length > 0 || completedReps.length > 0) && (
                        <div className="completed-section animate-fade-in" style={{ marginTop: '3rem', borderTop: '2px dashed #cbd5e1', paddingTop: '2rem' }}>
                            <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                ✅ Tareas Finalizadas ({completedDespachos.length + completedOCs.length + completedDevs.length + completedReps.length})
                            </h3>
                            <div className="completed-grid" style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ background: '#f8fafc' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Consecutivo</th>
                                            <th>Cliente / Proveedor</th>
                                            <th>Dirección / Ubicación</th>
                                            <th className="text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedDespachos.map(d => (
                                            <tr key={d.id} style={{ opacity: 0.8 }}>
                                                <td><span className="badge-type delivery">Venta</span></td>
                                                <td><strong>{d.consecutivoCotizacion}</strong></td>
                                                <td>{d.clienteNombre}</td>
                                                <td><small>{d.direccion}</small></td>
                                                <td className="text-center"><span className="status-tag status-entregado">ENTREGADO</span></td>
                                            </tr>
                                        ))}
                                        {completedOCs.map(oc => (
                                            <tr key={oc.id} style={{ opacity: 0.8 }}>
                                                <td><span className="badge-type pickup">Compra</span></td>
                                                <td><strong>{oc.consecutivo}</strong></td>
                                                <td>{oc.nombreProveedor}</td>
                                                <td><small>Bodega Proveedor</small></td>
                                                <td className="text-center"><span className="status-tag status-recogido">RECOGIDO</span></td>
                                            </tr>
                                        ))}
                                        {completedDevs.map(dev => (
                                            <tr key={dev.id} style={{ opacity: 0.8 }}>
                                                <td><span className="badge-type" style={{ background: '#fef3c7', color: '#92400e' }}>Devolución</span></td>
                                                <td><strong>{dev.consecutivo}</strong></td>
                                                <td>{dev.nombreProveedor}</td>
                                                <td><small>Bodega Proveedor</small></td>
                                                <td className="text-center"><span className="status-tag" style={{ background: '#dcfce7', color: '#15803d' }}>COMPLETADO</span></td>
                                            </tr>
                                        ))}
                                        {completedReps.map(r => (
                                            <tr key={r.id} style={{ opacity: 0.8 }}>
                                                <td><span className="badge-type" style={{ background: '#e0f2fe', color: '#0369a1' }}>Reparación</span></td>
                                                <td><strong>{r.consecutivo}</strong></td>
                                                <td>{r.proveedorNombre || 'N/A'}</td>
                                                <td><small>Proveedor</small></td>
                                                <td className="text-center"><span className="status-tag status-entregado">ENTREGADO</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {verifyingOC && (
                <div className="modal-overlay animate-fade-in">
                    <div className="modal-content card" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Verificación de Mercancía: {verifyingOC.consecutivo}</h3>
                            <button className="btn-close" onClick={() => setVerifyingOC(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>
                        <div className="verification-body">
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>Coteje los productos físicos contra la orden de compra:</p>
                            <table className="inner-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.8rem' }}>Producto</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem' }}>Cant.</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifyingOC.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                                                <strong>{item.nombreProducto}</strong><br />
                                                <small style={{ color: '#94a3b8' }}>{item.numPart}</small>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>{item.cantidad}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    className={`btn-check ${verificationMatches[idx] ? 'matched' : ''}`}
                                                    onClick={() => setVerificationMatches({
                                                        ...verificationMatches,
                                                        [idx]: !verificationMatches[idx]
                                                    })}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #e2e8f0',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        background: verificationMatches[idx] ? '#ecfdf5' : 'white',
                                                        color: verificationMatches[idx] ? '#059669' : '#64748b',
                                                        borderColor: verificationMatches[idx] ? '#10b981' : '#e2e8f0',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {verificationMatches[idx] ? '✅ Recibido' : '⬜ Pendiente'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button
                                className="btn-success"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700' }}
                                onClick={() => {
                                    onUpdateOC({ ...verifyingOC, verificada: true });
                                    setVerifyingOC(null);
                                    alert('Mercancía marcada como verificada.');
                                }}
                            >
                                Confirmar Verificación Completa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .btn-verify {
                    background: #fdf2f8;
                    color: #be185d;
                    border: 1px solid #fbcfe8;
                    padding: 0.3rem 0.6rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                .btn-verify:hover { background: #fce7f3; }
                .btn-check.matched { transform: scale(1.05); }
                .form-group label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; }
                .file-input-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
                .file-input-wrapper input { font-size: 0.8rem; }
                .file-input-wrapper small { color: var(--primary-blue); font-size: 0.7rem; max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
                .doc-badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }
                .doc-badge.active { background: var(--secondary-blue); color: var(--primary-blue); border-color: var(--primary-blue); }
                .btn-route { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; }
                .btn-route:hover { background: #e0f2fe; }
                .route-header { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
                .route-title-group h3 { margin: 0; }
                .route-title-group p { margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--text-muted); }
                .btn-optimize { background: var(--primary-blue); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-optimize:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .btn-optimize:disabled { background: #cbd5e1; cursor: not-allowed; }
                .task-checkbox { width: 1.2rem; height: 1.2rem; cursor: pointer; }
                .selected-task { border: 2px solid var(--primary-blue); background: #f0f7ff; }
                .btn-complete { background: #059669; color: white; border: none; padding: 0.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
                .btn-complete:disabled { background: #cbd5e1; cursor: not-allowed; }
                .badge-type { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
                .badge-type.delivery { background: #dcfce7; color: #15803d; }
                .badge-type.pickup { background: #f3e8ff; color: #7e22ce; }
                .status-tag.status-entregado { background: #dcfce7; color: #15803d; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
                .status-tag.status-recogido { background: #f3e8ff; color: #7e22ce; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
                .tasks-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
                .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
                .btn-geo { background: #3b82f6; color: white; border: none; padding: 0.5rem 0.2rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; text-align: center; transition: all 0.2s; }
                .btn-geo:hover { background: #2563eb; transform: translateY(-1px); }
                .btn-waze { background: #33ccff; color: #082f49; border: none; padding: 0.5rem 0.2rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; text-align: center; transition: all 0.2s; }
                .btn-waze:hover { background: #00c3ff; transform: translateY(-1px); }
                .btn-waze-header { background: #33ccff; color: #082f49; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.3rem; }
                .btn-waze-header:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(51, 204, 255, 0.35); }
                .btn-waze-header:disabled { background: #cbd5e1; color: #64748b; cursor: not-allowed; }
                .upload-group label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.2rem; color: var(--text-muted); }
                .upload-group input { font-size: 0.75rem; width: 100%; }
                .upload-success { display: block; font-size: 0.7rem; color: #059669; font-weight: 600; margin-top: 0.1rem; }
                .empty-msg { text-align: center; color: var(--text-muted); padding: 2rem; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ConductoresModule;
