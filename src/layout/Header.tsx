import { Link, useParams } from "react-router-dom";
import { defaultLocale, isLocale } from "../i18n/locales";

export function Header() {
  const { locale } = useParams();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;

  const isFrench = activeLocale === "fr-fr";

  return (
    <header className="site-header">
      <Link to={`/${activeLocale}`} className="brand">
        Bezot Corp
      </Link>

      <nav>
        <Link to={`/${activeLocale}`}>
          {isFrench ? "Accueil" : "Home"}
        </Link>
        <Link to={`/${activeLocale}/${isFrench ? "projets" : "projects"}`}>
          {isFrench ? "Projets" : "Projects"}
        </Link>
        <Link to={`/${activeLocale}/contact`}>
          Contact
        </Link>
      </nav>

      <div className="locale-switch">
        <Link to="/fr-fr">FR</Link>
        <Link to="/en-us">EN</Link>
      </div>
    </header>
  );
}