import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMemorySchema, type InsertMemory, type Memory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit3, Trash2 } from "lucide-react";

interface EditMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory: Memory | null;
}

export default function EditMemoryModal({ open, onOpenChange, memory }: EditMemoryModalProps) {
  const [tags, setTags] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertMemory>({
    resolver: zodResolver(insertMemorySchema),
    defaultValues: {
      title: "",
      content: "",
      type: "note",
      tags: [],
    },
  });

  // Update form when memory changes
  useEffect(() => {
    if (memory) {
      form.reset({
        title: memory.title,
        content: memory.content,
        type: memory.type as any,
        tags: memory.tags || [],
      });
      setTags(memory.tags?.join(', ') || '');
    }
  }, [memory, form]);

  const updateMemoryMutation = useMutation({
    mutationFn: async (data: InsertMemory) => {
      const response = await apiRequest("PUT", `/api/memories/${memory!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Memory updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/memories/${memory!.id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Memory deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMemory) => {
    // Parse tags from comma-separated string
    const parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    updateMemoryMutation.mutate({
      ...data,
      tags: parsedTags,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      deleteMemoryMutation.mutate();
    }
  };

  if (!memory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-edit-memory">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <span>Edit Memory</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-delete-memory"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-content-type">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idea">💡 Idea</SelectItem>
                      <SelectItem value="note">📝 Note</SelectItem>
                      <SelectItem value="learning">🎓 Learning</SelectItem>
                      <SelectItem value="task">✅ Task</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Give your memory a title..." 
                      {...field}
                      data-testid="input-edit-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your thought, idea, or learning..."
                      className="h-32"
                      {...field}
                      data-testid="textarea-edit-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas..."
                data-testid="input-edit-tags"
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMemoryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-changes"
              >
                {updateMemoryMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}