import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, User, Send, Search, Calendar, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relevantMemories?: any[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome back! I'm your AI assistant for MemoryOS. I can help you:

• Find specific information from your stored memories
• Search across all your notes, ideas, and learnings  
• Suggest related content based on your queries
• Help organize and categorize your thoughts

What would you like to remember or find today?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      const response = await apiRequest("POST", "/api/chat", { messages });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        relevantMemories: data.relevantMemories
      }]);
      setIsTyping(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    chatMutation.mutate([...messages, userMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Scroll to bottom when messages change (confined to chat container)
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('[data-testid="chat-container"]');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-background to-tech-surface">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8" data-testid="chat-container" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar with modern gradient */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
              message.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                : 'gradient-ai animate-gradient shadow-glow'
            }`}>
              {message.role === 'user' ? (
                <User className="text-white w-5 h-5" />
              ) : (
                <Brain className="text-white w-5 h-5" />
              )}
            </div>
            
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              {/* Message bubble with modern styling */}
              <div className={`${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white inline-block max-w-2xl rounded-2xl px-6 py-4 shadow-lg' 
                  : 'glass rounded-2xl p-6 shadow-tech border border-border/50'
              }`}>
                <div className={`whitespace-pre-wrap leading-relaxed ${
                  message.role === 'user' ? 'text-white' : 'text-foreground'
                }`} data-testid={`message-${message.role}-${index}`}>
                  {message.content}
                </div>
                
                {/* Enhanced relevant memories display */}
                {message.role === 'assistant' && message.relevantMemories && message.relevantMemories.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 bg-gradient-to-b from-ai-gradient-from to-ai-gradient-to rounded-full"></div>
                      <p className="text-sm font-semibold text-tech-neutral">Referenced memories</p>
                    </div>
                    {message.relevantMemories.map((memory: any) => (
                      <div key={memory.id} className="glass rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-border/30" data-testid={`memory-${memory.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground line-clamp-2 flex-1">{memory.title}</span>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm ${
                              memory.type === 'idea' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200' :
                              memory.type === 'note' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200' :
                              memory.type === 'learning' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200' :
                              'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200'
                            }`}>
                              {memory.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(memory.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{memory.content}</p>
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {memory.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span key={tagIndex} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
                                #{tag}
                              </span>
                            ))}
                            {memory.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{memory.tags.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Timestamp with better styling */}
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Enhanced typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 gradient-ai animate-gradient rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="glass rounded-2xl p-6 shadow-tech border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-ai-gradient-from to-ai-gradient-to rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">AI is processing your request...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Section */}
      <div className="glass border-t border-border/50 backdrop-blur-lg p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your memories, or describe what you want to remember..."
                  className="resize-none max-h-32 min-h-[3.5rem] text-base leading-relaxed 
                           glass border-border/30 rounded-2xl px-6 py-4 
                           focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                           transition-all duration-200 shadow-sm"
                  rows={1}
                  data-testid="input-chat"
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">Press ↵ to send, Shift + ↵ for new line</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  <span className={input.length > 1800 ? 'text-destructive' : ''}>{input.length}</span> / 2000
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="h-14 w-14 rounded-xl gradient-ai hover:shadow-glow disabled:opacity-50 
                         disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              data-testid="button-send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Enhanced Quick Action Chips */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2">
            <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Quick actions:</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 rounded-xl glass border-border/30 hover:border-primary/30 
                          hover:shadow-sm transition-all duration-200"
                onClick={() => handleQuickAction("Search all my notes")}
                data-testid="button-quick-search-notes"
              >
                <Search className="w-3.5 h-3.5 mr-2" />
                Search notes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 rounded-xl glass border-border/30 hover:border-primary/30 
                          hover:shadow-sm transition-all duration-200"
                onClick={() => handleQuickAction("Show me recent memories")}
                data-testid="button-quick-recent"
              >
                <Calendar className="w-3.5 h-3.5 mr-2" />
                Recent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0 rounded-xl glass border-border/30 hover:border-primary/30 
                          hover:shadow-sm transition-all duration-200"
                onClick={() => handleQuickAction("Find important items")}
                data-testid="button-quick-important"
              >
                <Star className="w-3.5 h-3.5 mr-2" />
                Important
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
