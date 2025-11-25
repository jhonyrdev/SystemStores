import { lazy } from "react";
import { Route } from "react-router-dom";

const PerfilCliente = lazy(() => import("@/pages/client/perfilCliente"));
const DireccionCliente = lazy(() => import("@/pages/client/direccionCliente"));
const PedidosCliente = lazy(() => import("@/pages/client/pedidoCliente"));
const SeguridadCliente = lazy(() => import("@/pages/client/seguridadCliente"));
const LayoutCliente = lazy(() => import("@/layout/layoutCliente"));

export const clientRoutes = (
  <Route path="/cuenta" element={<LayoutCliente />}>
    <Route index element={<PerfilCliente />} />
    <Route path="direccion" element={<DireccionCliente />} />
    <Route path="pedido" element={<PedidosCliente />} />
    <Route path="gestor" element={<SeguridadCliente />} />
  </Route>
);

export default clientRoutes;
