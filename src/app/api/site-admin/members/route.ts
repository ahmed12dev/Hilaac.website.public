import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { hasDatabase, getPool, ensureSchema, newId } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export interface MemberRecord {
  id: string;
  membershipNumber: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  gender: string;
  status: "verified" | "active" | "pending";
  joinedAt: string;
}

// Initial mock registry data for standalone/fallback mode
const FALLBACK_MEMBERS: MemberRecord[] = [
  {
    id: "mem-001",
    membershipNumber: "HIL-2026-00101",
    fullName: "Maxamed Cabdi Jaamac",
    phone: "+252 61 555 1234",
    email: "m.jaamac@gmail.com",
    region: "Banaadir",
    district: "Hodan",
    gender: "Male",
    status: "verified",
    joinedAt: "2026-08-15T10:30:00Z",
  },
  {
    id: "mem-002",
    membershipNumber: "HIL-2026-00102",
    fullName: "Fadumo Axmed Cali",
    phone: "+252 61 777 8899",
    email: "fadumo.ali@yahoo.com",
    region: "Banaadir",
    district: "Wadajir",
    gender: "Female",
    status: "verified",
    joinedAt: "2026-08-16T14:15:00Z",
  },
  {
    id: "mem-003",
    membershipNumber: "HIL-2026-00103",
    fullName: "Cabdiraxmaan Xasan Guuleed",
    phone: "+252 90 712 3456",
    email: "abdirahman.hassan@gmail.com",
    region: "Puntland",
    district: "Garowe",
    gender: "Male",
    status: "verified",
    joinedAt: "2026-08-16T18:40:00Z",
  },
  {
    id: "mem-004",
    membershipNumber: "HIL-2026-00104",
    fullName: "Sahra Cismaan Nuur",
    phone: "+252 62 444 3322",
    email: "sahra.osman@outlook.com",
    region: "Galmudug",
    district: "Dhuusamareeb",
    gender: "Female",
    status: "active",
    joinedAt: "2026-08-17T09:10:00Z",
  },
  {
    id: "mem-005",
    membershipNumber: "HIL-2026-00105",
    fullName: "Khadar Nuur Warsame",
    phone: "+252 61 999 0011",
    email: "khadar.warsame@gmail.com",
    region: "Hirshabelle",
    district: "Beledweyne",
    gender: "Male",
    status: "pending",
    joinedAt: "2026-08-17T11:45:00Z",
  },
  {
    id: "mem-006",
    membershipNumber: "HIL-2026-00106",
    fullName: "Deeqa Maxamuud Cilmi",
    phone: "+252 61 222 7788",
    email: "deeqa.cilmi@gmail.com",
    region: "Jubaland",
    district: "Kismaayo",
    gender: "Female",
    status: "verified",
    joinedAt: "2026-08-17T13:20:00Z",
  },
  {
    id: "mem-007",
    membershipNumber: "HIL-2026-00107",
    fullName: "Ibraahim Cabdullaahi Sheekh",
    phone: "+252 61 888 4455",
    email: "ibrahim.sheikh@gmail.com",
    region: "South West",
    district: "Baydhabo",
    gender: "Male",
    status: "active",
    joinedAt: "2026-08-17T15:00:00Z",
  },
];

let inMemoryMembers = [...FALLBACK_MEMBERS];

export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const region = searchParams.get("region") || "";
  const status = searchParams.get("status") || "";

  let list = inMemoryMembers;

  if (hasDatabase()) {
    try {
      await ensureSchema();
      const pool = getPool();
      // If site_registrations table exists, query it
      const res = await pool.query(
        `SELECT id, membership_number AS "membershipNumber", full_name AS "fullName",
                phone, email, region, district, gender, status, created_at AS "joinedAt"
         FROM site_registrations
         ORDER BY created_at DESC
         LIMIT 500`,
      );
      if (res.rows.length > 0) {
        list = res.rows;
      }
    } catch {
      // Fallback to in-memory list
    }
  }

  const filtered = list.filter((m) => {
    if (q) {
      const match =
        m.fullName.toLowerCase().includes(q) ||
        m.membershipNumber.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (region && m.region !== region) return false;
    if (status && m.status !== status) return false;
    return true;
  });

  return NextResponse.json({
    ok: true,
    members: filtered,
    total: filtered.length,
    stats: {
      totalMembers: list.length,
      verified: list.filter((m) => m.status === "verified").length,
      active: list.filter((m) => m.status === "active").length,
      pending: list.filter((m) => m.status === "pending").length,
    },
  });
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newMember: MemberRecord = {
      id: `mem-${Date.now()}`,
      membershipNumber: `HIL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName: body.fullName || "New Member",
      phone: body.phone || "",
      email: body.email || "",
      region: body.region || "Banaadir",
      district: body.district || "Hodan",
      gender: body.gender || "Not specified",
      status: body.status || "verified",
      joinedAt: new Date().toISOString(),
    };

    inMemoryMembers.unshift(newMember);

    return NextResponse.json({ ok: true, member: newMember });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to create member" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    const target = inMemoryMembers.find((m) => m.id === id);
    if (target && ["verified", "active", "pending"].includes(status)) {
      target.status = status;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update status" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    inMemoryMembers = inMemoryMembers.filter((m) => m.id !== id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 400 });
  }
}
