export function initialColumnWidths(total, weights, mins) {
  const minTotal = mins.reduce((sum, min) => sum + min, 0)
  const safeTotal = Math.max(total, minTotal)
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  const raw = weights.map((weight) => (safeTotal * weight) / weightSum)
  return fitToTotal(raw, mins, safeTotal)
}

export function scaleColumnWidths(widths, mins, total) {
  const minTotal = mins.reduce((sum, min) => sum + min, 0)
  return fitToTotal(widths, mins, Math.max(total, minTotal))
}

export function resizeColumnWidths(widths, mins, index, delta) {
  const next = widths.slice()
  if (delta > 0) {
    transferWidth(next, mins, index, delta, 1)
  } else if (delta < 0 && index + 1 < next.length) {
    transferWidth(next, mins, index + 1, -delta, -1)
  }
  return next.map((width) => roundWidth(width))
}

function transferWidth(widths, mins, growIndex, amount, direction) {
  let remaining = amount
  let donor = growIndex + direction
  while (remaining > 0 && donor >= 0 && donor < widths.length) {
    const available = widths[donor] - mins[donor]
    const take = Math.min(Math.max(available, 0), remaining)
    widths[donor] -= take
    widths[growIndex] += take
    remaining -= take
    donor += direction
  }
}

function fitToTotal(raw, mins, total) {
  const next = raw.map((width, index) => Math.max(width, mins[index]))
  let overflow = next.reduce((sum, width) => sum + width, 0) - total

  if (overflow > 0) {
    const spare = next.map((width, index) => width - mins[index])
    const spareTotal = spare.reduce((sum, value) => sum + value, 0)
    if (spareTotal > 0) {
      next.forEach((_, index) => {
        next[index] -= overflow * (spare[index] / spareTotal)
      })
    }
  } else if (overflow < 0) {
    const sum = next.reduce((totalWidth, width) => totalWidth + width, 0)
    next.forEach((width, index) => {
      next[index] = width + (-overflow * width) / sum
    })
  }

  const drift = total - next.reduce((sum, width) => sum + width, 0)
  const largestIndex = next.reduce((best, width, index) => (width > next[best] ? index : best), 0)
  next[largestIndex] += drift
  return next.map((width) => roundWidth(width))
}

function roundWidth(value) {
  return Math.round(value * 100) / 100
}
