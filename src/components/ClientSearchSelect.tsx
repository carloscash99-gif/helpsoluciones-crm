import React, { useState, useRef, useEffect } from 'react';
import type { Cliente } from '../types/crm';

interface ClientSearchSelectProps {
    clientes: Cliente[];
    value: string;
    onChange: (clienteId: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export const ClientSearchSelect: React.FC<ClientSearchSelectProps> = ({
    clientes = [],
    value,
    onChange,
    placeholder = '-- Seleccionar Cliente (Escriba para buscar) --',
    className = 'input-field',
    style: customStyle,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedCliente = clientes.find(c => c.id === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const normalize = (txt: string) => (txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredClientes = clientes.filter(c => {
        if (!search.trim()) return true;
        const term = normalize(search);
        const nameMatch = normalize(c.nombre).includes(term);
        const nitMatch = (c.nit || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) || normalize(c.nit).includes(term);
        const contactMatch = normalize(c.contacto).includes(term);
        const cityMatch = normalize(c.ciudad || '').includes(term);
        return nameMatch || nitMatch || contactMatch || cityMatch;
    });

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', ...customStyle }}>
            <div
                className={className}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: disabled ? '#f1f5f9' : 'white',
                    minHeight: '42px',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    userSelect: 'none',
                    transition: 'border-color 0.2s',
                    borderColor: isOpen ? '#2563eb' : '#cbd5e1',
                    boxShadow: isOpen ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none'
                }}
                onClick={() => {
                    if (!disabled) setIsOpen(!isOpen);
                }}
            >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', color: '#64748b' }}>🏢</span>
                    {selectedCliente ? (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2', overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {selectedCliente.nombre}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                NIT: {selectedCliente.nit || 'Sin NIT'} {selectedCliente.ciudad ? `· ${selectedCliente.ciudad}` : ''}
                            </span>
                        </div>
                    ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{placeholder}</span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                    {selectedCliente && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            title="Quitar selección"
                            style={{
                                border: 'none',
                                background: '#f1f5f9',
                                color: '#64748b',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}
                        >
                            ✕
                        </button>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        ▼
                    </span>
                </div>
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        maxHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 100,
                        overflow: 'hidden'
                    }}
                >
                    {/* Search Input */}
                    <div style={{ padding: '0.6rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, NIT, contacto o ciudad..."
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                background: 'transparent',
                                fontSize: '0.9rem',
                                color: '#1e293b'
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                } else if (e.key === 'Enter' && filteredClientes.length > 0) {
                                    e.preventDefault();
                                    handleSelect(filteredClientes[0].id);
                                }
                            }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }}>
                        {filteredClientes.length === 0 ? (
                            <div style={{ padding: '1.2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                No se encontraron clientes con "{search}"
                            </div>
                        ) : (
                            filteredClientes.map((c) => {
                                const isSelected = c.id === value;
                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelect(c.id)}
                                        style={{
                                            padding: '0.65rem 0.9rem',
                                            borderBottom: '1px solid #f8fafc',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.2rem',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: isSelected ? '#1d4ed8' : '#1e293b' }}>
                                                {c.nombre}
                                            </span>
                                            {c.ciudad && (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {c.ciudad}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                                            <span>NIT: <strong>{c.nit || 'S/N'}</strong></span>
                                            {c.contacto && <span>Contacto: {c.contacto}</span>}
                                            {c.telefono && <span>Tel: {c.telefono}</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {filteredClientes.length > 0 && (
                        <div style={{ padding: '0.4rem 0.8rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                            {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientSearchSelect;
