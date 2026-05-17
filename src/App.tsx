import { Navigate, Route, Routes } from "react-router-dom";
import { defaultLocale } from "./i18n/locales";
import { PageRenderer } from "./pages/PageRenderer";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLocale}`} replace />} />
      <Route path="/*" element={<PageRenderer />} />
    </Routes>
  );
}