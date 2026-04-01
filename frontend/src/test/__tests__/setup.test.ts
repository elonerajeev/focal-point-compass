import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should run tests successfully', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should work with objects', () => {
    const obj = { name: 'CRM App', version: '1.0.0' }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('CRM App')
  })
})
