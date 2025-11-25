import { lazy } from "react";
import { Route } from "react-router-dom";

const Inicio = lazy(() => import("@pages/landing/inicio"));
const Contacto = lazy(() => import("@pages/landing/contacto"));
const Fq = lazy(() => import("@pages/landing/fq"));
const PaginaCatalogo = lazy(() => import("@/pages/landing/productosCatalogo"));
const LayoutCatalogo = lazy(() => import("@/layout/layoutCatalogo"));
const Checkout = lazy(() => import("@/pages/client/chekout"));
const Nosotros = lazy(() => import("@/pages/landing/nosotros"));
const LayoutPage = lazy(() => import("@/layout/layoutPage"));

export const publicRoutes = (
  <Route path="/" element={<LayoutPage />}>
    <Route index element={<Inicio />} />
    <Route path="categoria" element={<LayoutCatalogo />}>
      <Route index element={<PaginaCatalogo />} />
      <Route path=":slug" element={<PaginaCatalogo />} />
    </Route>
    <Route path="checkout" element={<Checkout />} />
    <Route path="fq" element={<Fq />} />
    <Route path="contacto" element={<Contacto />} />
    <Route path="nosotros" element={<Nosotros />} />
  </Route>
);

export default publicRoutes;
