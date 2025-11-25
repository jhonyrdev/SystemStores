import { lazy } from "react";
import { Route } from "react-router-dom";
import RequireAdminAuth from "@/guards/requireAdminAuth";

const Dashboard = lazy(() => import("@/pages/admin/dashboard"));
const GestionProductos = lazy(() => import("@/pages/admin/gestionProductos"));
const GestionClientes = lazy(() => import("@/pages/admin/gestionClientes"));
const GestionPedidos = lazy(() => import("@/pages/admin/gestionPedidos"));
const GestionCategorias = lazy(() => import("@/pages/admin/gestionCategoria"));
const Analisis = lazy(() => import("@/pages/admin/analisis"));
const LayoutAdmin = lazy(() => import("@/layout/layoutAdmin"));

export const adminRoutes = (
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
    <Route path="usuarios/clientes" element={<GestionClientes />} />
    <Route path="ventas/pedidos" element={<GestionPedidos />} />
    <Route path="ventas/analisis" element={<Analisis />} />
  </Route>
);

export default adminRoutes;
