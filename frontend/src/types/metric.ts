/**
 * Metric-related TypeScript types
 * Maps to backend schemas: @backend/app/schemas/metric.py
 */

/**
 * Metric interface matching backend MetricResponse schema
 * @backend/app/schemas/metric.py:MetricResponse
 */
export interface Metric {
  metric_id: number;
  user_id: number;
  dialog_id: number | null;
  message_id: number | null;
  metric_name: string;
  metric_value_f: number | null;
  metric_value_s: string | null;
  metric_value_j: Record<string, any> | null;
  context: Record<string, any>;
  timestamp: string;
}

/**
 * Create metric request interface matching backend MetricCreate schema
 * @backend/app/schemas/metric.py:MetricCreate
 */
export interface MetricCreate {
  user_id: number;
  dialog_id?: number;
  message_id?: number;
  metric_name: string;
  metric_value_f?: number;
  metric_value_s?: string;
  metric_value_j?: Record<string, any>;
  context?: Record<string, any>;
}
