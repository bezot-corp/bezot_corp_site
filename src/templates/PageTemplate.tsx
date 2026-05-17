import { useEffect } from "react";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { MainLayout } from "../layout/MainLayout";
import { applySeo } from "../seo";
import type { SeoMetadata } from "../site";

type Props = {
  page: {
    seo: {
      title: string;
      description?: string;
    };
    blocks: readonly {
      type: string;
      props?: Record<string, unknown>;
    }[];
  };
  seo: SeoMetadata;
};

export function PageTemplate({ page, seo }: Props) {
  useEffect(() => {
    applySeo(seo);
  }, [seo]);

  return (
    <MainLayout>
      <main className="page">
        {page.blocks.map((block, index) => (
          <BlockRenderer key={`${block.type}-${index}`} block={block} />
        ))}
      </main>
    </MainLayout>
  );
}