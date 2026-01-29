// =============================================================================
// Todo Detail Page
// =============================================================================

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { todoService } from "@/services/todo-service";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { TodoItemResponse } from "@/types/api";

export default function TodoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [todo, setTodo] = useState<TodoItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  useEffect(() => {
    async function fetchTodo() {
      if (!id) return;
      
      try {
        const response = await todoService.getTodoById(id);
        if (response.success && response.data) {
          setTodo(response.data);
        } else {
          toast.error("Todo not found");
          navigate("/todos");
        }
      } catch (error) {
        toast.error("Failed to load todo");
        navigate("/todos");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTodo();
  }, [id, navigate]);
  
  const handleToggle = async () => {
    if (!todo) return;
    
    setIsToggling(true);
    try {
      const response = await todoService.toggleTodo(todo.id);
      if (response.success && response.data) {
        setTodo(response.data);
        toast.success(
          todo.isCompleted ? "Todo marked as pending" : "Todo marked as completed"
        );
      }
    } catch (error) {
      toast.error("Failed to update todo");
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleDelete = async () => {
    if (!todo) return;
    
    setIsDeleting(true);
    try {
      const response = await todoService.deleteTodo(todo.id);
      if (response.success) {
        toast.success("Todo deleted successfully");
        navigate("/todos");
      }
    } catch (error) {
      toast.error("Failed to delete todo");
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  if (!todo) {
    return null;
  }
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/todos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{todo.title}</h1>
            <div className="flex items-center gap-3">
              <StatusBadge isCompleted={todo.isCompleted} />
              <PriorityBadge priority={todo.priority} />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggle}
            disabled={isToggling}
          >
            {todo.isCompleted ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Mark Pending
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Complete
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/todos/${todo.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {todo.description && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="whitespace-pre-wrap">{todo.description}</p>
            </div>
          )}
          
          <Separator />
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Due Date
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {todo.dueDate ? (
                  format(new Date(todo.dueDate), "PPPP")
                ) : (
                  <span className="text-muted-foreground">No due date set</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Priority
              </h3>
              <PriorityBadge priority={todo.priority} />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Created
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {format(new Date(todo.createdAt), "PPP 'at' p")}
              </div>
            </div>
            
            {todo.updatedAt && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Last Updated
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(todo.updatedAt), "PPP 'at' p")}
                </div>
              </div>
            )}
            
            {todo.completedAt && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Completed
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {format(new Date(todo.completedAt), "PPP 'at' p")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Todo"
        description={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
