import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ConversationalChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hello! 👋 I'm your AI-powered Health Insurance Assistant specializing in Indian health insurance and government schemes.\n\nI can help you find the perfect insurance plan for your family and inform you about government schemes you may be eligible for.\n\nTo get started, could you tell me:\n- How many people are in your family?\n- What's your approximate annual household income (in lakhs)?\n- Are you aware of government schemes like Ayushman Bharat?\n- Do you have any specific health coverage needs?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('insurance-chat', {
        body: { 
          messages: [...messages, userMessage],
          useSearch: useWebSearch 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.message) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = "I apologize, but I'm having trouble responding right now. Please try again.";
      
      if (error.message?.includes('429')) {
        errorMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (error.message?.includes('402')) {
        errorMessage = "The AI service needs to be recharged. Please contact support.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6">
          <h2 className="text-2xl font-bold text-white mb-2">AI Insurance Assistant</h2>
          <p className="text-white/90 text-sm">Powered by Google Gemini AI</p>
          
          <div className="mt-4 flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <Search className="w-4 h-4 text-white" />
            <Label htmlFor="web-search" className="text-white text-sm cursor-pointer flex-1">
              Enhanced with live web search
            </Label>
            <Switch 
              id="web-search"
              checked={useWebSearch}
              onCheckedChange={setUseWebSearch}
            />
          </div>
        </div>
        
        <div className="h-[500px] overflow-y-auto p-6 bg-background">
          {messages.map((msg, idx) => (
            <ChatMessage 
              key={idx} 
              message={msg.content} 
              isUser={msg.role === "user"} 
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-muted border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about health insurance..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationalChat;
