import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, StickyNote, GraduationCap, ClipboardList, Calendar, Search, Edit, Trash } from "lucide-react";
import { Memory } from "@shared/schema";
import EditMemoryModal from "./edit-memory-modal";

interface MemoryListProps {
  selectedFilter: string;
  onMemorySelect?: (memory: Memory) => void;
  onAddMemory?: () => void;
}

export default function MemoryList({ selectedFilter, onMemorySelect, onAddMemory }: MemoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const queryClient = useQueryClient();

  const { data: memories, isLoading } = useQuery<Memory[]>({
    queryKey: ["/api/memories"],
    queryFn: async () => {
      const response = await fetch("/api/memories");
      if (!response.ok) {
        throw new Error("Failed to fetch memories");
      }
      return response.json();
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'idea':
        return <Lightbulb className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      case 'learning':
        return <GraduationCap className="h-4 w-4" />;
      case 'task':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <StickyNote className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'idea':
        return 'bg-yellow-100 text-yellow-800';
      case 'note':
        return 'bg-green-100 text-green-800';
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMemories = memories?.filter((memory: Memory) => {
    // Debug logging
    console.log('Filtering memory:', memory.title, 'type:', memory.type, 'selectedFilter:', selectedFilter);

    // First filter by type
    const matchesType = selectedFilter === 'all' || memory.type === selectedFilter;

    // Then filter by search term
    const matchesSearch = !searchTerm ||
      memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    console.log('matchesType:', matchesType, 'matchesSearch:', matchesSearch);
    return matchesType && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
  };

  const handleDelete = async (memoryId: string) => {
    try {
      const response = await fetch(`/api/memories/${memoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete memory');
      }
      // Refetch memories and stats
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedFilter === 'all' ? 'All Memories' : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}s`}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-memories"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                data-testid="button-clear-search"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
            <p className="text-gray-500 mb-4">
              {selectedFilter === 'all'
                ? "You haven't added any memories yet."
                : `No ${selectedFilter}s have been added yet.`}
            </p>
            <Button onClick={onAddMemory} data-testid="button-add-first-memory">
              Add your first memory
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMemories.map((memory: Memory) => (
                <Card
                  key={memory.id}
                  className="hover:shadow-md transition-shadow relative group"
                  data-testid={`card-memory-${memory.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle
                        className="text-base font-medium line-clamp-2 cursor-pointer"
                        onClick={() => onMemorySelect?.(memory)}
                      >
                        {memory.title}
                      </CardTitle>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(memory);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-edit-${memory.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(memory.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                          data-testid={`button-delete-${memory.id}`}
                        >
                          <span className="sr-only">Delete</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                        {getIcon(memory.type)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {memory.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={getTypeColor(memory.type)}>
                        {memory.type}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {memory.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {memory.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{memory.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        <EditMemoryModal
          open={!!editingMemory}
          onOpenChange={(open) => !open && setEditingMemory(null)}
          memory={editingMemory}
        />
      </div>
    </div>
  );
}