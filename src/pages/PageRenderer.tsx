import { useParams } from "react-router-dom";
import { defaultLocale, isLocale } from "../i18n/locales";
import { NotFoundPage } from "./NotFoundPage";
import { findPageByLocaleAndSlug, getPageSeo } from "../site";
import { PageTemplate } from "../templates/PageTemplate";

export function PageRenderer() {
  const { locale, slug = "" } = useParams();

  if (!isLocale(locale)) {
    return <NotFoundPage locale={defaultLocale} />;
  }

  const match = findPageByLocaleAndSlug(locale, slug);

  if (!match) {
    return <NotFoundPage locale={locale} />;
  }

  return <PageTemplate page={match.content} seo={getPageSeo(match.page, locale)} />;
}