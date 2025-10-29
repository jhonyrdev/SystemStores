import PublicLayout from "@/components/layout/publicLayout";
import { Outlet } from "react-router-dom";

const LayoutPage = () => {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
};

export default LayoutPage;
