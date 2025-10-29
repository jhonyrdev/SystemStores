import DashboardLayout from "@/components/layout/dashboardLayout";
import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  return (
    <>
      <DashboardLayout>
      <Outlet />
    </DashboardLayout>
    </>
  );
};

export default LayoutAdmin;