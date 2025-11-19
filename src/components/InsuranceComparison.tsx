import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SchemeFeature {
  name: string;
  coverage: string;
  eligibility: string;
  cost: string;
  benefits: string[];
  limitations: string[];
  type: "government" | "private";
}

const governmentSchemes: SchemeFeature[] = [
  {
    name: "Ayushman Bharat PM-JAY",
    coverage: "₹5 lakh per family/year",
    eligibility: "Annual income below ₹2.5 lakh",
    cost: "Free",
    benefits: [
      "Cashless hospitalization at empaneled hospitals",
      "Covers pre and post-hospitalization",
      "No age limit",
      "Covers pre-existing conditions",
      "Covers secondary and tertiary care"
    ],
    limitations: [
      "Limited to empaneled hospitals",
      "Does not cover OPD expenses",
      "Restricted to specific procedures"
    ],
    type: "government"
  },
  {
    name: "CGHS",
    coverage: "Comprehensive medical coverage",
    eligibility: "Central Govt employees & pensioners",
    cost: "Minimal (₹50-₹1,500/month based on pay)",
    benefits: [
      "OPD and IPD coverage",
      "Medicine supply",
      "Diagnostic services",
      "Specialist consultations",
      "Coverage for family members"
    ],
    limitations: [
      "Only for government employees",
      "Limited to CGHS empaneled hospitals",
      "Long waiting periods sometimes"
    ],
    type: "government"
  },
  {
    name: "ESIS",
    coverage: "Full medical care + cash benefits",
    eligibility: "Workers earning up to ₹21,000/month",
    cost: "1.75% of wages (shared with employer)",
    benefits: [
      "Medical care for self and family",
      "Sickness benefit (cash)",
      "Maternity benefit",
      "Disability benefit",
      "Unemployment allowance"
    ],
    limitations: [
      "Limited to ESIS facilities",
      "Only for eligible workers",
      "Income limit restrictions"
    ],
    type: "government"
  },
  {
    name: "RSBY",
    coverage: "₹30,000 per family/year",
    eligibility: "BPL families",
    cost: "₹30 registration fee only",
    benefits: [
      "Cashless hospitalization",
      "Covers pre-existing conditions",
      "No age limit",
      "Covers 5 family members"
    ],
    limitations: [
      "Limited coverage amount",
      "Only for BPL families",
      "Limited hospital network"
    ],
    type: "government"
  }
];

const privatePlans: SchemeFeature[] = [
  {
    name: "Budget Care",
    coverage: "₹3-5 lakh",
    eligibility: "All individuals and families",
    cost: "₹1,500/month",
    benefits: [
      "Cashless hospitalization nationwide",
      "Pre and post-hospitalization coverage",
      "Ambulance charges covered",
      "Day care procedures",
      "Room rent coverage"
    ],
    limitations: [
      "2-4 year waiting for pre-existing conditions",
      "Sub-limits on room rent",
      "Co-payment may apply"
    ],
    type: "private"
  },
  {
    name: "Essential Care",
    coverage: "₹5-10 lakh",
    eligibility: "Individuals and small families",
    cost: "₹3,500/month",
    benefits: [
      "Higher coverage amount",
      "Wider hospital network",
      "Reduced waiting periods",
      "Critical illness coverage",
      "Annual health check-up"
    ],
    limitations: [
      "Waiting period for specific diseases",
      "Some exclusions apply",
      "Premium increases with age"
    ],
    type: "private"
  },
  {
    name: "Family Shield",
    coverage: "₹10-25 lakh",
    eligibility: "Families of any size",
    cost: "₹8,000/month",
    benefits: [
      "Comprehensive family coverage",
      "Maternity benefits",
      "New born baby coverage",
      "Dental and vision care",
      "Preventive care and vaccinations",
      "Mental health coverage"
    ],
    limitations: [
      "Higher premium costs",
      "Some services have sub-limits",
      "Claim verification process"
    ],
    type: "private"
  },
  {
    name: "Premium Plus",
    coverage: "₹25 lakh - ₹1 crore",
    eligibility: "High-income families",
    cost: "₹15,000/month",
    benefits: [
      "Maximum coverage amount",
      "International coverage",
      "No sub-limits",
      "Zero waiting period options",
      "Concierge medical services",
      "Alternative treatments covered"
    ],
    limitations: [
      "High premium costs",
      "Extensive documentation required",
      "Medical screening mandatory"
    ],
    type: "private"
  }
];

const ComparisonCard = ({ scheme, index }: { scheme: SchemeFeature; index: number }) => {
  const isGovernment = scheme.type === "government";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300">
        <div className="mb-4">
          <Badge className={isGovernment ? "bg-green-600 text-white mb-2" : "bg-primary text-primary-foreground mb-2"}>
            {isGovernment ? "Government Scheme" : "Private Insurance"}
          </Badge>
          <h3 className="text-xl font-bold text-foreground">{scheme.name}</h3>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Coverage</p>
            <p className="text-lg font-semibold text-primary">{scheme.coverage}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Cost</p>
            <p className="text-lg font-semibold text-foreground">{scheme.cost}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Eligibility</p>
            <p className="text-sm text-foreground">{scheme.eligibility}</p>
          </div>
        </div>

        <div className="space-y-4 flex-grow">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Benefits
            </p>
            <ul className="space-y-1">
              {scheme.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-600" />
              Limitations
            </p>
            <ul className="space-y-1">
              {scheme.limitations.map((limitation, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-3 h-3 text-orange-600 mt-1 flex-shrink-0" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const InsuranceComparison = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Compare Insurance Options
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore and compare government health schemes and private insurance plans to find the best fit for your family
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="all">All Options</TabsTrigger>
            <TabsTrigger value="government">Government</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Government Schemes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {governmentSchemes.map((scheme, index) => (
                  <ComparisonCard key={scheme.name} scheme={scheme} index={index} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Private Insurance Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {privatePlans.map((scheme, index) => (
                  <ComparisonCard key={scheme.name} scheme={scheme} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="government">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {governmentSchemes.map((scheme, index) => (
                <ComparisonCard key={scheme.name} scheme={scheme} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {privatePlans.map((scheme, index) => (
                <ComparisonCard key={scheme.name} scheme={scheme} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default InsuranceComparison;
