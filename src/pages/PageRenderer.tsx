import { Link, useLocation } from 'react-router-dom';
import { resolveRoute } from '../site';
import { NotFoundPage } from './NotFoundPage';
import { PageTemplate } from '../templates/PageTemplate';

function RootLanguagePage() {
  return (
    <main>
      <h1>Bezot Corp</h1>
      <p>Choose your language.</p>

      <nav aria-label="Language selection">
        <Link to="/fr-fr/">Français</Link>
        {' | '}
        <Link to="/en-us/">English</Link>
      </nav>
    </main>
  );
}

export function PageRenderer() {
  const location = useLocation();
  const match = resolveRoute(location.pathname);

  if (match.kind === 'root') {
    return <RootLanguagePage />;
  }

  return match.kind === 'page' ? (
    <PageTemplate page={match.content} seo={match.seo} />
  ) : (
    <NotFoundPage locale={match.locale} />
  );
}
