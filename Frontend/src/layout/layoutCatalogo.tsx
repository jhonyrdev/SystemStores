import CatalogoLayout from "@/components/layout/catalogoLayout";
import { Outlet } from "react-router-dom";

const LayoutCatalogo = () => {
  return (
    <CatalogoLayout>
      <Outlet />
    </CatalogoLayout>
  );
};

export default LayoutCatalogo;
