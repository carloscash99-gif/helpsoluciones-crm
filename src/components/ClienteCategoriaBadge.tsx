import React from 'react';

export type CategoriaCliente = 'A' | 'B' | 'C' | 'D';

export interface CategoriaConfig {
  letra: CategoriaCliente;
  nombreColor: string;
  label: string;
  bg: string;
  border: string;
  color: string;
  dotColor: string;
}

export const CATEGORIAS_CLIENTE: Record<CategoriaCliente, CategoriaConfig> = {
  A: {
    letra: 'A',
    nombreColor: 'Amarillo',
    label: 'A (Amarillo)',
    bg: '#fef9c3',
    border: '#facc15',
    color: '#854d0e',
    dotColor: '#eab308'
  },
  B: {
    letra: 'B',
    nombreColor: 'Verde',
    label: 'B (Verde)',
    bg: '#dcfce7',
    border: '#4ade80',
    color: '#166534',
    dotColor: '#16a34a'
  },
  C: {
    letra: 'C',
    nombreColor: 'Rojo',
    label: 'C (Rojo)',
    bg: '#fee2e2',
    border: '#f87171',
    color: '#991b1b',
    dotColor: '#dc2626'
  },
  D: {
    letra: 'D',
    nombreColor: 'Naranja',
    label: 'D (Naranja)',
    bg: '#ffedd5',
    border: '#fb923c',
    color: '#9a3412',
    dotColor: '#ea580c'
  }
};

interface BadgeProps {
  categoria?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ClienteCategoriaBadge: React.FC<BadgeProps> = ({
  categoria,
  size = 'md',
  showLabel = false
}) => {
  const letra = (categoria?.toUpperCase() || 'A') as CategoriaCliente;
  const config = CATEGORIAS_CLIENTE[letra] || CATEGORIAS_CLIENTE.A;

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const dotSize = isSm ? '6px' : isLg ? '10px' : '8px';
  const fontSize = isSm ? '0.72rem' : isLg ? '0.9rem' : '0.8rem';
  const padding = isSm ? '1px 6px' : isLg ? '4px 12px' : '2px 8px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '12px',
        fontSize,
        fontWeight: 700,
        backgroundColor: config.bg,
        border: `1.5px solid ${config.border}`,
        color: config.color,
        letterSpacing: '0.3px',
        lineHeight: 1.2,
        verticalAlign: 'middle',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'default'
      }}
      title={`Categoría ${config.letra} (${config.nombreColor})`}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          display: 'inline-block',
          boxShadow: `0 0 0 1px ${config.border}`
        }}
      />
      <span>{showLabel ? `Cat. ${config.letra} (${config.nombreColor})` : config.letra}</span>
    </span>
  );
};

export default ClienteCategoriaBadge;
