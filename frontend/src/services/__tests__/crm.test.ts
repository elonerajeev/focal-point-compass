import { describe, it, expect, beforeAll, vi } from 'vitest'
import { crmService } from '@/services/crm'
import * as apiClient from '@/lib/api-client'

describe('CRM Service', () => {
  beforeAll(() => {
    vi.stubEnv('VITE_USE_REMOTE_API', 'false')
  })
  
  it('returns dashboard data with correct structure', async () => {
    const dashboard = await crmService.getDashboard()
    
    expect(dashboard).toHaveProperty('metrics')
    expect(dashboard).toHaveProperty('revenueSeries')
    expect(dashboard).toHaveProperty('pipelineBreakdown')
    expect(dashboard).toHaveProperty('operatingCadence')
    expect(dashboard).toHaveProperty('activityFeed')
    expect(dashboard).toHaveProperty('todayFocus')
    expect(dashboard).toHaveProperty('executionReadiness')
    expect(dashboard).toHaveProperty('collaborators')
  })

  it('returns metrics with required fields', async () => {
    const dashboard = await crmService.getDashboard()
    
    dashboard.metrics.forEach(metric => {
      expect(metric).toHaveProperty('label')
      expect(metric).toHaveProperty('value')
      expect(metric).toHaveProperty('change')
      expect(metric).toHaveProperty('direction')
      expect(metric).toHaveProperty('detail')
    })
  })

  it('returns clients data', async () => {
    const clients = await crmService.getClients()
    
    expect(Array.isArray(clients)).toBe(true)
    expect(clients.length).toBeGreaterThan(0)
    
    clients.forEach(client => {
      expect(client).toHaveProperty('id')
      expect(client).toHaveProperty('name')
      expect(client).toHaveProperty('status')
    })
  })

  it('simulates network latency', async () => {
    const start = Date.now()
    await crmService.getClients()
    const end = Date.now()
    
    // Should take at least 100ms due to simulated latency
    expect(end - start).toBeGreaterThanOrEqual(100)
  })

  it('returns consistent data structure for tasks', async () => {
    const tasks = await crmService.getTasks()
    
    expect(tasks).toHaveProperty('todo')
    expect(tasks).toHaveProperty('in-progress')
    expect(tasks).toHaveProperty('done')
    
    Object.values(tasks).forEach(taskList => {
      expect(Array.isArray(taskList)).toBe(true)
    })
  })

  it('updates a task without deleting it when column is unchanged', async () => {
    const initial = await crmService.getTasks()
    const beforeCount = Object.values(initial).flat().length
    const firstNonEmptyColumn = Object.entries(initial).find(([, items]) => items.length > 0)

    expect(firstNonEmptyColumn).toBeDefined()
    const sourceTask = firstNonEmptyColumn![1][0]
    const updatedTitle = `${sourceTask.title} (updated)`

    await crmService.updateTask(sourceTask.id, { title: updatedTitle })
    const after = await crmService.getTasks()
    const afterCount = Object.values(after).flat().length
    const updatedTask = Object.values(after).flat().find((task) => task.id === sourceTask.id)

    expect(afterCount).toBe(beforeCount)
    expect(updatedTask).toBeDefined()
    expect(updatedTask?.title).toBe(updatedTitle)
  })

  it('normalizes paginated list payloads from remote api into arrays', async () => {
    const remoteEnabledSpy = vi.spyOn(apiClient, 'isRemoteApiEnabled').mockReturnValue(true)
    const requestJsonSpy = vi.spyOn(apiClient, 'requestJson')
      .mockResolvedValueOnce({ data: [{ id: 1 }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } as never)
      .mockResolvedValueOnce({ data: [{ id: 2 }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } as never)
      .mockResolvedValueOnce({ data: [{ id: 'INV-1' }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } as never)
      .mockResolvedValueOnce({ data: [{ id: 3 }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } as never)
      .mockResolvedValueOnce({ data: [{ id: 4 }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } as never)

    await expect(crmService.getClients()).resolves.toEqual([{ id: 1 }])
    await expect(crmService.getProjects()).resolves.toEqual([{ id: 2 }])
    await expect(crmService.getInvoices()).resolves.toEqual([{ id: 'INV-1' }])
    await expect(crmService.getTeamMembers()).resolves.toEqual([{ id: 3 }])
    await expect(crmService.getAttendance()).resolves.toEqual([{ id: 4 }])

    remoteEnabledSpy.mockRestore()
    requestJsonSpy.mockRestore()
  })
})
