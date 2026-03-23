export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  subcategoryId?: number | null;
  subcategory?: string | null;
  date: string;
}

export interface DailySummary {
  date: string;
  total: number;
  totalByCategory: Record<string, number>;
}

export interface Goal {
  id: number;
  categoryId?: number | null;
  category?: string | null;
  monthlyLimit: number;
  alertThreshold: number;
  isActive: boolean;
}

export interface GoalAlert {
  goalId: number;
  categoryId?: number | null;
  category?: string | null;
  monthlyLimit: number;
  alertThreshold: number;
  spent: number;
  thresholdReached: boolean;
}

export interface ReportPoint {
  date: string;
  total: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface ReportResponse {
  startDate: string;
  endDate: string;
  total: number;
  series: ReportPoint[];
  byCategory: CategoryTotal[];
}

export interface NotificationPreference {
  emailEnabled: boolean;
  pushEnabled: boolean;
  minimumThreshold: number;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}
