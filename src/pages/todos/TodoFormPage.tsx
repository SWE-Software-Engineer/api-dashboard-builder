// =============================================================================
// Todo Form Page (Create/Edit)
// =============================================================================

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { todoService } from "@/services/todo-service";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Priority, PriorityLabels } from "@/types/api";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  priority: z.nativeEnum(Priority),
  dueDate: z.date().optional().nullable(),
  isCompleted: z.boolean().optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

export default function TodoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  
  const form = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: Priority.None,
      dueDate: null,
      isCompleted: false,
    },
  });
  
  useEffect(() => {
    async function fetchTodo() {
      if (!id) return;
      
      try {
        const response = await todoService.getTodoById(id);
        if (response.success && response.data) {
          const todo = response.data;
          form.reset({
            title: todo.title || "",
            description: todo.description || "",
            priority: getPriorityFromString(todo.priority),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
            isCompleted: todo.isCompleted,
          });
        }
      } catch (error) {
        toast.error("Failed to load todo");
        navigate("/todos");
      } finally {
        setIsFetching(false);
      }
    }
    
    fetchTodo();
  }, [id, form, navigate]);
  
  function getPriorityFromString(priority: string | null): Priority {
    switch (priority) {
      case "Low":
        return Priority.Low;
      case "Medium":
        return Priority.Medium;
      case "High":
        return Priority.High;
      default:
        return Priority.None;
    }
  }
  
  const onSubmit = async (data: TodoFormData) => {
    setIsLoading(true);
    
    try {
      if (isEditing && id) {
        const response = await todoService.updateTodo(id, {
          title: data.title,
          description: data.description || null,
          priority: data.priority,
          dueDate: data.dueDate?.toISOString() || null,
          isCompleted: data.isCompleted || false,
        });
        
        if (response.success) {
          toast.success("Todo updated successfully");
          navigate("/todos");
        } else {
          toast.error(response.errors?.[0] || "Failed to update todo");
        }
      } else {
        const response = await todoService.createTodo({
          title: data.title,
          description: data.description || null,
          priority: data.priority,
          dueDate: data.dueDate?.toISOString() || null,
        });
        
        if (response.success) {
          toast.success("Todo created successfully");
          navigate("/todos");
        } else {
          toast.error(response.errors?.[0] || "Failed to create todo");
        }
      }
    } catch (error) {
      toast.error(isEditing ? "Failed to update todo" : "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/todos")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Todo" : "Create Todo"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update your task details" : "Add a new task to your list"}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Todo Details</CardTitle>
          <CardDescription>
            Fill in the information for your task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter todo title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional details about your task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PriorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When should this task be completed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/todos")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    "Update Todo"
                  ) : (
                    "Create Todo"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
