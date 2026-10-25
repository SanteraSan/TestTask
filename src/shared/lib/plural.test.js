import { describe, expect, it } from 'vitest'
import { countLabel } from './plural'

describe('countLabel', () => {
  it('uses Russian endings for manufacturers and offers', () => {
    expect(countLabel(1, 'производитель', 'производителя', 'производителей')).toBe('1 производитель')
    expect(countLabel(2, 'производитель', 'производителя', 'производителей')).toBe('2 производителя')
    expect(countLabel(5, 'производитель', 'производителя', 'производителей')).toBe('5 производителей')
    expect(countLabel(11, 'предложение', 'предложения', 'предложений')).toBe('11 предложений')
    expect(countLabel(21, 'предложение', 'предложения', 'предложений')).toBe('21 предложение')
    expect(countLabel(22, 'предложение', 'предложения', 'предложений')).toBe('22 предложения')
  })
})
