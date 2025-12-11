/**
 * Metric Service
 *
 * Provides functions for interacting with metric-related API endpoints.
 * Handles CRUD operations for student metrics and progress tracking.
 */

import api from './api';
import type { Metric, MetricCreate } from '../types/metric';

/**
 * Create a new metric
 * POST /api/v1/metrics/
 */
export async function createMetric(metricData: MetricCreate): Promise<Metric> {
  return await api.post('/api/v1/metrics/', metricData);
}

/**
 * Get metrics for a specific user with optional filters
 * GET /api/v1/metrics/user/{user_id}
 */
export async function getUserMetrics(
  userId: number,
  options?: {
    metricName?: string;
    dialogId?: number;
    limit?: number;
  }
): Promise<Metric[]> {
  const params: Record<string, any> = {};

  if (options?.metricName) {
    params.metric_name = options.metricName;
  }

  if (options?.dialogId) {
    params.dialog_id = options.dialogId;
  }

  if (options?.limit) {
    params.limit = options.limit;
  }

  return await api.get(`/api/v1/metrics/user/${userId}`, { params });
}

/**
 * Get metrics for a specific dialog
 * GET /api/v1/metrics/dialog/{dialog_id}
 */
export async function getDialogMetrics(
  dialogId: number,
  metricName?: string
): Promise<Metric[]> {
  const params: Record<string, any> = {};

  if (metricName) {
    params.metric_name = metricName;
  }

  return await api.get(`/api/v1/metrics/dialog/${dialogId}`, { params });
}

/**
 * Get a specific metric by ID
 * GET /api/v1/metrics/{metric_id}
 */
export async function getMetric(metricId: number): Promise<Metric> {
  return await api.get(`/api/v1/metrics/${metricId}`);
}
