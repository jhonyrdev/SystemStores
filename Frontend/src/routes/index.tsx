import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
// Pages públicas
const Inicio = lazy(() => import("@pages/landing/inicio"));
const Contacto = lazy(() => import("@pages/landing/contacto"));
const Fq = lazy(() => import("@pages/landing/fq"));
const ForgotPassword = lazy(() => import("@/components/landing/forgotPassword"));
const ResetPassword = lazy(() => import("@/components/landing/resetPassword"));

// Cliente
const PerfilCliente = lazy(() => import("@/pages/client/perfilCliente"));
const DireccionCliente = lazy(() => import("@/pages/client/direccionCliente"));
const PedidosCliente = lazy(() => import("@/pages/client/pedidoCliente"));
const SeguridadCliente = lazy(() => import("@/pages/client/seguridadCliente"));

// Admin
const Dashboard = lazy(() => import("@pages/admin/dashboard"));
const GestionProductos = lazy(() => import("@pages/admin/gestionProductos"));
const GestionClientes = lazy(() => import("@/pages/admin/gestionClientes"));
const GestionPedidos = lazy(() => import("@/pages/admin/gestionPedidos"));
const GestionCategorias = lazy(() => import("@/pages/admin/gestionCategoria"));
const Analisis = lazy(() => import("@/pages/admin/analisis"));
const LayoutAdmin = lazy(() => import("@/layout/layoutAdmin"));
const LayoutCliente = lazy(() => import("@/layout/layoutCliente"));
const LayoutPage = lazy(() => import("@/layout/layoutPage"));
import RequireAdminAuth from "@/guards/requireAdminAuth";
import PaginaCatalogo from "@/pages/landing/productosCatalogo";
import LayoutCatalogo from "@/layout/layoutCatalogo";
import Checkout from "@/pages/client/chekout";
import AuthCallback from "@/pages/client/authCallback";
import Nosotros from "@/pages/landing/nosotros";

const AppRoutes = () => {
  return (
    <Suspense>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas: layout PageWeb */}
        <Route path="/" element={<LayoutPage />}>
          <Route index element={<Inicio />} />
          <Route path="/categoria" element={<LayoutCatalogo />}>
            <Route index element={<PaginaCatalogo />} />
            <Route path=":slug" element={<PaginaCatalogo />} />
          </Route>

          <Route path="/checkout" element={<Checkout />} />
          <Route path="fq" element={<Fq />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="nosotros" element={<Nosotros />} />

          {/* Rutas: layout Plataforma Cliente*/}
          <Route path="/cuenta" element={<LayoutCliente />}>
            <Route index element={<PerfilCliente />} />
            <Route path="direccion" element={<DireccionCliente />} />
            <Route path="pedido" element={<PedidosCliente />} />
            <Route path="gestor" element={<SeguridadCliente />} />
          </Route>
        </Route>

        {/* Rutas: layout Plataforma Admin*/}
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <LayoutAdmin />
            </RequireAdminAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="gestion/productos" element={<GestionProductos />} />
          <Route path="gestion/categorias" element={<GestionCategorias />} />
          <Route path="usuarios/clientes" element={<GestionClientes />} />{" "}
          <Route path="ventas/pedidos" element={<GestionPedidos />} />
          <Route path="ventas/analisis" element={<Analisis />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
