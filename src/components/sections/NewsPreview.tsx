"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { FeaturedNewsCard, NewsCard } from "@/components/ui/NewsCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { NewsArticle } from "@/lib/types";

export function NewsPreview({ articles }: { articles: NewsArticle[] }) {
  const { tr } = useLanguage();
  if (!articles.length) return null;

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured.id).slice(0, 3);

  return (
    <Section id="news" muted>
      <div className="container-page">
        <SectionHeading
          eyebrow={tr("nav.news")}
          title={tr("news.title")}
          subtitle={tr("news.subtitle")}
        />

        <Reveal className="mb-8">
          <FeaturedNewsCard article={featured} />
        </Reveal>

        <StaggerGroup className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <StaggerItem key={article.id}>
              <NewsCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-12 text-center">
          <ButtonLink href="/news" variant="outline" size="lg">
            {tr("cta.viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
