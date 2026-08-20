import { NextResponse } from "next/server";
import { getLiveTotals } from "@/lib/api";
import {
  publicEvents,
  publicGallery,
  publicLeaders,
  publicNews,
  publicProjects,
  publicSettings,
  publicConstitution,
} from "@/lib/server/content";

/**
 * Public read-only REST API for the website's content.
 *
 *   Public Website → REST API → Node.js (this app) → PostgreSQL ← Admin Dashboard
 *
 * The admin dashboard writes to the same `site_*` tables these endpoints read,
 * so a create/update/delete in the dashboard is visible here on the very next
 * request — no deploy, no code change, no sync step.
 *
 * Member/region/district totals are proxied from the registration system,
 * which remains the sole owner of that data.
 *
 * Everything is GET-only and returns published rows only. Draft filtering
 * happens inside the queries, so no request can reach unpublished content.
 */

export const dynamic = "force-dynamic";

const PROJECT_STATUSES = ["planned", "ongoing", "completed", "paused", "all"];

/** Short cache: dashboard edits surface quickly, the database stays quiet. */
const CACHE = "public, max-age=30, stale-while-revalidate=120";

function ok(data: unknown, meta?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: true, data, ...(meta ?? {}) },
    {
      headers: {
        "Cache-Control": CACHE,
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function fail(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const query = new URL(request.url).searchParams;

  try {
    switch (resource) {
      /* ---- membership: proxied from the registration system ---- */
      case "stats":
      case "members": {
        const totals = await getLiveTotals();
        if (!totals) return fail(503, "upstream_unavailable", "Registration system unreachable.");
        return ok(totals);
      }

      case "regions":
      case "districts": {
        const totals = await getLiveTotals();
        if (!totals) return fail(503, "upstream_unavailable", "Registration system unreachable.");
        return ok(
          resource === "regions"
            ? { total: totals.totalRegions }
            : { total: totals.totalDistricts },
        );
      }

      /* ---- website content: this app's own database ---- */
      case "news": {
        const limit = Number(query.get("limit") || 50);
        const items = await publicNews(Number.isFinite(limit) ? limit : 50);
        return ok(items, { total: items.length });
      }

      case "projects": {
        const status = query.get("status") || "";
        if (status && !PROJECT_STATUSES.includes(status)) {
          return fail(400, "invalid_status", "Unknown project status.");
        }
        const items = await publicProjects(status || undefined);
        return ok(items, { total: items.length });
      }

      case "events": {
        const items = await publicEvents();
        return ok(items, { total: items.length });
      }

      case "leadership": {
        const items = await publicLeaders();
        return ok(items, { total: items.length });
      }

      case "gallery": {
        const items = await publicGallery(query.get("type") || undefined);
        return ok(items, { total: items.length });
      }

      case "constitution": {
        const items = await publicConstitution();
        return ok(items, { total: items.length });
      }

      case "settings":
        return ok(await publicSettings());

      case "contact": {
        const settings = (await publicSettings()) as { contact?: unknown } | null;
        return ok(settings?.contact ?? null);
      }

      /* ---- everything the homepage needs, in one call ---- */
      case "overview": {
        const [totals, news, projects, events] = await Promise.all([
          getLiveTotals(),
          publicNews(4),
          publicProjects(),
          publicEvents(),
        ]);
        return ok({
          totalMembers: totals?.totalMembers ?? null,
          totalRegions: totals?.totalRegions ?? null,
          totalDistricts: totals?.totalDistricts ?? null,
          activeProjects: projects.filter((p) => p.status === "ongoing").length,
          completedProjects: projects.filter((p) => p.status === "completed").length,
          totalProjects: projects.length,
          upcomingEvents: events.filter((e) => e.status === "upcoming").length,
          latestNews: news,
          nextEvents: events.filter((e) => e.status === "upcoming").slice(0, 4),
        });
      }

      default:
        return fail(404, "unknown_resource", `No such resource: ${resource}`);
    }
  } catch {
    // Never leak database internals to a public caller.
    return fail(503, "unavailable", "Data is temporarily unavailable.");
  }
}
