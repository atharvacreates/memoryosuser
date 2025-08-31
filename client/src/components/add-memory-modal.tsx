import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertMemorySchema, type InsertMemory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMemoryModal({ open, onOpenChange }: AddMemoryModalProps) {
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

  const createMemoryMutation = useMutation({
    mutationFn: async (data: InsertMemory) => {
      const response = await apiRequest("POST", "/api/memories", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Memory saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      setTags("");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMemory) => {
    // Parse tags from comma-separated string
    const parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    createMemoryMutation.mutate({
      ...data,
      tags: parsedTags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-add-memory">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-brand-600" />
            </div>
            <span>Add New Memory</span>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-content-type">
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
                      data-testid="input-title"
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
                      data-testid="textarea-content"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas..."
                data-testid="input-tags"
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas. If left empty, AI will suggest tags automatically.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMemoryMutation.isPending}
                className="bg-brand-600 hover:bg-brand-700"
                data-testid="button-save-memory"
              >
                {createMemoryMutation.isPending ? "Saving..." : "Save Memory"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
