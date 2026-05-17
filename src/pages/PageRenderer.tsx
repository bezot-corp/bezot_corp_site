import { useLocation } from 'react-router-dom';
import { resolveRoute } from '../site';
import { NotFoundPage } from './NotFoundPage';
import { PageTemplate } from '../templates/PageTemplate';

export function PageRenderer() {
  const location = useLocation();
  const match = resolveRoute(location.pathname);

  return match.kind === 'page' ? (
    <PageTemplate page={match.content} seo={match.seo} />
  ) : (
    <NotFoundPage locale={match.locale} />
  );
}