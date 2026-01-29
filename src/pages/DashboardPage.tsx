// =============================================================================
// Dashboard Page
// =============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { todoService } from "@/services/todo-service";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import type { TodoStatsResponse, TodoItemResponse } from "@/types/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TodoStatsResponse | null>(null);
  const [overdueTodos, setOverdueTodos] = useState<TodoItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, overdueRes] = await Promise.all([
          todoService.getStats(),
          todoService.getOverdueTodos(),
        ]);
        
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (overdueRes.success && overdueRes.data) {
          setOverdueTodos(overdueRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }
  
  const completionRate = stats
    ? Math.round((stats.completedCount / (stats.totalCount || 1)) * 100)
    : 0;
  
  const priorityData = stats?.countByPriority
    ? Object.entries(stats.countByPriority).map(([name, value]) => ({
        name,
        value,
      }))
    : [];
  
  const PRIORITY_COLORS = {
    None: "hsl(142, 76%, 36%)",
    Low: "hsl(142, 76%, 36%)",
    Medium: "hsl(38, 92%, 50%)",
    High: "hsl(25, 95%, 53%)",
    Urgent: "hsl(0, 84%, 60%)",
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your tasks and productivity
          </p>
        </div>
        <Button onClick={() => navigate("/todos/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Todo
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Todos"
          value={stats?.totalCount || 0}
          icon={CheckSquare}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Completed"
          value={stats?.completedCount || 0}
          icon={TrendingUp}
          description={`${completionRate}% completion rate`}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingCount || 0}
          icon={Clock}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueCount || 0}
          icon={AlertTriangle}
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>
      
      {/* Charts and Overdue */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks grouped by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] ||
                          "hsl(var(--muted))"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Overdue Todos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Overdue Tasks</CardTitle>
              <CardDescription>Tasks past their due date</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/todos?overdue=true")}
              className="gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {overdueTodos.length > 0 ? (
              <div className="space-y-3">
                {overdueTodos.slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{todo.title}</p>
                      {todo.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(todo.dueDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <PriorityBadge priority={todo.priority} />
                      <StatusBadge isCompleted={todo.isCompleted} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No overdue tasks! 🎉
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
