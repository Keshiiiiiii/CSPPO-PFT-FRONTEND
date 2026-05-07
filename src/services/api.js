/**
 * API Barrel — re-exports all service functions.
 *
 * All import sites across the app continue to use:
 *   import { ... } from '@/services/api.js'
 * with zero changes needed.
 *
 * Domain modules:
 *   authService   — login, signup, account info
 *   officerService — officer personal record CRUD
 *   adminService  — admin record management & summaries
 *   legacyService — /users and /accounts legacy endpoints
 */
export * from './authService.js'
export * from './officerService.js'
export * from './adminService.js'
export * from './legacyService.js'