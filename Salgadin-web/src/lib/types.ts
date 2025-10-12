export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface DailySummary {
  date: string;
  total: number;
  totalByCategory: Record<string, number>;
}
