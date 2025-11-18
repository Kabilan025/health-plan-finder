import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import InsurancePlanCard, { InsurancePlan } from "./InsurancePlanCard";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  text: string;
  isUser: boolean;
}

type ChatStep = "initial" | "family_size" | "income" | "recommendations";

const insurancePlans: InsurancePlan[] = [
  {
    id: "1",
    name: "Essential Care",
    type: "Basic Coverage",
    premium: 150,
    description: "Perfect for individuals and small families with basic healthcare needs",
    coverage: [
      "Annual health checkups",
      "Emergency care coverage",
      "Generic prescription drugs",
      "Preventive care services"
    ]
  },
  {
    id: "2",
    name: "Family Shield",
    type: "Comprehensive Coverage",
    premium: 400,
    description: "Ideal for families seeking comprehensive protection",
    coverage: [
      "All Essential Care benefits",
      "Specialist consultations",
      "Brand-name prescription drugs",
      "Maternity and newborn care",
      "Mental health services",
      "Dental and vision care"
    ]
  },
  {
    id: "3",
    name: "Premium Plus",
    type: "Premium Coverage",
    premium: 700,
    description: "Top-tier coverage with minimal out-of-pocket costs",
    coverage: [
      "All Family Shield benefits",
      "Private hospital rooms",
      "International coverage",
      "Alternative medicine",
      "Wellness programs",
      "No referral needed for specialists"
    ]
  },
  {
    id: "4",
    name: "Budget Care",
    type: "Subsidized Coverage",
    premium: 50,
    description: "Affordable option for low-income families with government subsidies",
    coverage: [
      "Essential health services",
      "Emergency care",
      "Basic prescription coverage",
      "Preventive care"
    ]
  }
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your Health Insurance Assistant. I'll help you find the perfect insurance plan for your family.\n\nTo get started, how many people are in your family?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<ChatStep>("family_size");
  const [familySize, setFamilySize] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<InsurancePlan[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, recommendations]);

  const getRecommendations = (size: number, monthlyIncome: number) => {
    const annualIncome = monthlyIncome * 12;
    let recommended: InsurancePlan[] = [];

    if (annualIncome < 30000) {
      recommended = insurancePlans
        .filter(p => p.id === "4" || p.id === "1")
        .map(p => ({ ...p, recommended: p.id === "4" }));
    } else if (annualIncome < 60000) {
      recommended = insurancePlans
        .filter(p => p.id === "1" || p.id === "2")
        .map(p => ({ ...p, recommended: p.id === "1" }));
    } else if (annualIncome < 100000) {
      recommended = insurancePlans
        .filter(p => p.id === "2" || p.id === "3")
        .map(p => ({ ...p, recommended: p.id === "2" }));
    } else {
      recommended = insurancePlans
        .filter(p => p.id === "2" || p.id === "3")
        .map(p => ({ ...p, recommended: p.id === "3" }));
    }

    return recommended;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    const value = parseInt(input);

    if (step === "family_size") {
      if (isNaN(value) || value < 1) {
        toast({
          title: "Invalid input",
          description: "Please enter a valid number of family members",
          variant: "destructive"
        });
        setInput("");
        return;
      }
      setFamilySize(value);
      setMessages(prev => [...prev, {
        text: `Great! You have ${value} ${value === 1 ? 'person' : 'people'} in your family.\n\nWhat is your approximate monthly family income? (Please enter in USD)`,
        isUser: false
      }]);
      setStep("income");
    } else if (step === "income") {
      if (isNaN(value) || value < 0) {
        toast({
          title: "Invalid input",
          description: "Please enter a valid income amount",
          variant: "destructive"
        });
        setInput("");
        return;
      }
      setIncome(value);
      const plans = getRecommendations(familySize, value);
      setRecommendations(plans);
      setMessages(prev => [...prev, {
        text: `Thank you! Based on your family size of ${familySize} and monthly income of $${value.toLocaleString()}, I've found the best insurance plans for you.\n\nHere are my recommendations:`,
        isUser: false
      }]);
      setStep("recommendations");
    }

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="bg-primary p-4">
          <h2 className="text-xl font-bold text-primary-foreground">Insurance Assistant</h2>
          <p className="text-sm text-primary-foreground/90">Find your perfect health plan</p>
        </div>
        
        <div className="h-[500px] overflow-y-auto p-6 bg-background">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg.text} isUser={msg.isUser} />
          ))}
          {recommendations.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recommendations.map((plan, idx) => (
                <InsurancePlanCard key={plan.id} plan={plan} index={idx} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {step !== "recommendations" && (
          <div className="p-4 bg-muted border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={step === "family_size" ? "Enter number of family members..." : "Enter monthly income..."}
                className="flex-1 bg-background"
                type="number"
              />
              <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
