import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Lightbulb, StickyNote, GraduationCap, ClipboardList, Tag } from "lucide-react";

interface SidebarProps {
  onAddMemory: () => void;
  onFilterChange?: (type: string) => void;
  selectedFilter?: string;
}

export default function Sidebar({ onAddMemory, onFilterChange, selectedFilter = 'all' }: SidebarProps) {
  const { data: stats } = useQuery<{
    total: number;
    ideas: number;
    notes: number;
    learnings: number;
    tasks: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recentSearches } = useQuery<Array<{
    id: string;
    query: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/searches/recent"],
  });

  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Brain className="text-white text-sm" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">MemoryOS</h1>
            <p className="text-sm text-gray-500">Your AI Second Brain</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <Button 
          onClick={onAddMemory}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white"
          data-testid="button-add-memory"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {/* Content Categories */}
      <div className="flex-1 px-6 py-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content Types</h3>
          <nav className="space-y-1 mt-3">
            <Button
              variant="ghost"
              onClick={() => {
                console.log('Clicking Ideas filter');
                onFilterChange?.('idea');
              }}
              className={`w-full justify-start ${selectedFilter === 'idea' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
              data-testid="button-filter-ideas"
            >
              <Lightbulb className={`mr-3 h-4 w-4 ${selectedFilter === 'idea' ? 'text-brand-500' : 'text-gray-400'}`} />
              Ideas
              <span className={`ml-auto py-0.5 px-2 text-xs rounded-full ${selectedFilter === 'idea' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                {stats?.ideas || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                console.log('Clicking Notes filter');
                onFilterChange?.('note');
              }}
              className={`w-full justify-start ${selectedFilter === 'note' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
              data-testid="button-filter-notes"
            >
              <StickyNote className={`mr-3 h-4 w-4 ${selectedFilter === 'note' ? 'text-brand-500' : 'text-gray-400'}`} />
              Notes
              <span className={`ml-auto py-0.5 px-2 text-xs rounded-full ${selectedFilter === 'note' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                {stats?.notes || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onFilterChange?.('learning')}
              className={`w-full justify-start ${selectedFilter === 'learning' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
              data-testid="button-filter-learnings"
            >
              <GraduationCap className={`mr-3 h-4 w-4 ${selectedFilter === 'learning' ? 'text-brand-500' : 'text-gray-400'}`} />
              Learnings
              <span className={`ml-auto py-0.5 px-2 text-xs rounded-full ${selectedFilter === 'learning' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                {stats?.learnings || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onFilterChange?.('task')}
              className={`w-full justify-start ${selectedFilter === 'task' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
              data-testid="button-filter-tasks"
            >
              <ClipboardList className={`mr-3 h-4 w-4 ${selectedFilter === 'task' ? 'text-brand-500' : 'text-gray-400'}`} />
              Tasks
              <span className={`ml-auto py-0.5 px-2 text-xs rounded-full ${selectedFilter === 'task' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                {stats?.tasks || 0}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => onFilterChange?.('all')}
              className={`w-full justify-start ${selectedFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
              data-testid="button-filter-all"
            >
              <Tag className={`mr-3 h-4 w-4 ${selectedFilter === 'all' ? 'text-brand-500' : 'text-gray-400'}`} />
              All Content
              <span className={`ml-auto py-0.5 px-2 text-xs rounded-full ${selectedFilter === 'all' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600'}`}>
                {stats?.total || 0}
              </span>
            </Button>
          </nav>
        </div>


      </div>

      {/* User Profile */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">Demo User</p>
            <p className="text-xs text-gray-500">MVP Version</p>
          </div>
        </div>
      </div>
    </div>
  );
}
