import { Link, useLocation } from "react-router-dom";
import { defaultLocale, isLocale, type Locale } from "../i18n/locales";
import { getPathForLocaleAndSlug, getPublishedPosts } from "../site";

type Props = {
  props?: Record<string, unknown>;
};

function getActiveLocale(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

function getLimit(value: unknown, fallback = 10) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function getShowDescription(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

export function PostListBlock({ props }: Props) {
  const location = useLocation();
  const locale = getActiveLocale(location.pathname);
  const limit = getLimit(props?.limit);
  const showDescription = getShowDescription(props?.showDescription);

  const posts = getPublishedPosts()
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);

  return (
    <section>
      {posts.map((post) => {
        const content = post.locales[locale];
        const path = getPathForLocaleAndSlug(locale, content.slug);

        return (
          <article key={post.id}>
            <h2>
              <Link to={path}>{content.seo.ogTitle}</Link>
            </h2>

            {showDescription && content.seo.description && <p>{content.seo.description}</p>}

            <small>
              {post.author} · {post.publishedAt}
            </small>
          </article>
        );
      })}
    </section>
  );
}
