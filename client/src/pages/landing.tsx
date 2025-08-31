import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Search, MessageSquare, Shield, Zap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">MemoryOS</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered second brain for storing, organizing, and retrieving thoughts, 
            ideas, and knowledge with intelligent search and conversation.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Capture Everything</h3>
            <p className="text-gray-600">
              Store ideas, notes, learnings, and tasks in one organized place
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <Search className="h-8 w-8 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Find information instantly with AI-powered semantic search
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat with AI</h3>
            <p className="text-gray-600">
              Ask questions and get intelligent responses based on your stored knowledge
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg p-8 shadow-md mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why MemoryOS?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Private & Secure</h3>
                <p className="text-gray-600">Your memories are stored securely and remain completely private</p>
              </div>
            </div>
            <div className="flex items-start">
              <Zap className="h-6 w-6 text-yellow-500 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Instant search and retrieval of your knowledge base</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={() => setLocation('/home')}
            data-testid="button-get-started"
          >
            Get Started <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            No account required - start using MemoryOS immediately
          </p>
        </div>
      </div>
    </div>
  );
}