import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

export const revalidate = 3600;

type LocationsPayload = Record<string, Record<string, string[]>>;

const DEFAULT_SOMALIA_LOCATIONS: Record<string, string[]> = {
  Banaadir: [
    "Hodan",
    "Wadajir",
    "Howlwadaag",
    "Yaqshid",
    "Daynile",
    "Dharkenley",
    "Hamar Weyne",
    "Hamar Jajab",
    "Shibis",
    "Shangani",
    "Karaan",
    "Waberi",
    "Boondheere",
    "Kaxda",
    "Garasbaaley",
  ],
  Galguduud: ["Dhuusamareeb", "Cadaado", "Caabudwaaq", "Guriceel", "Ceelbuur", "Ceeldheer"],
  Mudug: ["Gaalkacyo", "Hobyo", "Jariiban", "Xarardheere", "Galdogob"],
  Bari: ["Boosaaso", "Qardho", "Caluula", "Bandarbeyla", "Iskushuban"],
  Nugaal: ["Garowe", "Eyl", "Burtinle", "Dangorayo"],
  Hiiraan: ["Beledweyne", "Buuloburde", "Jalalaqsi", "Matabaan", "Maxaas"],
  "Shabeellaha Dhexe": ["Jowhar", "Balcad", "Cadale", "Mahadaay", "Aadan Yabaal"],
  "Shabeellaha Hoose": ["Marka", "Afgooye", "Wanlaweyn", "Qoryooley", "Baraawe", "Kurtunwaarey"],
  Bay: ["Baydhabo", "Buurhakaba", "Diinsoor", "Qansaxdheere", "Berdale"],
  Bakool: ["Xudur", "Tayeeglow", "Ceelbarde", "Rabdhure", "Waajid"],
  Gedo: ["Garbahaareey", "Luuq", "Baardheere", "Beledxaawo", "Doolow", "Ceelwaaq"],
  "Jubbada Hoose": ["Kismaayo", "Afmadow", "Badhaadhe", "Jamaame"],
  "Jubbada Dhexe": ["Bu'aale", "Jilib", "Saakow"],
  "Waqooyi Galbeed": ["Hargeysa", "Berbera", "Gebiley"],
  Togdheer: ["Burco", "Oodweyne", "Buuhoodle"],
  Sanaag: ["Ceerigaabo", "Laasqoray", "Badhan", "Ceel-Afweyn"],
  Sool: ["Laascaanood", "Caynaba", "Taleex", "Xudun"],
  Awdal: ["Boorama", "Saylac", "Lughaya", "Baki"],
};

export async function GET() {
  if (API_BASE && !API_BASE.includes("localhost") && !API_BASE.includes("example.com")) {
    try {
      const res = await fetch(`${API_BASE}/api/locations`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = (await res.json()) as LocationsPayload;
        const regions: Record<string, string[]> = {};
        for (const state of Object.values(data)) {
          for (const [region, districts] of Object.entries(state)) {
            regions[region] = districts;
          }
        }
        if (Object.keys(regions).length > 0) {
          return NextResponse.json({ regions });
        }
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({ regions: DEFAULT_SOMALIA_LOCATIONS });
}
