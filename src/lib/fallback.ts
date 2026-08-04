/**
 * Bundled content used when the admin API is unreachable or an endpoint has
 * not been built yet. Once the dashboard serves /api/public/*, the live data
 * transparently replaces everything here — no component changes needed.
 */
import type {
  GalleryItem,
  Leader,
  NewsArticle,
  NewsCategory,
  PartyEvent,
  Project,
  SiteSettings,
  StatItem,
  Testimonial,
} from "./types";

export const fallbackSettings: SiteSettings = {
  partyName: { so: "Xisbiga Hilaac", en: "Hilaac Political Party" },
  tagline: {
    so: "Midnimo, Horumar iyo Caddaalad",
    en: "Unity, Progress and Justice",
  },
  heroHeadline: {
    so: "Dhisidda Soomaaliya Xoog Badan, Midaysan oo Barwaaqo ah",
    en: "Building a Strong, United, and Prosperous Somalia",
  },
  heroSubheadline: {
    so: "Xisbiga Hilaac wuxuu u taagan yahay dowladnimo daacad ah, dhalinyaro fursado leh, iyo dalka oo dhan oo isku xiran — muwaadin walba cod buuxa leh.",
    en: "Hilaac stands for honest governance, opportunity for our youth, and a connected nation — where every citizen has a full voice.",
  },
  logo: "/images/logo.webp",
  heroImage: "/images/flag.webp",
  heroSlides: [
    { src: "/images/flag.webp", captionSo: "Calanka Xisbiga Hilaac", captionEn: "The Hilaac party flag" },
    { src: "/images/logo.webp", captionSo: "Astaanta Xisbiga", captionEn: "The party emblem" },
  ],
  about: {
    history: {
      so: "Xisbiga Hilaac waxaa la aasaasay iyadoo ay ka dambeeyeen muwaadiniin rumaysan in Soomaaliya ay u baahan tahay siyaasad ku dhisan daacadnimo, xisaabtan iyo adeeg dadweyne. Laga bilaabo kulamo yaryar oo degmooyinka lagu qabtay ilaa hay'ad qaran oo laga hirgeliyo gobol kasta, safarkeennu wuxuu ahaa mid ku salaysan codka shacabka.",
      en: "Hilaac was founded by citizens who believed Somalia deserves politics built on integrity, accountability and public service. From small district gatherings to a national organisation present in every region, our journey has been powered by ordinary people.",
    },
    vision: {
      so: "Soomaaliya nabad ah, midaysan oo barwaaqaysan, halkaas oo muwaadin kasta uu ku helo caddaalad, waxbarasho tayo leh iyo fursad dhaqaale.",
      en: "A peaceful, united and prosperous Somalia where every citizen has access to justice, quality education and economic opportunity.",
    },
    mission: {
      so: "Inaan dhisno hoggaan daacad ah, dhaqaale kobcaya, iyo adeegyo bulsho oo gaaraya reer guuraaga, magaalooyinka iyo qurbaha — anagoo ku shaqaynayna hufnaan buuxda.",
      en: "To build honest leadership, a growing economy and public services that reach pastoral communities, cities and the diaspora alike — operating with complete transparency.",
    },
    values: [
      {
        id: "v1",
        icon: "shield",
        title: { so: "Daacadnimo", en: "Integrity" },
        description: {
          so: "Lacagta dadweynaha waa amaanad. Wax kasta oo aan qabanno waa la baari karaa.",
          en: "Public money is a trust. Everything we do is open to inspection.",
        },
      },
      {
        id: "v2",
        icon: "users",
        title: { so: "Midnimo", en: "Unity" },
        description: {
          so: "Qabiil ma aha barnaamij. Waxaan u wada shaqaynaa Soomaaliya oo dhan.",
          en: "Clan is not a policy. We work for all of Somalia, together.",
        },
      },
      {
        id: "v3",
        icon: "scale",
        title: { so: "Caddaalad", en: "Justice" },
        description: {
          so: "Sharci isku mid ah qof walba — awoodda ma aha wax lagu kor mariyo dadka.",
          en: "One law for everyone — power must never rise above the people.",
        },
      },
      {
        id: "v4",
        icon: "sprout",
        title: { so: "Horumar", en: "Progress" },
        description: {
          so: "Waxbarasho, caafimaad iyo shaqo dhalinyarada — aasaaska mustaqbalka.",
          en: "Education, health and youth employment — the foundation of the future.",
        },
      },
    ],
    timeline: [
      {
        id: "t1",
        year: "2019",
        title: { so: "Aasaaska", en: "Foundation" },
        description: {
          so: "Koox muwaadiniin ah oo ka kala socda gobollada ayaa dejiyay axdiga Hilaac.",
          en: "Citizens from across the regions drafted the founding charter of Hilaac.",
        },
      },
      {
        id: "t2",
        year: "2021",
        title: { so: "Diiwaangelin Rasmi ah", en: "Official Registration" },
        description: {
          so: "Xisbigu wuxuu helay diiwaangelin rasmi ah, waxaana la furay xafiisyo gobol.",
          en: "The party secured official registration and opened its first regional offices.",
        },
      },
      {
        id: "t3",
        year: "2023",
        title: { so: "Ballaarinta Qaranka", en: "National Expansion" },
        description: {
          so: "Waxaa la gaaray in ka badan 18 gobol, waxaana la bilaabay barnaamijka dhalinyarada.",
          en: "Reached more than 18 regions and launched the national youth programme.",
        },
      },
      {
        id: "t4",
        year: "2025",
        title: { so: "Nidaamka Diiwaangelinta Dhijitaalka", en: "Digital Membership" },
        description: {
          so: "Nidaam dhijitaal ah oo xubinnimo iyo kaarar la xaqiijin karo ayaa la hirgeliyay.",
          en: "Launched digital membership with verifiable member cards nationwide.",
        },
      },
      {
        id: "t5",
        year: "2026",
        title: { so: "Ololaha Qaran", en: "National Campaign" },
        description: {
          so: "Ololaha qaran ee doorashooyinka soo socda ayaa si rasmi ah loo bilaabay.",
          en: "The national campaign for the coming elections officially began.",
        },
      },
    ],
  },
  contact: {
    address: { so: "Muqdisho, Soomaaliya", en: "Mogadishu, Somalia" },
    email: "info@xisbiga-hilaac.com",
    phone: "+252 61 000 0000",
    hours: {
      so: "Sabti – Khamiis, 8:00 subaxnimo – 5:00 galabnimo",
      en: "Saturday – Thursday, 8:00 AM – 5:00 PM",
    },
    mapEmbedUrl:
      "https://www.google.com/maps?q=Mogadishu,Somalia&output=embed",
    mapLink: "https://www.google.com/maps/place/Mogadishu",
  },
  socials: {
    facebook: "https://facebook.com/",
    x: "https://x.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
  },
  registerUrl: "https://www.xisbiga-hilaac.com/register.html",
};

export const fallbackStats: StatItem[] = [
  { id: "s1", icon: "users", value: 128500, suffix: "+", label: { so: "Xubno Diiwaangashan", en: "Registered Members" } },
  { id: "s2", icon: "map", value: 18, suffix: "", label: { so: "Gobol", en: "Regions Covered" } },
  { id: "s3", icon: "briefcase", value: 46, suffix: "+", label: { so: "Mashruuc", en: "Projects Delivered" } },
  { id: "s4", icon: "heart", value: 7200, suffix: "+", label: { so: "Iskaa-wax-u-qabso", en: "Active Volunteers" } },
];

export const fallbackCategories: NewsCategory[] = [
  { id: "c1", slug: "warar", name: { so: "Warar", en: "News" }, count: 12 },
  { id: "c2", slug: "ololaha", name: { so: "Ololaha", en: "Campaign" }, count: 8 },
  { id: "c3", slug: "siyaasad", name: { so: "Siyaasad", en: "Policy" }, count: 6 },
  { id: "c4", slug: "dhalinyaro", name: { so: "Dhalinyaro", en: "Youth" }, count: 5 },
  { id: "c5", slug: "bulsho", name: { so: "Bulsho", en: "Community" }, count: 9 },
];

export const fallbackNews: NewsArticle[] = [
  {
    id: "n1",
    slug: "ololaha-qaran-2026",
    featured: true,
    category: "Ololaha",
    categorySlug: "ololaha",
    title: {
      so: "Xisbiga Hilaac wuxuu bilaabay ololihiisa qaran ee 2026",
      en: "Hilaac launches its 2026 national campaign",
    },
    excerpt: {
      so: "Kumanaan taageerayaal ah ayaa ka soo qayb galay munaasabadda furitaanka ee Muqdisho, halkaas oo hoggaanka xisbigu uu ku soo bandhigay barnaamijka shan-sanadoodka ah.",
      en: "Thousands of supporters attended the launch in Mogadishu, where party leadership presented the five-year national programme.",
    },
    body: {
      so: "Munaasabad ballaaran oo Muqdisho lagu qabtay ayaa lagu bilaabay olalaha qaran ee Xisbiga Hilaac. Hoggaamiyaha xisbigu wuxuu sheegay in barnaamijku uu diiradda saarayo afar tiir: waxbarasho, shaqo dhalinyarada, caafimaad iyo hufnaan maaliyadeed.\n\nWafdiyo ka socday 18 gobol ayaa munaasabadda ka soo qayb galay, waxaana la shaaciyay in xafiisyo cusub laga furayo lix degmo oo cusub bilaha soo socda.",
      en: "A large gathering in Mogadishu opened Hilaac's national campaign. The party leader said the programme focuses on four pillars: education, youth employment, healthcare and fiscal transparency.\n\nDelegations from 18 regions attended, and the party announced new offices opening in six additional districts in the coming months.",
    },
    author: "Warfaafinta Hilaac",
    authorRole: "Media Desk",
    publishedAt: "2026-07-18T09:00:00Z",
    readingMinutes: 4,
    cover: null,
    tags: ["olole", "2026"],
  },
  {
    id: "n2",
    slug: "barnaamij-waxbarasho-gobolada",
    category: "Siyaasad",
    categorySlug: "siyaasad",
    title: {
      so: "Barnaamij waxbarasho oo lagu taageerayo 5,000 arday",
      en: "Education programme to support 5,000 students",
    },
    excerpt: {
      so: "Xisbigu wuxuu soo bandhigay qorshe deeq-waxbarasho oo lagu gaarayo ardayda ugu baahsan gobollada.",
      en: "The party unveiled a scholarship plan targeting students most in need across the regions.",
    },
    author: "Warfaafinta Hilaac",
    publishedAt: "2026-07-02T11:30:00Z",
    readingMinutes: 3,
    cover: null,
  },
  {
    id: "n3",
    slug: "dhalinyarada-iyo-shaqo-abuurka",
    category: "Dhalinyaro",
    categorySlug: "dhalinyaro",
    title: {
      so: "Shirka dhalinyarada: fursado shaqo oo cusub",
      en: "Youth summit: a new jobs agenda",
    },
    excerpt: {
      so: "In ka badan 900 oo dhalinyaro ah ayaa kaga hadlay tababar xirfadeed iyo maalgelinta ganacsiyada yaryar.",
      en: "More than 900 young people discussed vocational training and small business financing.",
    },
    author: "Warfaafinta Hilaac",
    publishedAt: "2026-06-21T08:00:00Z",
    readingMinutes: 5,
    cover: null,
  },
  {
    id: "n4",
    slug: "xafiis-cusub-hargeysa",
    category: "Warar",
    categorySlug: "warar",
    title: {
      so: "Xafiis cusub oo laga furay gobolka",
      en: "New regional office opens",
    },
    excerpt: {
      so: "Xafiiska cusub wuxuu adeegi doonaa xubnaha deegaanka isagoo fududaynaya diiwaangelinta.",
      en: "The new office will serve local members and simplify membership registration.",
    },
    author: "Warfaafinta Hilaac",
    publishedAt: "2026-06-05T14:10:00Z",
    readingMinutes: 2,
    cover: null,
  },
  {
    id: "n5",
    slug: "kaalmo-abaaraha",
    category: "Bulsho",
    categorySlug: "bulsho",
    title: {
      so: "Gurmad loo fidiyay bulshada abaaruhu saameeyeen",
      en: "Relief delivered to drought-affected communities",
    },
    excerpt: {
      so: "Iskaa-wax-u-qabsayaasha xisbigu waxay qaybiyeen biyo iyo raashin ku filan 1,200 qoys.",
      en: "Party volunteers distributed water and food supplies to 1,200 households.",
    },
    author: "Warfaafinta Hilaac",
    publishedAt: "2026-05-19T07:45:00Z",
    readingMinutes: 3,
    cover: null,
  },
  {
    id: "n6",
    slug: "hufnaanta-maaliyadda",
    category: "Siyaasad",
    categorySlug: "siyaasad",
    title: {
      so: "Warbixinta hufnaanta maaliyadda ee rubuca",
      en: "Quarterly financial transparency report",
    },
    excerpt: {
      so: "Xisbigu wuxuu daabacay warbixin dhammaystiran oo ku saabsan dakhliga iyo kharashka.",
      en: "The party published a complete report on income and expenditure.",
    },
    author: "Warfaafinta Hilaac",
    publishedAt: "2026-04-30T10:00:00Z",
    readingMinutes: 6,
    cover: null,
  },
];

export const fallbackProjects: Project[] = [
  {
    id: "p1",
    slug: "iskuulo-gobolada",
    title: { so: "Dhisidda Iskuulo Gobolada", en: "Regional School Construction" },
    description: {
      so: "Dhisidda 12 iskuul oo casri ah oo laga hirgelinayo degmooyinka baadiyaha ah si ardayda loogu dhoweeyo waxbarashada aasaasiga ah.",
      en: "Building 12 modern schools across rural districts to bring primary education closer to children.",
    },
    status: "ongoing",
    progress: 68,
    budget: 1250000,
    currency: "USD",
    startDate: "2025-02-01",
    endDate: "2026-12-31",
    location: "Gobollada Dhexe",
    category: "Waxbarasho",
    cover: null,
  },
  {
    id: "p2",
    slug: "biyo-nadiif-ah",
    title: { so: "Mashruuca Biyaha Nadiifta ah", en: "Clean Water Initiative" },
    description: {
      so: "Qodista 30 ceel oo biyo nadiif ah iyo dhisidda tuubooyin lagu gaarsiinayo 40,000 qof.",
      en: "Drilling 30 boreholes and laying distribution lines serving 40,000 people.",
    },
    status: "ongoing",
    progress: 42,
    budget: 860000,
    currency: "USD",
    startDate: "2025-08-15",
    endDate: "2027-03-30",
    location: "Gobollada Waqooyi",
    category: "Kaabayaasha",
    cover: null,
  },
  {
    id: "p3",
    slug: "tababar-dhalinyaro",
    title: { so: "Tababarka Xirfadaha Dhalinyarada", en: "Youth Skills Training" },
    description: {
      so: "Tababar xirfadeed oo lagu diyaarinayo 5,000 dhalinyaro ah suuqa shaqada iyo ganacsiga yar.",
      en: "Vocational training preparing 5,000 young people for the job market and small enterprise.",
    },
    status: "completed",
    progress: 100,
    budget: 430000,
    currency: "USD",
    startDate: "2024-01-10",
    endDate: "2025-11-20",
    location: "Muqdisho",
    category: "Dhalinyaro",
    cover: null,
  },
  {
    id: "p4",
    slug: "xarumaha-caafimaadka",
    title: { so: "Xarumaha Caafimaadka Aasaasiga ah", en: "Primary Health Centres" },
    description: {
      so: "Cusboonaysiinta 8 xarumood oo caafimaad iyo qalab caafimaad oo cusub.",
      en: "Upgrading 8 health centres with new medical equipment and staffing support.",
    },
    status: "planned",
    progress: 12,
    budget: 980000,
    currency: "USD",
    startDate: "2026-09-01",
    endDate: "2028-06-30",
    location: "Gobollada Koonfureed",
    category: "Caafimaad",
    cover: null,
  },
  {
    id: "p5",
    slug: "waddooyin-tuulooyin",
    title: { so: "Waddooyinka Tuulooyinka", en: "Rural Road Access" },
    description: {
      so: "Cusboonaysiinta 140km oo waddooyin ah si suuqyada loogu xiro beeraleyda.",
      en: "Rehabilitating 140km of roads to connect farmers to regional markets.",
    },
    status: "paused",
    progress: 35,
    budget: 1500000,
    currency: "USD",
    startDate: "2025-04-01",
    endDate: "2027-10-15",
    location: "Shabeellaha",
    category: "Kaabayaasha",
    cover: null,
  },
  {
    id: "p6",
    slug: "maktabad-dhijitaal",
    title: { so: "Maktabadda Dhijitaalka ah", en: "Digital Library Network" },
    description: {
      so: "Xarumo internet iyo maktabad dhijitaal ah oo laga furay 10 degmo.",
      en: "Internet-enabled digital libraries opened across 10 districts.",
    },
    status: "ongoing",
    progress: 77,
    budget: 320000,
    currency: "USD",
    startDate: "2025-06-01",
    endDate: "2026-10-01",
    location: "Qaran",
    category: "Tignoolajiyada",
    cover: null,
  },
];

export const fallbackLeaders: Leader[] = [
  {
    id: "l1",
    slug: "guddoomiyaha",
    name: "Cabdiraxmaan Maxamed",
    order: 1,
    position: { so: "Guddoomiyaha Xisbiga", en: "Party Chairman" },
    bio: {
      so: "Hoggaamiye khibrad dheer u leh maamulka dadweynaha iyo horumarinta bulshada, wuxuu hormuud u ahaa aasaasidda Hilaac.",
      en: "A leader with deep experience in public administration and community development, he was central to founding Hilaac.",
    },
    photo: null,
    socials: { facebook: "#", x: "#", linkedin: "#" },
  },
  {
    id: "l2",
    slug: "ku-xigeenka",
    name: "Faadumo Xasan",
    order: 2,
    position: { so: "Ku-xigeenka Guddoomiyaha", en: "Deputy Chairperson" },
    bio: {
      so: "Khabiirad ku takhasustay xuquuqda haweenka iyo waxbarashada, waxay hoggaamisaa barnaamijyada bulshada.",
      en: "A specialist in women's rights and education, she leads the party's community programmes.",
    },
    photo: null,
    socials: { facebook: "#", x: "#", instagram: "#" },
  },
  {
    id: "l3",
    slug: "xoghayaha",
    name: "Maxamuud Cali",
    order: 3,
    position: { so: "Xoghayaha Guud", en: "Secretary General" },
    bio: {
      so: "Maamule khibrad u leh abaabulka xisbiyada iyo xiriirka gobollada.",
      en: "An administrator experienced in party organisation and regional coordination.",
    },
    photo: null,
    socials: { facebook: "#", linkedin: "#" },
  },
  {
    id: "l4",
    slug: "afhayeenka",
    name: "Xaawo Aadan",
    order: 4,
    position: { so: "Afhayeenka Xisbiga", en: "Party Spokesperson" },
    bio: {
      so: "Weriye hore oo hadda hoggaamisa qaybta warfaafinta iyo xiriirka warbaahinta.",
      en: "A former journalist who now leads the party's media and communications desk.",
    },
    photo: null,
    socials: { x: "#", instagram: "#", youtube: "#" },
  },
  {
    id: "l5",
    slug: "maaliyadda",
    name: "Cabdullaahi Nuur",
    order: 5,
    position: { so: "Agaasimaha Maaliyadda", en: "Director of Finance" },
    bio: {
      so: "Xisaabiye shatiga haysta oo ka shaqeeya hufnaanta maaliyadda xisbiga.",
      en: "A chartered accountant responsible for the party's financial transparency.",
    },
    photo: null,
    socials: { linkedin: "#" },
  },
  {
    id: "l6",
    slug: "dhalinyarada",
    name: "Sagal Ibraahim",
    order: 6,
    position: { so: "Guddoomiyaha Dhalinyarada", en: "Youth Wing Chair" },
    bio: {
      so: "Hoggaamisa ururka dhalinyarada ee xisbiga iyo barnaamijyada tababarka.",
      en: "Leads the party's youth wing and its national training programmes.",
    },
    photo: null,
    socials: { instagram: "#", x: "#" },
  },
];

export const fallbackEvents: PartyEvent[] = [
  {
    id: "e1",
    slug: "shirka-qaran-muqdisho",
    title: { so: "Shirka Qaran ee Muqdisho", en: "National Convention — Mogadishu" },
    description: {
      so: "Shir qaran oo lagu soo bandhigayo barnaamijka xisbiga iyo doorashada guddiga fulinta.",
      en: "A national convention presenting the party programme and electing the executive committee.",
    },
    startsAt: "2026-09-12T08:00:00Z",
    endsAt: "2026-09-12T16:00:00Z",
    location: { so: "Hoteel Jazeera, Muqdisho", en: "Jazeera Hotel, Mogadishu" },
    city: "Muqdisho",
    status: "upcoming",
    capacity: 1200,
    attending: 860,
    cover: null,
  },
  {
    id: "e2",
    slug: "kulanka-dhalinyarada",
    title: { so: "Kulanka Dhalinyarada Gobolka", en: "Regional Youth Forum" },
    description: {
      so: "Kulan furan oo dhalinyaradu kula xiriirayaan hoggaanka xisbiga.",
      en: "An open forum connecting young people directly with party leadership.",
    },
    startsAt: "2026-08-24T13:00:00Z",
    location: { so: "Xarunta Dhalinyarada", en: "Regional Youth Centre" },
    status: "upcoming",
    capacity: 500,
    attending: 312,
    cover: null,
  },
  {
    id: "e3",
    slug: "olole-diiwaangelin",
    title: { so: "Ololaha Diiwaangelinta Xubnaha", en: "Membership Registration Drive" },
    description: {
      so: "Toddobaad diiwaangelin oo laga fulinayo dhammaan degmooyinka.",
      en: "A week-long registration drive running across all districts.",
    },
    startsAt: "2026-08-10T07:00:00Z",
    endsAt: "2026-08-17T18:00:00Z",
    location: { so: "Degmooyinka oo dhan", en: "All districts" },
    status: "upcoming",
    cover: null,
  },
  {
    id: "e4",
    slug: "munaasabadda-furitaanka",
    title: { so: "Munaasabadda Furitaanka Ololaha", en: "Campaign Launch Ceremony" },
    description: {
      so: "Munaasabaddii lagu bilaabay ololaha qaran ee 2026.",
      en: "The ceremony that opened the 2026 national campaign.",
    },
    startsAt: "2026-07-18T09:00:00Z",
    location: { so: "Muqdisho", en: "Mogadishu" },
    status: "past",
    cover: null,
  },
  {
    id: "e5",
    slug: "shirka-warbaahinta",
    title: { so: "Shirka Jaraa'id ee Barnaamijka", en: "Policy Press Conference" },
    description: {
      so: "Soo bandhigidda barnaamijka waxbarashada iyo caafimaadka.",
      en: "Presentation of the education and healthcare programme.",
    },
    startsAt: "2026-06-28T10:00:00Z",
    location: { so: "Xarunta Warbaahinta", en: "Media Centre" },
    status: "past",
    cover: null,
  },
];

export const fallbackGallery: GalleryItem[] = [
  { id: "g1", type: "photo", src: "/images/flag.webp", thumb: "/images/flag.webp", album: "Olole", title: { so: "Furitaanka ololaha", en: "Campaign launch" }, width: 1600, height: 1000 },
  { id: "g2", type: "photo", src: "/images/logo.webp", thumb: "/images/logo.webp", album: "Astaan", title: { so: "Astaanta xisbiga", en: "Party emblem" }, width: 1200, height: 1200 },
  { id: "g3", type: "photo", src: "/images/flag.webp", thumb: "/images/flag.webp", album: "Bulsho", title: { so: "Kulanka bulshada", en: "Community meeting" }, width: 1600, height: 1200 },
  { id: "g4", type: "photo", src: "/images/logo.webp", thumb: "/images/logo.webp", album: "Dhalinyaro", title: { so: "Shirka dhalinyarada", en: "Youth summit" }, width: 1000, height: 1400 },
  { id: "g5", type: "photo", src: "/images/flag.webp", thumb: "/images/flag.webp", album: "Gobollada", title: { so: "Booqasho gobol", en: "Regional visit" }, width: 1600, height: 900 },
  { id: "g6", type: "photo", src: "/images/logo.webp", thumb: "/images/logo.webp", album: "Olole", title: { so: "Diiwaangelinta xubnaha", en: "Member registration" }, width: 1200, height: 1500 },
  { id: "g7", type: "photo", src: "/images/flag.webp", thumb: "/images/flag.webp", album: "Bulsho", title: { so: "Gurmadka abaaraha", en: "Drought relief" }, width: 1600, height: 1100 },
  { id: "g8", type: "photo", src: "/images/logo.webp", thumb: "/images/logo.webp", album: "Astaan", title: { so: "Calanka", en: "The flag" }, width: 1400, height: 1000 },
];

export const fallbackTestimonials: Testimonial[] = [
  {
    id: "ts1",
    name: "Cabdi Warsame",
    role: { so: "Beeraley, Shabeellaha", en: "Farmer, Shabelle" },
    quote: {
      so: "Markii waddada la cusboonaysiiyay, waxaan alaabtayda gaarsiin karaa suuqa isla maalintaas. Taasi waa isbeddel dhab ah.",
      en: "Once the road was rehabilitated I could reach the market the same day. That is real change.",
    },
    rating: 5,
    avatar: null,
  },
  {
    id: "ts2",
    name: "Hodan Cabdi",
    role: { so: "Arday, Muqdisho", en: "Student, Mogadishu" },
    quote: {
      so: "Deeq-waxbarashadu waxay ii saamaxday inaan jaamacadda sii wado. Waxaan hadda tababaraa ardayda kale.",
      en: "The scholarship let me continue university. Now I tutor other students myself.",
    },
    rating: 5,
    avatar: null,
  },
  {
    id: "ts3",
    name: "Yuusuf Xasan",
    role: { so: "Ganacsade yar", en: "Small business owner" },
    quote: {
      so: "Tababarka ganacsiga wuxuu i baray sida loo maareeyo xisaabta. Ganacsigaygu wuu labanlaabmay.",
      en: "The business training taught me bookkeeping. My shop has since doubled in size.",
    },
    rating: 4,
    avatar: null,
  },
  {
    id: "ts4",
    name: "Amina Nuur",
    role: { so: "Macalimad", en: "Teacher" },
    quote: {
      so: "Iskuulka cusub wuxuu u dhow yahay carruurta. Ma aha inay maalin walba socdaan saddex saacadood.",
      en: "The new school is close to the children. They no longer walk three hours each day.",
    },
    rating: 5,
    avatar: null,
  },
];
