import AsideDashboard from "../admin/asideDashboard";
import TopHeader from "../admin/topHeader";
import { useRef } from "react";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <AsideDashboard onSelect={() => {}} />
      <div className="flex-1 flex flex-col">
        <TopHeader scrollContainerRef={mainRef} />
        <main
          ref={mainRef}
          className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
        >
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
