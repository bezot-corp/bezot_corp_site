import { Navigate, Route, Routes } from "react-router-dom";
import { defaultLocale } from "./i18n/locales";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PageRenderer } from "./pages/PageRenderer";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultLocale}`} replace />} />
      <Route path="/:locale" element={<PageRenderer />} />
      <Route path="/:locale/:slug" element={<PageRenderer />} />
      <Route path="*" element={<NotFoundPage locale={defaultLocale} />} />
    </Routes>
  );
}