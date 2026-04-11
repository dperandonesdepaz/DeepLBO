import type { LBOInputs, LBOResults } from "@/types/lbo"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct = (v: number) => `${(v * 100).toFixed(1)}%`
const eur = (v: number, dec = 1) => `€${v.toFixed(dec)}M`
const x   = (v: number, dec = 1) => `${v.toFixed(dec)}x`
const yr  = (i: number) => `Año ${i}`

// ─── EXCEL ────────────────────────────────────────────────────────────────────
export async function exportLBOExcel(inputs: LBOInputs, results: LBOResults, analysisName: string) {
  const XLSX = await import("xlsx")

  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  const baseScenario = results.scenarios.find(s => s.scenario === "Base") ?? results.scenarios[0]
  const summaryData = [
    ["DeepLBO — Resumen del Análisis LBO"],
    [analysisName, "", "", new Date().toLocaleDateString("es-ES")],
    [],
    ["ENTRADA"],
    ["Empresa", inputs.companyName],
    ["Sector", inputs.sector],
    ["Año transacción", inputs.transactionYear],
    [],
    ["Revenue LTM (€M)", inputs.revenue],
    ["EBITDA LTM (€M)", inputs.ebitda],
    ["Margen EBITDA", pct(inputs.ebitda / inputs.revenue)],
    ["Deuda neta (€M)", inputs.netDebt],
    [],
    ["Múltiplo entrada (x EBITDA)", inputs.entryMultiple],
    ["EV entrada (€M)", results.ev],
    ["Equity invertido (€M)", results.totalEquityInvested],
    ["Deuda senior (€M)", results.seniorDebt],
    ["Leverage (Deuda/EBITDA)", results.debtOverEbitda.toFixed(1) + "x"],
    ["Cobertura intereses (EBITDA/Int)", results.interestCoverage.toFixed(1) + "x"],
    [],
    ["RETORNOS — CASO BASE"],
    ["MOIC", baseScenario.moic.toFixed(2) + "x"],
    ["IRR", pct(baseScenario.irr)],
    ["EV salida (€M)", baseScenario.evAtExit],
    ["Equity en salida (€M)", baseScenario.equityAtExit],
    ["Período de hold (años)", inputs.holdPeriod],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen")

  // ── Sheet 2: P&L ────────────────────────────────────────────────────────────
  const plHeader = ["Métrica", "Entrada", ...results.yearly.slice(1).map(y => yr(y.year))]
  const entry = results.yearly[0]
  const years = results.yearly.slice(1)
  const plRows = [
    plHeader,
    ["Revenue (€M)", entry.revenue, ...years.map(y => y.revenue)],
    ["Crecimiento revenue", "—", ...years.map(y => y.revenueGrowth ? pct(y.revenueGrowth) : "—")],
    ["EBITDA (€M)", entry.ebitda, ...years.map(y => y.ebitda)],
    ["Margen EBITDA", pct(entry.ebitdaMargin), ...years.map(y => pct(y.ebitdaMargin))],
    ["D&A (€M)", entry.da, ...years.map(y => y.da)],
    ["EBIT (€M)", entry.ebit, ...years.map(y => y.ebit)],
    ["Intereses (€M)", entry.interest, ...years.map(y => y.interest)],
    ["EBT (€M)", entry.ebt, ...years.map(y => y.ebt)],
    ["Impuestos (€M)", entry.taxes, ...years.map(y => y.taxes)],
    ["Beneficio neto (€M)", entry.netIncome, ...years.map(y => y.netIncome)],
    [],
    ["Capex (€M)", entry.capex, ...years.map(y => y.capex)],
    ["ΔWC (€M)", entry.wcChange, ...years.map(y => y.wcChange)],
    ["FCF antes deuda (€M)", entry.fcfBeforeDebt, ...years.map(y => y.fcfBeforeDebt)],
    ["Amortización deuda (€M)", entry.debtAmort, ...years.map(y => y.debtAmort)],
    ["FCF to equity (€M)", entry.fcfToEquity, ...years.map(y => y.fcfToEquity)],
  ]
  const wsPlRows = plRows.map(row =>
    row.map(cell => typeof cell === "number" ? parseFloat(cell.toFixed(2)) : cell)
  )
  const wsPL = XLSX.utils.aoa_to_sheet(wsPlRows)
  wsPL["!cols"] = [{ wch: 28 }, ...Array(years.length + 1).fill({ wch: 12 })]
  XLSX.utils.book_append_sheet(wb, wsPL, "P&L Proyecciones")

  // ── Sheet 3: Debt Schedule ───────────────────────────────────────────────────
  const debtHeader = ["Año", "Saldo inicial (€M)", "Amortización (€M)", "Saldo final (€M)", "Intereses (€M)", "Deuda/EBITDA", "EBITDA/Intereses"]
  const debtRows = [
    debtHeader,
    ...results.debtSchedule.map(d => [
      yr(d.year),
      parseFloat(d.openingBalance.toFixed(2)),
      parseFloat(d.amortization.toFixed(2)),
      parseFloat(d.closingBalance.toFixed(2)),
      parseFloat(d.interest.toFixed(2)),
      parseFloat(d.leverageRatio.toFixed(2)),
      parseFloat(d.coverageRatio.toFixed(2)),
    ]),
  ]
  const wsDebt = XLSX.utils.aoa_to_sheet(debtRows)
  wsDebt["!cols"] = [{ wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsDebt, "Deuda")

  // ── Sheet 4: Exit Scenarios ──────────────────────────────────────────────────
  const exitHeader = ["Escenario", "Múltiplo salida", "EBITDA salida (€M)", "EV salida (€M)", "Deuda salida (€M)", "Equity salida (€M)", "MOIC", "IRR"]
  const exitRows = [
    exitHeader,
    ...results.scenarios.map(s => [
      s.scenario,
      parseFloat(s.exitMultiple.toFixed(1)),
      parseFloat(s.ebitdaAtExit.toFixed(2)),
      parseFloat(s.evAtExit.toFixed(2)),
      parseFloat(s.debtAtExit.toFixed(2)),
      parseFloat(s.equityAtExit.toFixed(2)),
      parseFloat(s.moic.toFixed(2)),
      pct(s.irr),
    ]),
  ]
  const wsExit = XLSX.utils.aoa_to_sheet(exitRows)
  wsExit["!cols"] = [{ wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsExit, "Escenarios Salida")

  // ── Sheet 5: Sensitivity ─────────────────────────────────────────────────────
  // IRR sensitivity: rows = exit multiples, cols = EBITDA margin Y5
  if (results.irrSensitivity.length > 0) {
    const rowVals = [...new Set(results.irrSensitivity.map(c => c.row))].sort((a, b) => a - b)
    const colVals = [...new Set(results.irrSensitivity.map(c => c.col))].sort((a, b) => a - b)
    const sensHeader = ["Múltiplo \\ Margen EBITDA Y5", ...colVals.map(c => pct(c))]
    const sensRows = rowVals.map(rv => {
      const row: (string | number)[] = [`${rv.toFixed(1)}x`]
      colVals.forEach(cv => {
        const cell = results.irrSensitivity.find(c => c.row === rv && c.col === cv)
        row.push(cell?.irr != null ? pct(cell.irr) : "—")
      })
      return row
    })
    const wsSens = XLSX.utils.aoa_to_sheet([sensHeader, ...sensRows])
    wsSens["!cols"] = [{ wch: 28 }, ...colVals.map(() => ({ wch: 10 }))]
    XLSX.utils.book_append_sheet(wb, wsSens, "Sensibilidad IRR")
  }

  // ── Sheet 6: Inputs ──────────────────────────────────────────────────────────
  const inputsData = [
    ["INPUTS — " + analysisName],
    [],
    ["Perfil empresa"],
    ["Nombre empresa", inputs.companyName],
    ["Sector", inputs.sector],
    ["Año transacción", inputs.transactionYear],
    [],
    ["Financieros LTM"],
    ["Revenue (€M)", inputs.revenue],
    ["EBITDA (€M)", inputs.ebitda],
    ["D&A (€M)", inputs.da],
    ["Deuda neta (€M)", inputs.netDebt],
    ["Caja (€M)", inputs.cash],
    [],
    ["Valoración entrada"],
    ["Múltiplo EBITDA entrada", inputs.entryMultiple],
    ["Comisiones (%)", pct(inputs.feesPct)],
    [],
    ["Estructura capital"],
    ["Leverage (x EBITDA)", inputs.leverage],
    ["Tipo interés (%)", pct(inputs.interestRate)],
    ["Amortización Y1-Y5 (€M)", inputs.amortization.join(", ")],
    [],
    ["Proyecciones (Y1–Y5)"],
    ["Crecimiento revenue (%)", inputs.revenueGrowth.map(v => pct(v)).join(", ")],
    ["Margen EBITDA (%)", inputs.ebitdaMargin.map(v => pct(v)).join(", ")],
    ["D&A % revenue", inputs.daPct.map(v => pct(v)).join(", ")],
    ["Capex % revenue", inputs.capexPct.map(v => pct(v)).join(", ")],
    ["ΔWC (€M)", inputs.wcChange.join(", ")],
    [],
    ["Impuestos y salida"],
    ["Tipo impositivo (%)", pct(inputs.taxRate)],
    ["Múltiplo salida Bear", inputs.exitMultiples.bear],
    ["Múltiplo salida Base", inputs.exitMultiples.base],
    ["Múltiplo salida Bull", inputs.exitMultiples.bull],
    ["Múltiplo salida Strategic", inputs.exitMultiples.strategic],
    ["Período hold (años)", inputs.holdPeriod],
  ]
  const wsInputs = XLSX.utils.aoa_to_sheet(inputsData)
  wsInputs["!cols"] = [{ wch: 28 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(wb, wsInputs, "Inputs")

  // ── Download ─────────────────────────────────────────────────────────────────
  const filename = `DeepLBO_${analysisName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
export async function exportLBOPdf(inputs: LBOInputs, results: LBOResults, analysisName: string) {
  const { jsPDF } = await import("jspdf")

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const W = 210
  const MARGIN = 18
  const COL = W - MARGIN * 2
  let y = 0

  // ── Colours / helpers ──────────────────────────────────────────────────────
  const NAVY  = [15, 32, 68]   as [number,number,number]
  const BLUE  = [37, 99, 235]  as [number,number,number]
  const GOLD  = [212, 160, 23] as [number,number,number]
  const WHITE = [255,255,255]  as [number,number,number]
  const LIGHT = [245,247,250]  as [number,number,number]
  const DARK  = [30, 30, 40]   as [number,number,number]
  const MUTED = [110,110,130]  as [number,number,number]

  function newPage() {
    doc.addPage()
    y = MARGIN
    // header stripe
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, W, 10, "F")
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text("DeepLBO — Análisis LBO Confidencial", MARGIN, 6.5)
    doc.text(analysisName, W - MARGIN, 6.5, { align: "right" })
    y = 16
  }

  function sectionTitle(title: string) {
    if (y > 260) newPage()
    doc.setFillColor(...BLUE)
    doc.rect(MARGIN, y, COL, 7, "F")
    doc.setTextColor(...WHITE)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(title.toUpperCase(), MARGIN + 3, y + 5)
    y += 10
  }

  function row2col(label: string, value: string, shade = false) {
    if (y > 272) newPage()
    if (shade) { doc.setFillColor(...LIGHT); doc.rect(MARGIN, y, COL, 6, "F") }
    doc.setTextColor(...MUTED); doc.setFontSize(8); doc.setFont("helvetica", "normal")
    doc.text(label, MARGIN + 2, y + 4)
    doc.setTextColor(...DARK); doc.setFont("helvetica", "bold")
    doc.text(value, MARGIN + COL - 2, y + 4, { align: "right" })
    y += 6
  }

  function tableRow(cells: string[], widths: number[], bold = false, bg?: [number,number,number]) {
    if (y > 272) newPage()
    if (bg) { doc.setFillColor(...bg); doc.rect(MARGIN, y, COL, 6.5, "F") }
    doc.setFontSize(7.5)
    doc.setFont("helvetica", bold ? "bold" : "normal")
    let x = MARGIN
    cells.forEach((cell, i) => {
      doc.setTextColor(...(bold ? NAVY : DARK))
      const align = i === 0 ? "left" : "right"
      doc.text(cell, align === "left" ? x + 1.5 : x + widths[i] - 1.5, y + 4.5, { align })
      x += widths[i]
    })
    y += 6.5
  }

  // ── COVER PAGE ────────────────────────────────────────────────────────────
  // Navy header block
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 80, "F")
  doc.setFillColor(...GOLD)
  doc.rect(0, 80, W, 2, "F")

  doc.setTextColor(...WHITE)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("ANÁLISIS LBO CONFIDENCIAL", MARGIN, 30)

  doc.setFontSize(26)
  doc.setFont("helvetica", "bold")
  doc.text(analysisName || "Análisis LBO", MARGIN, 45, { maxWidth: COL })

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(inputs.companyName || "", MARGIN, 57)
  doc.text(inputs.sector || "", MARGIN, 64)

  doc.setFontSize(8)
  doc.setTextColor(...GOLD)
  doc.text(`Generado por DeepLBO · ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`, MARGIN, 75)

  // Key metrics boxes on cover
  const baseScenario = results.scenarios.find(s => s.scenario === "Base") ?? results.scenarios[0]
  const coverMetrics = [
    { label: "EV Entrada", value: eur(results.ev) },
    { label: "Equity Invertido", value: eur(results.totalEquityInvested) },
    { label: "MOIC Base", value: x(baseScenario.moic) },
    { label: "IRR Base", value: pct(baseScenario.irr) },
  ]
  const boxW = COL / 4
  coverMetrics.forEach((m, i) => {
    const bx = MARGIN + i * boxW
    doc.setFillColor(...WHITE)
    doc.roundedRect(bx + 1, 92, boxW - 2, 22, 2, 2, "F")
    doc.setTextColor(...NAVY)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(m.value, bx + boxW / 2, 108, { align: "center" })
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...MUTED)
    doc.text(m.label.toUpperCase(), bx + boxW / 2, 102, { align: "center" })
  })

  y = 126

  // ── SECTION 1: ENTRADA ───────────────────────────────────────────────────
  sectionTitle("1. Parámetros de entrada")
  const entryPairs: [string, string][] = [
    ["Empresa", inputs.companyName],
    ["Sector", inputs.sector],
    ["Revenue LTM", eur(inputs.revenue)],
    ["EBITDA LTM", `${eur(inputs.ebitda)} (${pct(inputs.ebitda / inputs.revenue)})`],
    ["Deuda neta", eur(inputs.netDebt)],
    ["Múltiplo entrada", x(inputs.entryMultiple)],
    ["Enterprise Value", eur(results.ev)],
    ["Equity invertido", eur(results.totalEquityInvested)],
    ["Deuda senior", eur(results.seniorDebt)],
    ["Leverage Deuda/EBITDA", x(results.debtOverEbitda)],
    ["Cobertura intereses", x(results.interestCoverage)],
  ]
  entryPairs.forEach(([label, value], i) => row2col(label, value, i % 2 === 0))
  y += 4

  // ── SECTION 2: P&L PROYECCIONES ──────────────────────────────────────────
  newPage()
  sectionTitle("2. P&L y FCF proyectados")
  const years = results.yearly.slice(1)
  const colW = [44, ...Array(years.length).fill((COL - 44) / years.length)] as number[]
  tableRow(["Métrica", ...years.map(y => `Año ${y.year}`)], colW, true, WHITE)
  doc.setDrawColor(220, 220, 230)
  doc.line(MARGIN, y, MARGIN + COL, y); y += 1
  const plLines: [string, (v: typeof years[0]) => string][] = [
    ["Revenue (€M)", y => y.revenue.toFixed(1)],
    ["Crecimiento (%)", y => y.revenueGrowth ? pct(y.revenueGrowth) : "—"],
    ["EBITDA (€M)", y => y.ebitda.toFixed(1)],
    ["Margen EBITDA (%)", y => pct(y.ebitdaMargin)],
    ["EBIT (€M)", y => y.ebit.toFixed(1)],
    ["Intereses (€M)", y => y.interest.toFixed(1)],
    ["Beneficio neto (€M)", y => y.netIncome.toFixed(1)],
    ["Capex (€M)", y => y.capex.toFixed(1)],
    ["FCF antes deuda (€M)", y => y.fcfBeforeDebt.toFixed(1)],
    ["FCF to equity (€M)", y => y.fcfToEquity.toFixed(1)],
  ]
  plLines.forEach(([label, fn], i) =>
    tableRow([label, ...years.map(fn)], colW, false, i % 2 === 0 ? LIGHT : WHITE)
  )
  y += 4

  // ── SECTION 3: DEUDA ─────────────────────────────────────────────────────
  sectionTitle("3. Schedule de deuda")
  const debtColW = [22, 30, 30, 28, 28, 24, 30] as number[]
  tableRow(["Año", "Saldo ini. (€M)", "Amort. (€M)", "Saldo fin. (€M)", "Interés (€M)", "Deuda/EBIT.", "EBITDA/Int."], debtColW, true, WHITE)
  doc.line(MARGIN, y, MARGIN + COL, y); y += 1
  results.debtSchedule.forEach((d, i) =>
    tableRow([
      `Año ${d.year}`,
      d.openingBalance.toFixed(1),
      d.amortization.toFixed(1),
      d.closingBalance.toFixed(1),
      d.interest.toFixed(1),
      d.leverageRatio.toFixed(1) + "x",
      d.coverageRatio.toFixed(1) + "x",
    ], debtColW, false, i % 2 === 0 ? LIGHT : WHITE)
  )
  y += 4

  // ── SECTION 4: ESCENARIOS DE SALIDA ──────────────────────────────────────
  if (y > 220) newPage()
  sectionTitle("4. Escenarios de salida")
  const exitColW = [30, 28, 32, 28, 30, 26] as number[]
  tableRow(["Escenario", "Múlt. salida", "EV salida (€M)", "Equity (€M)", "MOIC", "IRR"], exitColW, true, WHITE)
  doc.line(MARGIN, y, MARGIN + COL, y); y += 1
  results.scenarios.forEach((s, i) => {
    const isBase = s.scenario === "Base"
    tableRow([
      s.scenario,
      x(s.exitMultiple),
      s.evAtExit.toFixed(1),
      s.equityAtExit.toFixed(1),
      x(s.moic),
      pct(s.irr),
    ], exitColW, isBase, isBase ? [230, 240, 255] : i % 2 === 0 ? LIGHT : WHITE)
  })
  y += 4

  // ── SECTION 5: SENSIBILIDAD ───────────────────────────────────────────────
  if (results.irrSensitivity.length > 0) {
    if (y > 200) newPage()
    sectionTitle("5. Análisis de sensibilidad — IRR (Múltiplo salida × Margen EBITDA Y5)")
    const rowVals = [...new Set(results.irrSensitivity.map(c => c.row))].sort((a, b) => a - b)
    const colVals = [...new Set(results.irrSensitivity.map(c => c.col))].sort((a, b) => a - b)
    const sensColW = [28, ...colVals.map(() => (COL - 28) / colVals.length)] as number[]
    tableRow(["Múlt. \\ Margen", ...colVals.map(c => pct(c))], sensColW, true, WHITE)
    doc.line(MARGIN, y, MARGIN + COL, y); y += 1
    rowVals.forEach((rv, i) => {
      const cells = [x(rv), ...colVals.map(cv => {
        const cell = results.irrSensitivity.find(c => c.row === rv && c.col === cv)
        return cell?.irr != null ? pct(cell.irr) : "—"
      })]
      tableRow(cells, sensColW, false, i % 2 === 0 ? LIGHT : WHITE)
    })
    y += 4
  }

  // ── DISCLAIMER ───────────────────────────────────────────────────────────
  if (y > 255) newPage()
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.setFont("helvetica", "italic")
  doc.text(
    "Este documento ha sido generado con fines informativos por DeepLBO. Las proyecciones y análisis no constituyen asesoramiento financiero, de inversión ni jurídico. Realiza tu propia due diligence antes de tomar cualquier decisión de inversión.",
    MARGIN, y + 5, { maxWidth: COL }
  )

  // ── PAGE NUMBERS ─────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.setFont("helvetica", "normal")
    doc.text(`${i} / ${totalPages}`, W - MARGIN, 290, { align: "right" })
  }

  const filename = `DeepLBO_${analysisName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
