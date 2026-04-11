"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

// ─── Types ────────────────────────────────────────────────────────────────────
export type HubListingType = "sale" | "investment" | "merger" | "partnership"
export type HubListingStatus = "active" | "closed" | "under_loi" | "draft"
export type HubSector =
  | "technology" | "industrial" | "healthcare" | "consumer" | "financial"
  | "real_estate" | "energy" | "media" | "logistics" | "education" | "other"

export interface HubContact {
  name: string
  email: string
  firm?: string
}

export interface HubInterest {
  id: string
  name: string
  email: string
  firm?: string
  message: string
  nda: boolean
  createdAt: string
}

export interface HubListing {
  id: string
  title: string
  type: HubListingType
  sector: HubSector
  country: string
  city?: string
  isDemo?: boolean    // marks auto-seeded example listings

  // Financials (€M)
  revenueM: number
  ebitdaM: number
  askingMultiple?: number  // EV/EBITDA asking
  askingPriceM?: number    // or fixed price
  netDebtM?: number

  description: string
  highlights: string[]     // key selling points, up to 5
  useOfFunds?: string      // for investment type
  dealRationale?: string   // for merger type

  // Metadata
  anonymous: boolean
  ownerName?: string       // if not anonymous
  ownerFirm?: string
  ownerEmail: string       // always stored, never shown if anonymous

  tags: string[]
  status: HubListingStatus
  interests: HubInterest[]
  views: number

  createdAt: string
  updatedAt: string
  closedAt?: string
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "deeplbo_hub_listings"

function loadAll(): Record<string, HubListing> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") ?? {} }
  catch { return {} }
}

function saveAll(data: Record<string, HubListing>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

function genId() {
  return `hub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function getAllListings(): HubListing[] {
  return Object.values(loadAll())
    .filter(l => l.status === "active" || l.status === "under_loi")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getMyListings(ownerEmail: string): HubListing[] {
  return Object.values(loadAll())
    .filter(l => l.ownerEmail === ownerEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getListing(id: string): HubListing | null {
  return loadAll()[id] ?? null
}

export function incrementViews(id: string) {
  const all = loadAll()
  if (all[id]) {
    all[id].views = (all[id].views ?? 0) + 1
    saveAll(all)
  }
}

// ─── Demo seed data ───────────────────────────────────────────────────────────
export const DEMO_LISTINGS: Omit<HubListing, "id" | "interests" | "createdAt" | "updatedAt" | "views">[] = [
  {
    title: "Software de gestión logística Tier-2 aeroespacial",
    type: "sale",
    sector: "technology",
    country: "España",
    city: "Bilbao",
    revenueM: 8.5,
    ebitdaM: 2.9,
    askingMultiple: 11,
    netDebtM: 0.8,
    description: "SaaS B2B con 12 años de histórico, contratos recurrentes con 3 de los 5 principales proveedores Tier-2 de Airbus en España. EBITDA margin del 34%. Fundador busca socio industrial o PE para escalar en Europa.",
    highlights: [
      "ARR de €7.1M con churn <4%",
      "Contratos 3-5 años con renovación automática",
      "EBITDA margin 34%, expansión a 38% con economías de escala",
      "Pipeline de €12M en licitaciones activas",
      "Equipo técnico de 22 personas comprometido post-deal",
    ],
    anonymous: false,
    ownerName: "Carlos Menéndez",
    ownerFirm: "Menéndez Aerospace Software",
    ownerEmail: "c.menendez@mas-bilbao.es",
    tags: ["SaaS", "B2B", "Aeroespacial", "Recurrente", "España"],
    status: "active",
  },
  {
    title: "Clínica dental con 4 centros en Valencia — roll-up en proceso",
    type: "investment",
    sector: "healthcare",
    country: "España",
    city: "Valencia",
    revenueM: 5.2,
    ebitdaM: 1.4,
    askingMultiple: 9.5,
    netDebtM: 1.1,
    description: "Plataforma dental con 4 clínicas en Valencia capital. Gestión centralizada, marca propia consolidada, tecnología digital (CAD/CAM, 3D). Buscamos inversor PE o family office para acelerar roll-up con 8-10 clínicas adicionales identificadas.",
    highlights: [
      "4 centros operativos, EBITDA consolidado €1.4M",
      "Pipeline de adquisiciones: 8 clínicas en exclusiva",
      "Gestión centralizada (admin, RRHH, compras)",
      "Marca propia con 4.7⭐ en Google (1.200+ reseñas)",
      "Fundadora reinvierte el 20% como minoritaria",
    ],
    useOfFunds: "Adquisición de 8 clínicas adicionales (€7-9M), refuerzo equipo directivo, nueva tecnología de diagnóstico.",
    anonymous: false,
    ownerName: "Dra. Ana Villanueva",
    ownerFirm: "Dental Premium Group",
    ownerEmail: "a.villanueva@dentalpremium.es",
    tags: ["Healthcare", "Roll-up", "Dental", "Valencia", "Recurrente"],
    status: "active",
  },
  {
    title: "Fabricante de componentes metálicos de precisión — venta por sucesión",
    type: "sale",
    sector: "industrial",
    country: "España",
    city: "Vitoria-Gasteiz",
    revenueM: 14.2,
    ebitdaM: 3.1,
    askingMultiple: 9,
    netDebtM: 2.3,
    description: "Empresa familiar fundada en 1987, segunda generación sin continuidad. Tornillería y mecanizado CNC de alta precisión para automoción y aeroespacial. Cliente ancla: Stellantis y Mercedes Benz España. Activos inmobiliarios propios incluidos.",
    highlights: [
      "37 años de histórico, sin deuda significativa",
      "Activos inmobiliarios propios valorados en €4.2M",
      "Cartera de clientes >15 años de antigüedad media",
      "Certificaciones IATF 16949 y AS9100 vigentes",
      "Equipo de 85 personas, convenio colectivo propio",
    ],
    anonymous: true,
    ownerEmail: "confidencial@deeplbo-hub.es",
    tags: ["Industrial", "Mecanizado", "Familiar", "Automoción", "Aeroespacial"],
    status: "active",
  },
  {
    title: "E-commerce de suplementación deportiva — búsqueda de socio estratégico",
    type: "merger",
    sector: "consumer",
    country: "España",
    city: "Madrid",
    revenueM: 3.8,
    ebitdaM: 0.7,
    netDebtM: 0.2,
    description: "D2C de suplementación deportiva con marca propia, 180K clientes activos, LTV €180, CAC €22. Buscamos fusión con distribuidor físico o marca de equipamiento deportivo para reducir CAC y ganar canal off-trade.",
    highlights: [
      "180K clientes activos, tasa repetición 58%",
      "Margen bruto 68%, potencial sinergias logísticas €0.4M",
      "Marca registrada en 5 países europeos",
      "App propia con 45K usuarios activos mensuales",
      "Crecimiento orgánico 35% YoY últimos 2 años",
    ],
    dealRationale: "Buscamos complementariedad de canales y reducción de CAC conjunto. No buscamos venta total, sino partnership estratégico con 30-50% de equity.",
    anonymous: false,
    ownerName: "Anónimo (por confidencialidad)",
    ownerEmail: "deals@deeplbo-hub.es",
    tags: ["DTC", "Consumer", "Deportes", "E-commerce", "Digital"],
    status: "active",
  },
]

export function seedDemoListings() {
  const all = loadAll()
  if (Object.keys(all).length > 0) {
    // Retroactively mark existing demo listings that predate the isDemo field
    const demoTitles = new Set(DEMO_LISTINGS.map(d => d.title))
    let changed = false
    Object.values(all).forEach(l => {
      if (demoTitles.has(l.title) && !l.isDemo) {
        all[l.id].isDemo = true
        changed = true
      }
    })
    if (changed) saveAll(all)
    return
  }
  DEMO_LISTINGS.forEach((listing, i) => {
    const id = genId()
    all[id] = {
      ...listing,
      id,
      isDemo: true,
      interests: [],
      views: Math.floor(Math.random() * 300) + 50,
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }
  })
  saveAll(all)
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface HubState {
  listings: HubListing[]
  myListings: HubListing[]
  activeListing: HubListing | null
  filterType: HubListingType | "all"
  filterSector: HubSector | "all"
  filterCountry: string
  searchQuery: string

  loadListings: () => void
  loadMyListings: (ownerEmail: string) => void
  loadListing: (id: string) => void
  createListing: (data: Omit<HubListing, "id" | "interests" | "createdAt" | "updatedAt" | "views" | "status">) => string
  updateListing: (id: string, data: Partial<HubListing>) => void
  closeListing: (id: string) => void
  deleteListing: (id: string) => void
  expressInterest: (listingId: string, contact: Omit<HubInterest, "id" | "createdAt">) => void
  setFilter: (filter: Partial<Pick<HubState, "filterType" | "filterSector" | "filterCountry" | "searchQuery">>) => void
}

export const useHubStore = create<HubState>()(
  subscribeWithSelector((set, get) => ({
    listings: [],
    myListings: [],
    activeListing: null,
    filterType: "all",
    filterSector: "all",
    filterCountry: "",
    searchQuery: "",

    loadListings() {
      seedDemoListings()
      set({ listings: getAllListings() })
    },

    loadMyListings(ownerEmail) {
      set({ myListings: getMyListings(ownerEmail) })
    },

    loadListing(id) {
      incrementViews(id)
      set({ activeListing: getListing(id) })
    },

    createListing(data) {
      const id = genId()
      const listing: HubListing = {
        ...data,
        id,
        status: "active",
        interests: [],
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const all = loadAll()
      all[id] = listing
      saveAll(all)
      set({ listings: getAllListings() })
      return id
    },

    updateListing(id, data) {
      const all = loadAll()
      if (!all[id]) return
      all[id] = { ...all[id], ...data, updatedAt: new Date().toISOString() }
      saveAll(all)
      set({ listings: getAllListings(), activeListing: all[id] })
    },

    closeListing(id) {
      get().updateListing(id, { status: "closed", closedAt: new Date().toISOString() })
    },

    deleteListing(id) {
      const all = loadAll()
      delete all[id]
      saveAll(all)
      set({ listings: getAllListings() })
    },

    expressInterest(listingId, contact) {
      const all = loadAll()
      if (!all[listingId]) return
      const interest: HubInterest = {
        ...contact,
        id: `int_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      all[listingId].interests = [...(all[listingId].interests ?? []), interest]
      all[listingId].updatedAt = new Date().toISOString()
      saveAll(all)
      set({ activeListing: all[listingId] })
    },

    setFilter(filter) {
      set(filter as Partial<HubState>)
    },
  }))
)
