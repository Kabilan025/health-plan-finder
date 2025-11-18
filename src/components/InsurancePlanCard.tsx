import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export interface InsurancePlan {
  id: string;
  name: string;
  type: string;
  premium: number;
  coverage: string[];
  description: string;
  recommended?: boolean;
}

interface InsurancePlanCardProps {
  plan: InsurancePlan;
  index: number;
}

const InsurancePlanCard = ({ plan, index }: InsurancePlanCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${
        plan.recommended ? "border-primary border-2" : ""
      }`}>
        {plan.recommended && (
          <Badge className="mb-3 bg-secondary text-secondary-foreground">
            Recommended for You
          </Badge>
        )}
        <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{plan.type}</p>
        <div className="mb-4">
          <span className="text-3xl font-bold text-primary">
            ${plan.premium}
          </span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-foreground mb-4">{plan.description}</p>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Coverage includes:</p>
          {plan.coverage.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default InsurancePlanCard;
