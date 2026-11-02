import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

// Admin code is only downloaded when the admin address is opened.
const Admin = lazy(() => import("./pages/Admin"));

// The admin page lives at a private address set in .env, e.g. VITE_ADMIN_PATH=/ops-k7q2x9
// Anyone who types /admin (or any other address) simply gets the public dashboard.
const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || "/admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ADMIN_PATH}
          element={
            <Suspense fallback={<div className="min-h-screen bg-void" />}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}