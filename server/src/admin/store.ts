import fs from 'node:fs/promises'
import path from 'node:path'
import type { AdminDb } from './types.js'
import { hydrateSeed } from './seed.js'

const emptyDb: AdminDb = {
  trends: [],
  trendClusters: [],
  localAssets: [],
  challenges: [],
  safetyReviews: [],
  localMatches: [],
  proposals: [],
  userEvents: [],
  analyticsSnapshots: [],
  impactReports: [],
  aiRuns: [],
}

export class AdminStore {
  private db: AdminDb | null = null

  constructor(private readonly filePath = path.resolve('data/admin-db.json')) {}

  async read(): Promise<AdminDb> {
    if (this.db) return this.db
    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      this.db = hydrateSeed({ ...emptyDb, ...JSON.parse(raw) })
    } catch {
      this.db = hydrateSeed(structuredClone(emptyDb))
      await this.write(this.db)
    }
    return this.db
  }

  async write(db = this.db): Promise<void> {
    if (!db) return
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    await fs.writeFile(this.filePath, JSON.stringify(db, null, 2))
    this.db = db
  }

  async mutate(mutator: (db: AdminDb) => void | Promise<void>): Promise<AdminDb> {
    const db = await this.read()
    await mutator(db)
    await this.write(db)
    return db
  }
}

export const adminStore = new AdminStore()
