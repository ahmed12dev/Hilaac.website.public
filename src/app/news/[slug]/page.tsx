import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNewsSlugs, getArticle, getNews } from "@/lib/api";
import { SITE_URL, t } from "@/lib/utils";
import { ArticleView } from "./ArticleView";

export const revalidate = 180;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found" };

  const title = t(article.title, "so");
  const description = t(article.excerpt, "so");

  return {
    title,
    description,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: article.publishedAt,
      authors: article.author ? [article.author] : undefined,
      url: `${SITE_URL}/news/${slug}`,
      images: article.cover ? [{ url: article.cover }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const all = await getNews({ pageSize: 40 });
  const related = all.items
    .filter((item) => item.slug !== slug)
    .filter((item) => (article.categorySlug ? item.categorySlug === article.categorySlug : true))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: t(article.title, "so"),
    description: t(article.excerpt, "so"),
    datePublished: article.publishedAt,
    author: article.author ? { "@type": "Organization", name: article.author } : undefined,
    publisher: {
      "@type": "Organization",
      name: "Xisbiga Hilaac",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo-circle.webp` },
    },
    mainEntityOfPage: `${SITE_URL}/news/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleView
        article={article}
        related={related.length ? related : all.items.filter((i) => i.slug !== slug).slice(0, 3)}
      />
    </>
  );
}
