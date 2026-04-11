import { NextRequest, NextResponse } from "next/server"
import PptxGenJS from "pptxgenjs"
import type { LBOInputs } from "@/types/lbo"
import { computeLBO } from "@/lib/lbo-engine"
import { fmt } from "@/lib/lbo-engine"

// ─── Design tokens (matching IST template style) ─────────────────────────────
const C = {
  navy:     "0A1F44",
  navyDark: "0D1B36",
  navyMid:  "112B5E",
  gold:     "F59E0B",
  white:    "FFFFFF",
  gray:     "94A3B8",
  lightBg:  "1E3A6E",
  green:    "10B981",
  red:      "EF4444",
  amber:    "F59E0B",
}

// EMU helpers (914400 EMU = 1 inch)
const W  = 10  // slide width inches
const H  = 5.63 // slide height inches

// ─── Helpers ─────────────────────────────────────────────────────────────────
function titleSlide(prs: PptxGenJS, analysisName: string, companyName: string, sector: string, date: string) {
  const slide = prs.addSlide()
  slide.background = { color: C.navy }

  // Left gold stripe
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: H, fill: { color: C.gold }, line: { color: C.gold, width: 0 } })
  // Bottom navy band
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 3.8, w: W, h: 1.83, fill: { color: C.navyMid }, line: { color: C.navyMid, width: 0 } })
  // Right dark panel
  slide.addShape(prs.ShapeType.rect, { x: 6.5, y: 0, w: 3.5, h: 3.8, fill: { color: C.navyDark }, line: { color: C.navyDark, width: 0 } })

  // Badge top
  slide.addText("LBO INVESTMENT MEMO", { x: 0.4, y: 0.5, w: 5.5, h: 0.35, fontSize: 10, bold: true, color: C.gold, charSpacing: 3, fontFace: "Calibri" })

  // Company name
  slide.addText(companyName || analysisName, { x: 0.4, y: 1.0, w: 5.8, h: 1.2, fontSize: 36, bold: true, color: C.white, fontFace: "Calibri", wrap: true })

  // Sector tag
  if (sector) {
    slide.addText(sector.toUpperCase(), { x: 0.4, y: 2.3, w: 4, h: 0.3, fontSize: 9, bold: false, color: C.gray, charSpacing: 2, fontFace: "Calibri" })
  }

  // Date bottom band
  slide.addText(`Análisis LBO · ${date}`, { x: 0.4, y: 3.9, w: 6, h: 0.35, fontSize: 10, color: C.gray, fontFace: "Calibri" })
  slide.addText("CONFIDENCIAL · DeepLBO", { x: 0.4, y: 4.3, w: 6, h: 0.3, fontSize: 9, color: C.gray, charSpacing: 1, fontFace: "Calibri" })
}

function sectionSlide(prs: PptxGenJS, title: string, subtitle: string) {
  const slide = prs.addSlide()
  slide.background = { color: C.navyDark }
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: H, fill: { color: C.gold }, line: { color: C.gold, width: 0 } })
  slide.addText(title, { x: 0.4, y: 2.0, w: 9, h: 0.8, fontSize: 32, bold: true, color: C.white, fontFace: "Calibri" })
  slide.addText(subtitle, { x: 0.4, y: 2.9, w: 9, h: 0.4, fontSize: 13, color: C.gold, fontFace: "Calibri" })
  return slide
}

function contentSlide(prs: PptxGenJS, title: string) {
  const slide = prs.addSlide()
  slide.background = { color: C.navyDark }
  // Top bar
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.65, fill: { color: C.navy }, line: { color: C.navy, width: 0 } })
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: H, fill: { color: C.gold }, line: { color: C.gold, width: 0 } })
  // Title
  slide.addText(title.toUpperCase(), { x: 0.3, y: 0.1, w: 9, h: 0.45, fontSize: 12, bold: true, color: C.gold, charSpacing: 2, fontFace: "Calibri" })
  return slide
}


// ─── Main route ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { inputs: LBOInputs; analysisName?: string }
    const { inputs, analysisName = "LBO Analysis" } = body
    const r = computeLBO(inputs)
    const base = r.scenarios.find(s => s.scenario === "Base")!
    const bear = r.scenarios.find(s => s.scenario === "Bear")!
    const bull = r.scenarios.find(s => s.scenario === "Bull")!
    const strat = r.scenarios.find(s => s.scenario === "Strategic")!
    const date = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

    const prs = new PptxGenJS()
    prs.layout = "LAYOUT_WIDE"
    prs.title  = analysisName

    // ── Slide 1: Cover ────────────────────────────────────────────────────────
    titleSlide(prs, analysisName, inputs.companyName, inputs.sector, date)

    // ── Slide 2: Deal Snapshot KPIs ───────────────────────────────────────────
    {
      const slide = contentSlide(prs, "DEAL SNAPSHOT · Métricas Clave")

      // KPI grid 5 items
      const kpis = [
        { label: "Entry EV",        value: fmt.eur(r.ev),                   sub: `${fmt.mult(inputs.entryMultiple)} x EBITDA` },
        { label: "Equity Invertido", value: fmt.eur(r.totalEquityInvested),  sub: `+ ${fmt.eur(r.fees)} fees` },
        { label: "Deuda Senior",    value: fmt.eur(r.seniorDebt),            sub: `${fmt.mult(r.debtOverEbitda)} x EBITDA` },
        { label: "IRR Base",        value: fmt.pct(base.irr),               sub: "Caso Base" },
        { label: "MOIC Base",       value: fmt.mult(base.moic),             sub: `${inputs.holdPeriod} años` },
      ]
      kpis.forEach((k, i) => {
        const x = 0.25 + i * 2.05
        slide.addShape("rect", { x, y: 0.85, w: 1.95, h: 1.1, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        const valColor = (k.label === "IRR Base" || k.label === "MOIC Base") ? C.gold : C.white
        slide.addText(k.value, { x, y: 0.9,  w: 1.95, h: 0.5,  fontSize: 20, bold: true,  color: valColor, align: "center", fontFace: "Calibri" })
        slide.addText(k.label, { x, y: 1.38, w: 1.95, h: 0.28, fontSize: 8,  bold: false, color: C.gray,   align: "center", fontFace: "Calibri" })
        slide.addText(k.sub,   { x, y: 1.64, w: 1.95, h: 0.25, fontSize: 7,  bold: false, color: C.gray,   align: "center", fontFace: "Calibri" })
      })

      // Divider
      slide.addShape("line", { x: 0.25, y: 2.2, w: 9.5, h: 0, line: { color: C.lightBg, width: 1 } })

      // Entry summary row
      const eRows = [
        ["Empresa",      inputs.companyName || "—"],
        ["Sector",       inputs.sector || "—"],
        ["Año",          String(inputs.transactionYear)],
        ["Revenue LTM",  fmt.eur(r.yearly[0].revenue)],
        ["EBITDA LTM",   fmt.eur(r.yearly[0].ebitda)],
        ["Margen EBITDA",fmt.pct(r.yearly[0].ebitdaMargin)],
        ["Hold Period",  `${inputs.holdPeriod} años`],
      ]
      eRows.forEach((row, i) => {
        const x = i < 4 ? 0.25 : 5.3
        const yOff = i < 4 ? i : i - 4
        slide.addText(row[0], { x, y: 2.35 + yOff * 0.38, w: 1.8, h: 0.3, fontSize: 9, color: C.gray, fontFace: "Calibri" })
        slide.addText(row[1], { x: x + 1.85, y: 2.35 + yOff * 0.38, w: 2.5, h: 0.3, fontSize: 9, bold: true, color: C.white, fontFace: "Calibri" })
      })
    }

    // ── Slide 3: Transaction Structure ────────────────────────────────────────
    {
      const slide = contentSlide(prs, "DEAL MECHANICS · Fuentes y Usos")

      const totalFunds = r.seniorDebt + r.totalEquityInvested

      // Sources table
      const srcRows = [
        ["FUENTES",            "Importe",  "%",    "Condiciones"],
        ["Deuda Senior",       fmt.eur(r.seniorDebt),           fmt.pct(r.seniorDebt / totalFunds),           `${fmt.pct(inputs.interestRate)} interés`],
        ["Equity (Sponsor)",   fmt.eur(r.totalEquityInvested),  fmt.pct(r.totalEquityInvested / totalFunds),  "Equity fund"],
        ["TOTAL FUENTES",      fmt.eur(totalFunds),             "100%",                                       ""],
      ]
      const usesRows = [
        ["USOS",               "Importe",  "%",    ""],
        ["Enterprise Value",   fmt.eur(r.ev),     fmt.pct(r.ev / (r.ev + r.fees)), "Precio de compra"],
        ["Fees / Gastos",      fmt.eur(r.fees),   fmt.pct(r.fees / (r.ev + r.fees)), `${fmt.pct(inputs.feesPct)} sobre EV`],
        ["TOTAL USOS",         fmt.eur(r.ev + r.fees), "100%", ""],
      ]

      function drawTable(rows: string[][], x: number, y: number) {
        rows.forEach((row, ri) => {
          const isHeader = ri === 0
          const isTotal  = ri === rows.length - 1
          const bg = isHeader ? C.navyMid : isTotal ? C.navy : C.navyDark
          const tcol = isHeader ? C.gold : isTotal ? C.gold : C.white

          slide.addShape("rect", { x, y: y + ri * 0.38, w: 4.5, h: 0.36, fill: { color: bg }, line: { color: C.lightBg, width: 1 } })

          const cols = [0, 1.4, 2.3, 3.3]
          const widths = [1.35, 0.85, 0.95, 1.15]
          row.forEach((cell, ci) => {
            slide.addText(cell, {
              x: x + cols[ci] + 0.05,
              y: y + ri * 0.38 + 0.04,
              w: widths[ci],
              h: 0.28,
              fontSize: isHeader || isTotal ? 7.5 : 8,
              bold: isHeader || isTotal,
              color: ci === 0 ? tcol : C.white,
              fontFace: "Calibri",
            })
          })
        })
      }

      drawTable(srcRows, 0.25, 0.8)
      drawTable(usesRows, 5.1, 0.8)

      // Capital structure bar
      const eqPct = r.totalEquityInvested / totalFunds
      slide.addText("ESTRUCTURA DE CAPITAL", { x: 0.25, y: 2.5, w: 4, h: 0.3, fontSize: 8, bold: true, color: C.gold, charSpacing: 2, fontFace: "Calibri" })
      slide.addShape("rect", { x: 0.25, y: 2.85, w: 9.5, h: 0.4, fill: { color: C.navy }, line: { color: C.lightBg, width: 0 } })
      slide.addShape("rect", { x: 0.25, y: 2.85, w: 9.5 * eqPct, h: 0.4, fill: { color: C.gold }, line: { color: C.gold, width: 0 } })
      slide.addText(`Equity ${fmt.pct(eqPct)} (${fmt.eur(r.totalEquityInvested)})`, { x: 0.3, y: 2.88, w: 4, h: 0.32, fontSize: 8.5, bold: true, color: C.navyDark, fontFace: "Calibri" })
      slide.addText(`Deuda ${fmt.pct(1 - eqPct)} (${fmt.eur(r.seniorDebt)})`, { x: 0.25 + 9.5 * eqPct + 0.1, y: 2.88, w: 4, h: 0.32, fontSize: 8.5, color: C.gray, fontFace: "Calibri" })

      // Ratios
      const ratios = [
        { l: "Deuda/EBITDA", v: fmt.mult(r.debtOverEbitda) },
        { l: "EBITDA/Intereses", v: `${r.interestCoverage.toFixed(1)}x` },
        { l: "Tipo Interés", v: fmt.pct(inputs.interestRate) },
      ]
      ratios.forEach((rat, i) => {
        const x = 0.25 + i * 3.2
        slide.addText(rat.l, { x, y: 3.45, w: 3, h: 0.25, fontSize: 8, color: C.gray, fontFace: "Calibri" })
        slide.addText(rat.v, { x, y: 3.7,  w: 3, h: 0.3,  fontSize: 14, bold: true, color: C.white, fontFace: "Calibri" })
      })
    }

    // ── Slide 4: Financial Projections ────────────────────────────────────────
    {
      const slide = contentSlide(prs, "PROYECCIONES FINANCIERAS · P&L 5 Años")
      const Y = r.yearly

      const headers = ["", "Y0 (LTM)", "Y1", "Y2", "Y3", "Y4", "Y5"]
      const rows: [string, (y: typeof Y[0]) => string, string][] = [
        ["Revenue (M€)",      y => y.revenue.toFixed(1),             C.white],
        ["Crecimiento",        y => y.revenueGrowth != null ? fmt.pct(y.revenueGrowth) : "—", C.gray],
        ["EBITDA (M€)",       y => y.ebitda.toFixed(1),              C.gold],
        ["Margen EBITDA",     y => fmt.pct(y.ebitdaMargin),          C.gold],
        ["EBIT (M€)",         y => y.ebit.toFixed(1),                C.white],
        ["Beneficio Neto (M€)",y => y.netIncome.toFixed(1),          C.white],
        ["FCF Antes Deuda",   y => y.fcfBeforeDebt.toFixed(1),       C.green],
      ]

      const colW = [1.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1]
      const colX = colW.reduce((acc, w, i) => { acc.push(i === 0 ? 0.2 : acc[i - 1] + colW[i - 1]); return acc }, [] as number[])

      // Header row
      headers.forEach((h, ci) => {
        slide.addShape("rect", { x: colX[ci], y: 0.75, w: colW[ci], h: 0.32, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        slide.addText(h, { x: colX[ci] + 0.05, y: 0.78, w: colW[ci] - 0.1, h: 0.25, fontSize: 8, bold: true, color: C.gold, fontFace: "Calibri", align: ci === 0 ? "left" : "center" })
      })

      // Data rows
      rows.forEach(([label, fn, col], ri) => {
        Y.forEach((y, ci) => {
          const x = ci === 0 ? colX[0] : colX[ci + 1] - (ci === 0 ? 0 : 0)
          const rX = ci === 0 ? colX[0] : colX[ci]
          const bg = ri % 2 === 0 ? C.navyDark : C.navy
          if (ci === 0) {
            slide.addShape("rect", { x: colX[0], y: 1.1 + ri * 0.35, w: colW[0], h: 0.33, fill: { color: bg }, line: { color: C.lightBg, width: 1 } })
            slide.addText(label, { x: colX[0] + 0.05, y: 1.13 + ri * 0.35, w: colW[0] - 0.1, h: 0.27, fontSize: 8, color: C.gray, fontFace: "Calibri" })
          }
          slide.addShape("rect", { x: colX[ci + 1], y: 1.1 + ri * 0.35, w: colW[ci + 1], h: 0.33, fill: { color: bg }, line: { color: C.lightBg, width: 1 } })
          slide.addText(fn(y), { x: colX[ci + 1] + 0.02, y: 1.13 + ri * 0.35, w: colW[ci + 1] - 0.05, h: 0.27, fontSize: 8, bold: label.includes("EBITDA") || label.includes("FCF"), color: col, align: "center", fontFace: "Calibri" })
        })
      })
    }

    // ── Slide 5: Returns Analysis ─────────────────────────────────────────────
    {
      const slide = contentSlide(prs, "ANÁLISIS DE RETORNOS · Escenarios de Salida")
      const scenarios = [
        { s: bear,  label: "Bear 🐻",     color: C.red },
        { s: base,  label: "Base",        color: C.gold },
        { s: bull,  label: "Bull 🐂",     color: C.green },
        { s: strat, label: "Estratégico", color: "#A855F7" },
      ]

      scenarios.forEach(({ s, label, color }, i) => {
        const x = 0.2 + i * 2.45
        // Card
        slide.addShape("rect", { x, y: 0.8, w: 2.3, h: 2.7, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        // Header band
        slide.addShape("rect", { x, y: 0.8, w: 2.3, h: 0.4, fill: { color: C.navy }, line: { color: color, width: 2 } })
        slide.addText(label, { x, y: 0.84, w: 2.3, h: 0.32, fontSize: 10, bold: true, color: color, align: "center", fontFace: "Calibri" })

        const lines = [
          { l: "Múltiplo Salida", v: fmt.mult(s.exitMultiple), c: C.white },
          { l: "EV Salida",       v: fmt.eur(s.evAtExit),      c: C.white },
          { l: "Equity Salida",   v: fmt.eur(s.equityAtExit),  c: C.white },
          { l: "IRR",             v: fmt.pct(s.irr),           c: color },
          { l: "MOIC",            v: fmt.mult(s.moic),         c: color },
        ]
        lines.forEach(({ l, v, c }, li) => {
          slide.addText(l, { x: x + 0.1, y: 1.28 + li * 0.44, w: 1.0, h: 0.3, fontSize: 7.5, color: C.gray, fontFace: "Calibri" })
          slide.addText(v, { x: x + 1.1, y: 1.28 + li * 0.44, w: 1.1, h: 0.3, fontSize: 9,   bold: li >= 3, color: c, align: "right", fontFace: "Calibri" })
        })
      })

      // Value bridge
      slide.addText("VALUE BRIDGE — CASO BASE", { x: 0.2, y: 3.65, w: 5, h: 0.28, fontSize: 8, bold: true, color: C.gold, charSpacing: 2, fontFace: "Calibri" })
      const bridge = r.valueBridge.filter(v => v.color !== "total" && v.color !== "negative")
      const total = r.valueBridge.find(v => v.color === "total")
      const maxVal = Math.max(...bridge.map(b => Math.abs(b.value)))
      bridge.forEach((b, bi) => {
        const barW = maxVal > 0 ? (Math.abs(b.value) / maxVal) * 3.5 : 0
        slide.addShape("rect", { x: 2.8, y: 3.98 + bi * 0.38, w: barW, h: 0.3, fill: { color: C.green }, line: { color: C.green, width: 0 } })
        slide.addText(b.label, { x: 0.2, y: 3.98 + bi * 0.38, w: 2.55, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Calibri" })
        slide.addText(`+${fmt.eur(b.value)}`, { x: 6.4, y: 3.98 + bi * 0.38, w: 1.2, h: 0.3, fontSize: 8, bold: true, color: C.green, fontFace: "Calibri" })
      })
      if (total) {
        slide.addText(`Ganancia Total: +${fmt.eur(total.value)}`, { x: 0.2, y: 3.98 + bridge.length * 0.38, w: 7, h: 0.3, fontSize: 9, bold: true, color: C.gold, fontFace: "Calibri" })
      }
    }

    // ── Slide 6: Sensitivity ──────────────────────────────────────────────────
    {
      const slide = contentSlide(prs, "ANÁLISIS DE SENSIBILIDAD · IRR y MOIC")
      const exitMults = [10, 12, 14, 16, 18]
      const ebitdaMs  = [0.13, 0.15, 0.17, 0.19, 0.21]

      // IRR table
      slide.addText("IRR — Múlt. Salida × Margen EBITDA Y5", { x: 0.2, y: 0.75, w: 4.8, h: 0.3, fontSize: 9, bold: true, color: C.gold, fontFace: "Calibri" })

      // Header row
      const colStart = 0.2
      const cellW = 0.82
      const cellH = 0.33
      ebitdaMs.forEach((m, ci) => {
        slide.addShape("rect", { x: colStart + 0.85 + ci * cellW, y: 1.08, w: cellW, h: cellH, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        slide.addText(fmt.pct(m, 0), { x: colStart + 0.85 + ci * cellW, y: 1.11, w: cellW, h: cellH - 0.06, fontSize: 7, bold: true, color: C.gold, align: "center", fontFace: "Calibri" })
      })

      exitMults.forEach((em, ri) => {
        slide.addShape("rect", { x: colStart, y: 1.08 + (ri + 1) * cellH, w: 0.82, h: cellH, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        slide.addText(fmt.mult(em), { x: colStart, y: 1.11 + (ri + 1) * cellH, w: 0.82, h: cellH - 0.06, fontSize: 7, bold: true, color: C.gold, align: "center", fontFace: "Calibri" })

        ebitdaMs.forEach((m, ci) => {
          const cell = r.irrSensitivity.find(c => c.row === em && c.col === m)
          const irr  = cell?.irr ?? 0
          const bg   = irr >= 0.45 ? "064E3B" : irr >= 0.35 ? "065F46" : irr >= 0.25 ? "78350F" : "7F1D1D"
          const col  = irr >= 0.45 ? C.green : irr >= 0.35 ? C.green : irr >= 0.25 ? C.amber : C.red

          slide.addShape("rect", { x: colStart + 0.85 + ci * cellW, y: 1.08 + (ri + 1) * cellH, w: cellW, h: cellH, fill: { color: bg }, line: { color: C.lightBg, width: 1 } })
          slide.addText(fmt.pct(irr, 0), { x: colStart + 0.85 + ci * cellW, y: 1.11 + (ri + 1) * cellH, w: cellW, h: cellH - 0.06, fontSize: 8, bold: true, color: col, align: "center", fontFace: "Calibri" })
        })
      })

      // MOIC table (right side)
      const holdYrs   = [3, 4, 5, 6, 7]
      const rColStart = 5.35
      slide.addText("MOIC — Años Tenencia × Múlt. Salida", { x: rColStart, y: 0.75, w: 4.5, h: 0.3, fontSize: 9, bold: true, color: C.gold, fontFace: "Calibri" })

      exitMults.forEach((em, ci) => {
        slide.addShape("rect", { x: rColStart + 0.65 + ci * cellW, y: 1.08, w: cellW, h: cellH, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        slide.addText(fmt.mult(em), { x: rColStart + 0.65 + ci * cellW, y: 1.11, w: cellW, h: cellH - 0.06, fontSize: 7, bold: true, color: C.gold, align: "center", fontFace: "Calibri" })
      })

      holdYrs.forEach((hy, ri) => {
        slide.addShape("rect", { x: rColStart, y: 1.08 + (ri + 1) * cellH, w: 0.62, h: cellH, fill: { color: C.navyMid }, line: { color: C.lightBg, width: 1 } })
        slide.addText(`${hy}a`, { x: rColStart, y: 1.11 + (ri + 1) * cellH, w: 0.62, h: cellH - 0.06, fontSize: 7, bold: true, color: C.gold, align: "center", fontFace: "Calibri" })

        exitMults.forEach((em, ci) => {
          const cell = r.moicSensitivity.find(c => c.row === hy && c.col === em)
          const moic = cell?.moic ?? 0
          const bg   = moic >= 5 ? "064E3B" : moic >= 3.5 ? "065F46" : moic >= 2.5 ? "78350F" : "7F1D1D"
          const col  = moic >= 5 ? C.green : moic >= 3.5 ? C.green : moic >= 2.5 ? C.amber : C.red

          slide.addShape("rect", { x: rColStart + 0.65 + ci * cellW, y: 1.08 + (ri + 1) * cellH, w: cellW, h: cellH, fill: { color: bg }, line: { color: C.lightBg, width: 1 } })
          slide.addText(fmt.mult(moic, 1), { x: rColStart + 0.65 + ci * cellW, y: 1.11 + (ri + 1) * cellH, w: cellW, h: cellH - 0.06, fontSize: 8, bold: true, color: col, align: "center", fontFace: "Calibri" })
        })
      })

      // Disclaimer
      slide.addText(`Generado por DeepLBO · ${date} · Confidencial`, {
        x: 0.2, y: 5.2, w: 9.5, h: 0.3, fontSize: 7, color: C.gray, align: "center", fontFace: "Calibri"
      })
    }

    // ── Generate and return ───────────────────────────────────────────────────
    const buffer = await prs.write({ outputType: "arraybuffer" }) as ArrayBuffer
    const filename = `DeepLBO_${(inputs.companyName || analysisName).replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pptx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[pptx]", err)
    return NextResponse.json({ error: "Error generando PPTX" }, { status: 500 })
  }
}
