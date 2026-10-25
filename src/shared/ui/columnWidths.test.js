import { describe, expect, it } from 'vitest'
import { initialColumnWidths, resizeColumnWidths } from './columnWidths'

describe('column widths', () => {
  it('makes the first column the largest and the rest equal', () => {
    const widths = initialColumnWidths(600, [2, 1, 1, 1, 1], [40, 40, 40, 40, 40])

    expect(widths[0]).toBe(200)
    expect(widths.slice(1)).toEqual([100, 100, 100, 100])
  })

  it('does not shrink other columns below their titles while growing one column', () => {
    const mins = [80, 90, 70, 60, 80]
    const start = [200, 100, 100, 100, 100]
    const grown = resizeColumnWidths(start, mins, 0, 500)

    expect(grown[0]).toBe(600 - mins.slice(1).reduce((sum, min) => sum + min, 0))
    expect(grown[1]).toBeGreaterThanOrEqual(mins[1])
    expect(grown[2]).toBeGreaterThanOrEqual(mins[2])
    expect(grown[3]).toBeGreaterThanOrEqual(mins[3])
    expect(grown[4]).toBeGreaterThanOrEqual(mins[4])
    expect(sum(grown)).toBe(600)
  })

  it('fits the table to the container and keeps every column at least as wide as its title', () => {
    const mins = [50, 120, 40, 40, 40]
    const widths = initialColumnWidths(500, [2, 1, 1, 1, 1], mins)

    expect(sum(widths)).toBe(500)
    widths.forEach((width, index) => {
      expect(width).toBeGreaterThanOrEqual(mins[index])
    })
    expect(widths[0]).toBeGreaterThan(widths[2])
  })

  it('shrinks the right neighbor first and then the following columns', () => {
    const mins = [40, 40, 40, 40, 40]
    const start = [200, 100, 100, 100, 100]

    expect(resizeColumnWidths(start, mins, 2, 30)).toEqual([200, 100, 130, 70, 100])
    expect(resizeColumnWidths(start, mins, 2, 80)).toEqual([200, 100, 180, 40, 80])
  })

  it('shrinks columns to the left in order when the divider moves left', () => {
    const mins = [40, 40, 40, 40, 40]
    const start = [200, 100, 100, 100, 100]

    expect(resizeColumnWidths(start, mins, 2, -30)).toEqual([200, 100, 70, 130, 100])
    expect(resizeColumnWidths(start, mins, 2, -150)).toEqual([170, 40, 40, 250, 100])
  })

  it('resizes an edge column only inward', () => {
    const mins = [40, 40, 40, 40, 40]
    const start = [200, 100, 100, 100, 100]

    expect(resizeColumnWidths(start, mins, 0, -500)).toEqual([40, 260, 100, 100, 100])
    expect(resizeColumnWidths(start, mins, 3, 500)).toEqual([200, 100, 100, 160, 40])
    expect(resizeColumnWidths(start, mins, 3, -200)).toEqual([180, 40, 40, 40, 300])
  })

  it('does not shrink the dragged column below its own title', () => {
    const mins = [120, 80, 80, 80, 80]
    const start = [200, 100, 100, 100, 100]
    const shrunk = resizeColumnWidths(start, mins, 0, -500)

    expect(shrunk[0]).toBe(120)
    expect(sum(shrunk)).toBe(600)
    shrunk.forEach((width, index) => {
      expect(width).toBeGreaterThanOrEqual(mins[index])
    })
  })
})

function sum(values) {
  return Math.round(values.reduce((total, value) => total + value, 0))
}
