import type { Metadata } from "next";
import { getNews, getNewsCategories } from "@/lib/api";
import { NewsBrowser } from "./NewsBrowser";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Wararka — Latest News",
  description:
    "The latest news, statements and campaign updates from Xisbiga Hilaac across all regions.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  // Pull a generous page so filtering and pagination stay instant client-side.
  const [news, categories] = await Promise.all([
    getNews({ pageSize: 100 }),
    getNewsCategories(),
  ]);

  return <NewsBrowser articles={news.items} categories={categories} />;
}
