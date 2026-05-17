import { Link, useLocation } from 'react-router-dom';
import { defaultLocale, isLocale, type Locale } from '../i18n/locales';
import { getPagePath } from '../site';

function getActiveLocale(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];

  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function Header() {
  const location = useLocation();
  const locale = getActiveLocale(location.pathname);
  const isFrench = locale === 'fr-fr';

  const homePath = getPagePath('home', locale);
  const projectsPath = getPagePath('projects', locale);
  const blogPath = getPagePath('blog', locale);
  const contactPath = getPagePath('contact', locale);

  return (
    <header className="site-header">
      {homePath && (
        <Link to={homePath} className="brand">
          Bezot Corp
        </Link>
      )}

      <nav>
        {homePath && <Link to={homePath}>{isFrench ? 'Accueil' : 'Home'}</Link>}
        {projectsPath && <Link to={projectsPath}>{isFrench ? 'Projets' : 'Projects'}</Link>}
        {blogPath && <Link to={blogPath}>Blog</Link>}
        {contactPath && <Link to={contactPath}>Contact</Link>}
      </nav>

      <div className="locale-switch">
        <Link to={getPagePath('home', 'fr-fr') ?? '/fr-fr'}>FR</Link>
        <Link to={getPagePath('home', 'en-us') ?? '/en-us'}>EN</Link>
      </div>
    </header>
  );
}