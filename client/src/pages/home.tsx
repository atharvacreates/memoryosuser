import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ChatInterface from "@/components/chat-interface";
import MemoryList from "@/components/memory-list";
import AddMemoryModal from "@/components/add-memory-modal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Brain, MessageSquare, List } from "lucide-react";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentView, setCurrentView] = useState<'chat' | 'memories'>('chat');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80">
          <Sidebar 
            onAddMemory={() => setIsAddModalOpen(true)} 
            onFilterChange={setSelectedFilter}
            selectedFilter={selectedFilter}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <Sidebar 
                    onAddMemory={() => setIsAddModalOpen(true)} 
                    onFilterChange={setSelectedFilter}
                    selectedFilter={selectedFilter}
                  />
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Brain className="h-4 w-4 text-brand-500" />
                <span>Ready to help you remember anything</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Online</span>
              </div>
              <div className="flex items-center border border-gray-200 rounded-lg p-1">
                <Button 
                  variant={currentView === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('chat')}
                  data-testid="button-view-chat"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button 
                  variant={currentView === 'memories' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('memories')}
                  data-testid="button-view-memories"
                >
                  <List className="h-4 w-4 mr-1" />
                  Memories
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentView === 'chat' ? (
          <ChatInterface />
        ) : (
          <MemoryList 
            selectedFilter={selectedFilter}
            onMemorySelect={(memory) => {
              // Switch to chat and ask about this memory
              setCurrentView('chat');
            }}
            onAddMemory={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      {/* Add Memory Modal */}
      <AddMemoryModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
