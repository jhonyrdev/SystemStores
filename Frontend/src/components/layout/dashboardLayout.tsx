import React from "react";
import AsideDashboard from "../admin/asideDashboard";
import TopHeader from "../admin/topHeader";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const scrollRef = React.useRef<HTMLElement | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <AsideDashboard onSelect={() => {}} />

      <main
        ref={scrollRef}
        style={{ scrollbarGutter: "stable" }}
        className="h-full flex-1 overflow-y-auto overflow-x-hidden relative"
      >
        <TopHeader scrollContainerRef={scrollRef} />
        <div className="p-4 sm:p-6 md:p-8 lg:p-10 sm:pt-4 md:pt-4 lg:pt-4">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
