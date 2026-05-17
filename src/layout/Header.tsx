import { Link, useLocation } from 'react-router-dom';
import { defaultLocale, isLocale, type Locale } from '../i18n/locales';

function getActiveLocale(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];

  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

function getProjectsPath(locale: Locale) {
  return locale === 'fr-fr' ? '/fr-fr/projets' : '/en-us/projects';
}

export function Header() {
  const location = useLocation();
  const locale = getActiveLocale(location.pathname);
  const isFrench = locale === 'fr-fr';

  return (
    <header className="site-header">
      <Link to={`/${locale}`} className="brand">
        Bezot Corp
      </Link>

      <nav>
        <Link to={`/${locale}`}>{isFrench ? 'Accueil' : 'Home'}</Link>
        <Link to={getProjectsPath(locale)}>{isFrench ? 'Projets' : 'Projects'}</Link>
        <Link to={`/${locale}/contact`}>Contact</Link>
      </nav>

      <div className="locale-switch">
        <Link to="/fr-fr">FR</Link>
        <Link to="/en-us">EN</Link>
      </div>
    </header>
  );
}