import { Shield, Heart, Users, Sparkles } from "lucide-react";
import ConversationalChat from "@/components/ConversationalChat";
import InsuranceComparison from "@/components/InsuranceComparison";
import heroImage from "@/assets/hero-insurance.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Powered by AI & Live Search</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Find Your Perfect Health Insurance Plan
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Chat naturally with our AI assistant powered by Google Gemini. Get personalized 
              recommendations enhanced with real-time web search for the latest insurance information.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card p-6 rounded-xl border border-border">
                <Heart className="w-8 h-8 text-secondary mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Personalized</h3>
                <p className="text-sm text-muted-foreground">Plans tailored to your family's needs</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <Users className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Family-Focused</h3>
                <p className="text-sm text-muted-foreground">Coverage for everyone you love</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <Shield className="w-8 h-8 text-accent mb-3 mx-auto" />
                <h3 className="font-semibold mb-2 text-foreground">Affordable</h3>
                <p className="text-sm text-muted-foreground">Plans that fit your budget</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <InsuranceComparison />

      {/* Chat Section */}
      <section className="container mx-auto px-4 py-12 pb-20">
        <ConversationalChat />
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 Health Insurance Assistant. Your trusted partner in healthcare coverage.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
