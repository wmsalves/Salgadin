export interface Expense {
  id: number;
  description: string;
  amount: number;
  categoryId: number;
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

export interface ReportComparison {
  current: ReportResponse;
  previous: ReportResponse;
  deltaTotal: number;
  deltaPercent: number;
}

export interface ReportSummary {
  startDate: string;
  endDate: string;
  total: number;
  averageDaily: number;
  biggestDay?: string | null;
  biggestDayTotal: number;
  trendPercent: number;
  topCategories: CategoryTotal[];
  insights: ReportInsight[];
}

export interface ReportInsight {
  title: string;
  detail: string;
  tone: "positive" | "negative" | "neutral";
}

export interface NotificationPreference {
  emailEnabled: boolean;
  pushEnabled: boolean;
  minimumThreshold: number;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  goalId?: number | null;
  categoryId?: number | null;
  category?: string | null;
  monthlyLimit: number;
  spent: number;
  threshold: number;
  periodYear: number;
  periodMonth: number;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface Income {
  id: number;
  description: string;
  amount: number;
  date: string;
  isFixed: boolean;
}
