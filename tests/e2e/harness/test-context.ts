/**
 * TestContext Manager for E2E Test Suites
 * Sets up isolated database, API client, WebSocket simulator, and seed fixtures.
 */

import { InMemoryDatabase } from './database-client.ts';
import { ApiClient } from './api-client.ts';
import { WebSocketClientSimulator } from './websocket-client.ts';
import { loadSeedFixtures } from './seed-loader.ts';
import type { SeedData } from './seed-loader.ts';

export class TestContext {
  public db: InMemoryDatabase;
  public api: ApiClient;
  public ws: WebSocketClientSimulator;
  public seeds!: SeedData;

  constructor() {
    this.db = new InMemoryDatabase();
    this.api = new ApiClient(this.db);
    this.ws = new WebSocketClientSimulator(this.db);
  }

  public reset(): void {
    this.db.reset();
    this.api.setAuthToken(null);
    this.ws.disconnect();
    this.seeds = loadSeedFixtures(this.db);
  }

  public asAdmin(): void {
    this.api.setAuthToken(this.seeds.admin.token);
  }

  public asVerifiedBusiness(): void {
    this.api.setAuthToken(this.seeds.businessVerified.token);
  }

  public asUnverifiedBusiness(): void {
    this.api.setAuthToken(this.seeds.businessUnverified.token);
  }

  public asVerifiedCreator(): void {
    this.api.setAuthToken(this.seeds.creatorVerified.token);
  }

  public asUnverifiedCreator(): void {
    this.api.setAuthToken(this.seeds.creatorUnverified.token);
  }

  public asAnonymous(): void {
    this.api.setAuthToken(null);
  }
}
