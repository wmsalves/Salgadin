import { DashboardMockup, ExpensesMockup, GoalsMockup } from "./mockups";

type TabKey = "Dashboard" | "Despesas" | "Metas";

export default function HowItWorksMockupPanel({ activeTab }: { activeTab: TabKey }) {
  return {
    Dashboard: <DashboardMockup />,
    Despesas: <ExpensesMockup />,
    Metas: <GoalsMockup />,
  }[activeTab];
}
