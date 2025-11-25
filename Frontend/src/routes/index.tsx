import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const ForgotPassword = lazy(
  () => import("@/components/landing/forgotPassword")
);
const ResetPassword = lazy(() => import("@/components/landing/resetPassword"));
const AuthCallback = lazy(() => import("@/pages/client/authCallback"));
import { publicRoutes } from "@/routes/publicRoutes";
import { clientRoutes } from "@/routes/clientRoutes";
import { adminRoutes } from "@/routes/adminRoutes";

const AppRoutes = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public website routes */}
        {publicRoutes}

        {/* Client (protected) routes */}
        {clientRoutes}

        {/* Admin (protected) routes */}
        {adminRoutes}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
