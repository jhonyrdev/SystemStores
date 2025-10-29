import AsideDashboard from "../admin/asideDashboard";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AsideDashboard onSelect={function (): void {
        throw new Error("Function not implemented.");
      } } />
      <main className="h-full flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
