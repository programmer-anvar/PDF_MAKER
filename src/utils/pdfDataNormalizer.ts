/**
 * Flat keylardan list yig'adi (masalan gaseousList[0].pollutantName → gaseousList massiv).
 */
export function buildListFromFlatKeys(
  flat: Record<string, string>,
  listKey: string
): Record<string, unknown>[] {
  const list: Record<string, unknown>[] = []
  const escaped = listKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^${escaped}\\[(\\d+)\\]\\.(.+)$`)
  for (const [k, v] of Object.entries(flat)) {
    const match = k.match(re)
    if (!match) continue
    const idx = parseInt(match[1], 10)
    const field = match[2]
    while (list.length <= idx) list.push({})
    list[idx][field] = v
  }
  return list
}

export function normalizeSamplingDataForPdf(flat: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...flat }
  const gaseousList = buildListFromFlatKeys(flat, 'gaseousList')
  if (gaseousList.length > 0) out.gaseousList = gaseousList
  return out
}
