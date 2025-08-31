import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MessageSquare, Brain, BookOpen, Lightbulb } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'LEARNING' | 'NOTE' | 'IDEA';
  tags: string[];
  createdAt: Date;
}

const demoMemories: Memory[] = [
  {
    id: '1',
    title: 'LinkedIn Post Insights',
    content: 'Posts with vulnerable stories and specific learnings get 10x more engagement. People connect with authentic experiences and actionable insights.',
    type: 'LEARNING',
    tags: ['social media', 'engagement', 'content strategy'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Uber Driver Observations',
    content: 'Drivers who maintain clean cars and offer water/snacks get better ratings. Small gestures make a big difference in customer experience.',
    type: 'LEARNING',
    tags: ['customer service', 'hospitality', 'ratings'],
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Morning Routine Optimization',
    content: 'Starting the day with 10 minutes of meditation and planning increases productivity by 40%. The key is consistency over intensity.',
    type: 'NOTE',
    tags: ['productivity', 'routine', 'meditation'],
    createdAt: new Date('2024-01-08')
  }
];

export default function Demo() {
  const [memories, setMemories] = useState<Memory[]>(demoMemories);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMemory, setNewMemory] = useState({ title: '', content: '', type: 'NOTE' as const, tags: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addMemory = () => {
    if (!newMemory.title || !newMemory.content) return;
    
    const tags = newMemory.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      content: newMemory.content,
      type: newMemory.type,
      tags,
      createdAt: new Date()
    };
    
    setMemories([memory, ...memories]);
    setNewMemory({ title: '', content: '', type: 'NOTE', tags: '' });
    setShowAddForm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LEARNING': return <Brain className="w-4 h-4" />;
      case 'NOTE': return <BookOpen className="w-4 h-4" />;
      case 'IDEA': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LEARNING': return 'bg-blue-100 text-blue-800';
      case 'NOTE': return 'bg-green-100 text-green-800';
      case 'IDEA': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MemoryOS Demo</h1>
          <p className="text-lg text-gray-600">Your Personal Knowledge Management System</p>
          <p className="text-sm text-gray-500 mt-2">This is a demo version - your data is stored locally</p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>

        {/* Add Memory Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Memory</CardTitle>
              <CardDescription>Capture your thoughts, learnings, and ideas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Memory title..."
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
              />
              <Textarea
                placeholder="Memory content..."
                value={newMemory.content}
                onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                rows={4}
              />
              <div className="flex gap-2">
                <select
                  value={newMemory.type}
                  onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value as any })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="NOTE">Note</option>
                  <option value="LEARNING">Learning</option>
                  <option value="IDEA">Idea</option>
                </select>
                <Input
                  placeholder="Tags (comma separated)"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addMemory} className="flex-1">Save Memory</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMemories.map((memory) => (
            <Card key={memory.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(memory.type)}
                    <Badge className={getTypeColor(memory.type)}>
                      {memory.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {memory.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">{memory.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 line-clamp-3">{memory.content}</p>
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMemories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No memories found' : 'No memories yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by adding your first memory to build your knowledge base'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Memory
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Demo Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add, search, and organize memories</li>
              <li>• Categorize with types (Note, Learning, Idea)</li>
              <li>• Tag memories for easy discovery</li>
              <li>• Real-time search across titles, content, and tags</li>
              <li>• Responsive design for all devices</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              This is a frontend-only demo. The full version includes AI-powered chat, 
              semantic search, and persistent storage with Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
