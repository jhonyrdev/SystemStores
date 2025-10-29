import ClientLayout from "@/components/layout/clientLayout";
import { Outlet } from "react-router-dom";

const LayoutCliente = () => {
  return (
    <>
    <ClientLayout>
      <Outlet/>
    </ClientLayout>
    </>
  );
};

export default LayoutCliente;