import { useState, useEffect } from 'react'
import './index.css'
import ClientesModule from './modules/Clientes'
import CotizacionesModule from './modules/Cotizaciones'
import ProveedoresModule from './modules/Proveedores'
import ProductosModule from './modules/Productos'
import InformesModule from './modules/Informes'
import OrdenesCompraModule from './modules/OrdenesCompra'
import LogisticaModule from './modules/Logistica'
import ConductoresModule from './modules/Conductores'
import ReparacionesModule from './modules/Reparaciones'
import AdminModule from './modules/Admin'
import Login from './modules/Login'
import VendedoresModule from './modules/Vendedores'

// Types for shared data
export interface AppUser {
  id: string;
  nombre: string;
  usuario: string;
  cargo: string;
  email: string;
  telefono: string;
  rol: 'Admin' | 'Comercial' | 'Logistica' | 'Tecnico';
  permisos: string[]; // List of module IDs
  password?: string;
}
export interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  coordenadas?: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  coordenadas: string;
}

export interface Producto {
  id: string;
  nombre: string;
  numPart: string;
  descripcion: string;
  unidad: string;
  precioCompra: number;
  history: { date: string; price: number }[];
}

export interface OrdenCompraItem {
  id: string;
  productoId: string;
  nombreProducto: string;
  numPart: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenCompra {
  id: string;
  consecutivo: string;
  fecha: string;
  proveedorId: string;
  nombreProveedor: string;
  items: OrdenCompraItem[];
  subtotal: number;
  iva: number;
  total: number;
  condicionesComerciales: string;
  observaciones: string;
  estado: 'Pendiente' | 'Recogido' | 'En Bodega';
  conductorId?: string;
  conductorNombre?: string;
  fotoEntrega?: string;
  fotoRemision?: string;
  georeferencia?: string;
  usuarioId: string;
}

export interface CotizacionItem {
  id: string;
  productoId: string;
  proveedorId: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
  utilidad: number;
  iva: number;
}

export interface Cotizacion {
  id: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  consecutivo: string;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  ejecutivo: string;
  ejecutivoEmail: string;
  ejecutivoTelefono?: string;
  usuarioId: string;
  estado: 'Seguimiento' | 'Ganado' | 'Perdido';
}

export interface Conductor {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  placaVehiculo: string;
  modeloVehiculo: string;
  tipoVehiculo: string;
  tarjetaPropiedad?: string; // Filename or Base64
  soat?: string;
  tecnomecanica?: string;
}

export interface DespachoItem {
  productoId: string;
  nombreProducto: string;
  numPart: string;
  cantidad: number;
}

export interface Despacho {
  id: string;
  cotizacionId: string;
  consecutivoCotizacion: string;
  fechaSolicitud: string;
  clienteId: string;
  clienteNombre: string;
  direccion: string;
  items: DespachoItem[];
  total: number;
  ejecutivoEmail: string;
  ejecutivoTelefono?: string;
  usuarioId: string;
  estado: 'Pendiente' | 'Preparando' | 'Despachado' | 'Entregado' | 'Entrega Parcial';
  conductorId?: string;
  conductorNombre?: string;
  fotoEntrega?: string;
  fotoRemision?: string;
  georeferencia?: string;
}

export interface Reparacion {
  id: string;
  consecutivo: string;
  clienteId: string;
  clienteNombre: string;
  marca: string;
  tipo: string;
  serial: string;
  observaciones: string;
  estado: 'Recibido' | 'En Diagnóstico' | 'En Reparación' | 'Esperando Repuestos' | 'Reparado' | 'Entregado' | 'Cerrado';
  tipoServicio: 'HELP SOLUCIONES' | 'Proveedor';
  proveedorId?: string;
  proveedorNombre?: string;
  foto?: string;
  fechaIngreso: string;
}

export interface SalesBudget {
  id: string;
  usuarioId: string;
  nombreVendedor: string;
  anio: number;
  mes: number; // 0-11
  monto: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Shared state with localStorage persistence
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('hs_clientes');
    return saved ? JSON.parse(saved) : [
      { id: '1', nombre: 'Help Soluciones Inc', nit: '900.123.456-7', contacto: 'Juan Perez', telefono: '3001234567', correo: 'juan@helpsoluciones.com', direccion: 'Calle 123 #45-67' },
    ];
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    const saved = localStorage.getItem('hs_proveedores');
    return saved ? JSON.parse(saved) : [
      { id: '1', nombre: 'Distribuidora Global', nit: '800.456.789-0', contacto: 'Maria Lopez', telefono: '3109876543', correo: 'mlopez@global.com', direccion: 'Av. Siempre Viva 742', coordenadas: '4.6097, -74.0817' },
    ];
  });

  const [productos, setProductos] = useState<Producto[]>(() => {
    const saved = localStorage.getItem('hs_productos');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        nombre: 'Laptop Pro',
        numPart: 'LP-2024-X1',
        descripcion: 'Alta gama',
        unidad: 'Und',
        precioCompra: 3500000,
        history: [{ date: '2024-02-15', price: 3500000 }]
      },
    ];
  });

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() => {
    const saved = localStorage.getItem('hs_cotizaciones');
    return saved ? JSON.parse(saved) : [];
  });

  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(() => {
    const saved = localStorage.getItem('hs_ordenes_compra');
    return saved ? JSON.parse(saved) : [];
  });

  const [despachos, setDespachos] = useState<Despacho[]>(() => {
    const saved = localStorage.getItem('hs_despachos');
    return saved ? JSON.parse(saved) : [];
  });

  const [conductores, setConductores] = useState<Conductor[]>(() => JSON.parse(localStorage.getItem('hs_conductores') || '[]'));
  const [reparaciones, setReparaciones] = useState<Reparacion[]>(() => JSON.parse(localStorage.getItem('hs_reparaciones') || '[]'));

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('hs_users');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        nombre: 'Administrador Principal',
        usuario: 'admin',
        cargo: 'Gerencia',
        email: 'admin@helpsoluciones.com',
        telefono: '3160000000',
        rol: 'Admin',
        permisos: ['dashboard', 'cotizaciones', 'ordenes-compra', 'clientes', 'productos', 'proveedores', 'conductores', 'logistica', 'reparaciones', 'informes', 'admin', 'vendedores'],
        password: 'admin'
      }
    ];
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('hs_is_logged_in') === 'true');
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('hs_current_user');
    return saved ? JSON.parse(saved) : users[0];
  });

  useEffect(() => { localStorage.setItem('hs_is_logged_in', isLoggedIn ? 'true' : 'false'); }, [isLoggedIn]);

  const [budgets, setBudgets] = useState<SalesBudget[]>(() => {
    const saved = localStorage.getItem('hs_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('hs_clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('hs_proveedores', JSON.stringify(proveedores)); }, [proveedores]);
  useEffect(() => { localStorage.setItem('hs_productos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('hs_cotizaciones', JSON.stringify(cotizaciones)); }, [cotizaciones]);
  useEffect(() => { localStorage.setItem('hs_ordenes_compra', JSON.stringify(ordenesCompra)); }, [ordenesCompra]);
  useEffect(() => { localStorage.setItem('hs_despachos', JSON.stringify(despachos)); }, [despachos]);
  useEffect(() => localStorage.setItem('hs_conductores', JSON.stringify(conductores)), [conductores]);
  useEffect(() => localStorage.setItem('hs_reparaciones', JSON.stringify(reparaciones)), [reparaciones]);
  useEffect(() => localStorage.setItem('hs_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('hs_current_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('hs_budgets', JSON.stringify(budgets)), [budgets]);

  // Update handlers
  const addCliente = (c: Cliente) => setClientes([...clientes, c]);
  const updateCliente = (c: Cliente) => setClientes(clientes.map(item => item.id === c.id ? c : item));
  const deleteCliente = (id: string) => setClientes(clientes.filter(c => c.id !== id));

  const addProveedor = (p: Proveedor) => setProveedores([...proveedores, p]);
  const updateProveedor = (p: Proveedor) => setProveedores(proveedores.map(item => item.id === p.id ? p : item));
  const deleteProveedor = (id: string) => setProveedores(proveedores.filter(p => p.id !== id));

  const addProducto = (p: Producto) => setProductos([...productos, p]);
  const updateProducto = (p: Producto) => setProductos(productos.map(item => item.id === p.id ? p : item));
  const deleteProducto = (id: string) => setProductos(productos.filter(p => p.id !== id));

  const updateDespacho = (d: Despacho) => {
    const oldDespacho = despachos.find(item => item.id === d.id);
    setDespachos(despachos.map(item => item.id === d.id ? d : item));

    // Notify if status changed
    if (oldDespacho && oldDespacho.estado !== d.estado) {
      sendEmailNotification(
        d.ejecutivoEmail,
        `Cambio de Estado Pedido: ${d.consecutivoCotizacion}`,
        `Hola, el pedido asociado a la cotización ${d.consecutivoCotizacion} ha cambiado su estado de "${oldDespacho.estado}" a "${d.estado}".`
      );
    }
  };
  const deleteDespacho = (id: string) => setDespachos(despachos.filter(d => d.id !== id));

  const addReparacion = (r: Reparacion) => setReparaciones(prev => [r, ...prev]);
  const updateReparacion = (r: Reparacion) => setReparaciones(prev => prev.map(item => item.id === r.id ? r : item));
  const deleteReparacion = (id: string) => setReparaciones(prev => prev.filter(r => r.id !== id));

  // Notification Helper (Simulated)
  const sendEmailNotification = (to: string, subject: string, body: string) => {
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\nBody: ${body}`);
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const sendWhatsAppNotification = (phone: string, message: string) => {
    console.log(`[SIMULATED WHATSAPP] To: ${phone}\nMessage: ${message}`);
    const encodedMsg = encodeURIComponent(message);
    const url = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  const addCotizacion = (c: Cotizacion) => setCotizaciones(prev => [c, ...prev]);

  const updateCotizacion = (c: Cotizacion) => {
    setCotizaciones(prev => prev.map(item => item.id === c.id ? c : item));

    // Automation: If status is 'Ganado' and no despacho exists, create one
    if (c.estado === 'Ganado' && !despachos.some(d => d.cotizacionId === c.id)) {
      const client = clientes.find(cli => cli.id === c.clienteId);

      // Robust mapping for items
      const despachoItems = (c.items || []).map(item => {
        const prod = productos.find(p => p.id === item.productoId);
        return {
          productoId: item.productoId,
          nombreProducto: prod?.nombre || 'Producto Desconocido',
          numPart: prod?.numPart || 'N/A',
          cantidad: item.cantidad || 0
        };
      });

      const newDespacho: Despacho = {
        id: Date.now().toString(),
        cotizacionId: c.id,
        consecutivoCotizacion: c.consecutivo,
        fechaSolicitud: new Date().toLocaleDateString(),
        clienteId: c.clienteId,
        clienteNombre: c.clienteNombre,
        direccion: client?.direccion || 'N/A',
        items: despachoItems,
        total: c.total,
        ejecutivoEmail: c.ejecutivoEmail || '',
        ejecutivoTelefono: c.ejecutivoTelefono,
        usuarioId: c.usuarioId,
        estado: 'Pendiente'
      };

      setDespachos(prev => [newDespacho, ...prev]);

      // Notify executive of new dispatch (Outside state setter)
      if (c.ejecutivoEmail) {
        sendEmailNotification(
          c.ejecutivoEmail,
          `Nuevo Pedido: ${c.consecutivo}`,
          `Hola, tu cotización ${c.consecutivo} ha sido marcada como GANADA y ya se encuentra en trámite de logística.`
        );
      }

      // Notify Logistics Team
      sendEmailNotification(
        'logistica@helpsoluciones.com.co',
        `NUEVO PEDIDO - Cotización ${c.consecutivo}`,
        `Se ha generado un nuevo pedido desde la cotización ${c.consecutivo} para el cliente ${c.clienteNombre}.\n\nPor favor iniciar el proceso de alistamiento y despacho.`
      );
    }
  };

  const addOrdenCompra = (oc: OrdenCompra) => setOrdenesCompra([oc, ...ordenesCompra]);
  const updateOrdenCompra = (oc: OrdenCompra) => setOrdenesCompra(ordenesCompra.map(item => item.id === oc.id ? oc : item));
  const deleteOrdenCompra = (id: string) => setOrdenesCompra(ordenesCompra.filter(oc => oc.id !== id));

  const addConductor = (c: Conductor) => setConductores([...conductores, c]);
  const updateConductor = (c: Conductor) => setConductores(conductores.map(item => item.id === c.id ? c : item));
  const deleteConductor = (id: string) => setConductores(conductores.filter(c => c.id !== id));

  const addUser = (u: AppUser) => setUsers([...users, u]);
  const updateUser = (u: AppUser) => {
    setUsers(users.map(item => item.id === u.id ? u : item));
    if (currentUser.id === u.id) setCurrentUser(u);
  };
  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert('No puedes eliminar tu propio usuario.');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
  };

  const addBudget = (b: SalesBudget) => setBudgets([...budgets, b]);
  const updateBudget = (b: SalesBudget) => setBudgets(budgets.map(item => item.id === b.id ? b : item));
  const deleteBudget = (id: string) => setBudgets(budgets.filter(b => b.id !== id));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: '📄' },
    { id: 'ordenes-compra', label: 'Ordenes de Compra', icon: '🛒' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'proveedores', label: 'Proveedores', icon: '🏭' },
    { id: 'conductores', label: 'Conductores', icon: '🆔' },
    { id: 'logistica', label: 'Logística', icon: '🚚' },
    { id: 'reparaciones', label: 'Reparaciones', icon: '🛠️' },
    { id: 'informes', label: 'Informes', icon: '📈' },
    { id: 'admin', label: 'Administración', icon: '⚙️' },
    { id: 'vendedores', label: 'Vendedores', icon: '👨‍💼' },
  ].filter(item => currentUser.permisos.includes(item.id));

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('hs_is_logged_in');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clientes':
        return <ClientesModule clientes={clientes} onAdd={addCliente} onUpdate={updateCliente} onDelete={deleteCliente} />;
      case 'cotizaciones':
        return <CotizacionesModule
          clientes={clientes}
          productos={productos}
          proveedores={proveedores}
          onAddQuote={addCotizacion}
          onSendWhatsApp={sendWhatsAppNotification}
          currentUser={currentUser}
        />;
      case 'ordenes-compra':
        const filteredOCsToModule = currentUser.rol === 'Admin'
          ? ordenesCompra
          : ordenesCompra.filter(oc => oc.usuarioId === currentUser.id);

        return <OrdenesCompraModule
          proveedores={proveedores}
          productos={productos}
          ordenesCompra={filteredOCsToModule}
          onAddOC={addOrdenCompra}
          onUpdateOC={updateOrdenCompra}
          onDeleteOC={deleteOrdenCompra}
          currentUser={currentUser}
        />;
      case 'productos':
        return <ProductosModule productos={productos} onAdd={addProducto} onUpdate={updateProducto} onDelete={deleteProducto} />;
      case 'proveedores':
        return <ProveedoresModule proveedores={proveedores} onAdd={addProveedor} onUpdate={updateProveedor} onDelete={deleteProveedor} />;
      case 'conductores':
        return <ConductoresModule
          conductores={conductores}
          despachos={despachos}
          ordenesCompra={ordenesCompra}
          proveedores={proveedores}
          clientes={clientes}
          onAdd={addConductor}
          onUpdate={updateConductor}
          onDelete={deleteConductor}
          onUpdateDespacho={updateDespacho}
          onUpdateOC={updateOrdenCompra}
          onSendWhatsApp={sendWhatsAppNotification}
        />;
      case 'informes':
        const restrictedQuotes = currentUser.rol === 'Admin'
          ? cotizaciones
          : cotizaciones.filter(c => c.usuarioId === currentUser.id);
        return <InformesModule
          cotizaciones={restrictedQuotes}
          budgets={budgets}
          currentUser={currentUser}
          onUpdateQuote={updateCotizacion}
        />;
      case 'logistica':
        const filteredDespachos = currentUser.rol === 'Admin'
          ? despachos
          : despachos.filter(d => d.usuarioId === currentUser.id);
        const filteredOCsLogistica = currentUser.rol === 'Admin'
          ? ordenesCompra
          : ordenesCompra.filter(oc => oc.usuarioId === currentUser.id);

        return <LogisticaModule
          despachos={filteredDespachos}
          ordenesCompra={filteredOCsLogistica}
          conductores={conductores}
          onUpdateDespacho={updateDespacho}
          onDeleteDespacho={deleteDespacho}
          onUpdateOC={updateOrdenCompra}
        />;
      case 'reparaciones':
        return <ReparacionesModule
          reparaciones={reparaciones}
          clientes={clientes}
          proveedores={proveedores}
          onAdd={addReparacion}
          onUpdate={updateReparacion}
          onDelete={deleteReparacion}
        />;
      case 'admin':
        return <AdminModule
          users={users}
          currentUser={currentUser}
          onAdd={addUser}
          onUpdate={updateUser}
          onDelete={deleteUser}
          onSwitchUser={setCurrentUser}
          budgets={budgets}
          onAddBudget={addBudget}
          onUpdateBudget={updateBudget}
          onDeleteBudget={deleteBudget}
        />;
      case 'vendedores':
        return <VendedoresModule
          users={users}
          budgets={budgets}
          onUpdateUser={updateUser}
          onAddUser={addUser}
        />;
      case 'dashboard':
        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();

        const prevMonthDate = new Date(curYear, curMonth - 1, 1);
        const prevMonth = prevMonthDate.getMonth();
        const prevYear = prevMonthDate.getFullYear();

        const getMonthQuotes = (m: number, y: number) => cotizaciones.filter(c => {
          if (!c.fecha) return false;
          const [quoteY, quoteM] = c.fecha.split('-').map(Number);
          return quoteY === y && (quoteM - 1) === m;
        });

        const curMonthQuotes = getMonthQuotes(curMonth, curYear);
        const prevMonthQuotes = getMonthQuotes(prevMonth, prevYear);

        const growth = prevMonthQuotes.length > 0
          ? ((curMonthQuotes.length - prevMonthQuotes.length) / prevMonthQuotes.length) * 100
          : (curMonthQuotes.length > 0 ? 100 : 0);

        const wonQuotesMonth = curMonthQuotes.filter(c => c.estado === 'Ganado');
        const completedTotal = despachos.filter(d => d.estado === 'Entregado').length;
        const activeLogistics = despachos.filter(d => d.estado !== 'Entregado').length;

        return (
          <div className="dashboard-grid">
            <div className="card stat-card">
              <h4>Cotizaciones de {now.toLocaleString('es-ES', { month: 'long' })}</h4>
              <p className="stat-value">{curMonthQuotes.length}</p>
              <span className={`stat-label ${growth >= 0 ? 'text-success' : 'text-error'}`}>
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(0)}% vs mes anterior
              </span>
            </div>
            <div className="card stat-card">
              <h4>Ventas Ganadas (Mes)</h4>
              <p className="stat-value">{wonQuotesMonth.length}</p>
              <span className="stat-label">
                ${wonQuotesMonth.reduce((acc, c) => acc + c.total, 0).toLocaleString()} en ingresos
              </span>
            </div>
            <div className="card stat-card">
              <h4>Envíos Realizados</h4>
              <p className="stat-value">{completedTotal}</p>
              <span className="stat-label">{activeLogistics} envíos en tránsito</span>
            </div>
            <div className="card wide-card">
              <h3>Actividad Reciente</h3>
              <ul className="activity-list">
                {cotizaciones.slice(-3).reverse().map(c => (
                  <li key={c.id}>
                    {c.estado === 'Ganado' ? '✅' : '📄'} Cotización <strong>{c.consecutivo}</strong> para {c.clienteNombre}
                  </li>
                ))}
                {despachos.slice(-2).reverse().map(d => (
                  <li key={d.id}>
                    🚚 Despacho de <strong>Cotización {d.consecutivoCotizacion}</strong> - {d.estado}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="card">
            <h3>Módulo {menuItems.find(i => i.id === activeTab)?.label}</h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              Este módulo está en proceso de construcción.
            </p>
          </div>
        );
    }
  }

  return isLoggedIn ? (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="brand-box">
            <span className="logo-icon">🚀</span>
            <h2 className="logo-text">CRM Help Soluciones</h2>
          </div>
        </div>
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>
            <span className="nav-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h1>{menuItems.find(i => i.id === activeTab)?.label || 'Acceso Denegado'}</h1>
          <div className="user-profile">
            <span style={{ marginRight: '0.5rem' }}>{currentUser.rol === 'Admin' ? '👑' : '👤'}</span>
            <strong>{currentUser.nombre}</strong>
            <small style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>{currentUser.cargo}</small>
          </div>
        </header>

        <section className="content-area">
          {renderContent()}
        </section>
      </main>

      <style>{`
        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .sidebar {
          width: 280px;
          background-color: var(--primary-blue);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
        }

        .brand-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-icon {
          font-size: 2.5rem;
          background: white;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
        }

        .logo-text {
          color: white;
          font-size: 1.25rem;
          text-align: center;
          line-height: 1.2;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          text-align: left;
          width: 100%;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: white;
          color: var(--primary-blue);
          font-weight: 600;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background-color: var(--background-light);
        }

        .top-header {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .content-area {
          padding: 2rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-blue);
          margin: 0.5rem 0;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--success);
          font-weight: 500;
        }

        .wide-card {
          grid-column: span 3;
          margin-top: 1rem;
        }

        .activity-list {
          list-style: none;
          margin-top: 1.5rem;
        }

        .activity-list li {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-muted);
        }

        .activity-list li:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  ) : (
    <Login users={users} onLogin={(u) => { setCurrentUser(u); setIsLoggedIn(true); }} />
  );
}

export default App
