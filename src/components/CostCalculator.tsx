import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlanDetails {
  name: string;
  monthlyPremium: number;
  coPayPercent: number;
  deductible: number;
  maxOutOfPocket: number;
  coveragePercent: number;
  type: "government" | "private";
}

const plans: Record<string, PlanDetails> = {
  ayushman: {
    name: "Ayushman Bharat PM-JAY",
    monthlyPremium: 0,
    coPayPercent: 0,
    deductible: 0,
    maxOutOfPocket: 0,
    coveragePercent: 100,
    type: "government"
  },
  cghs: {
    name: "CGHS",
    monthlyPremium: 500,
    coPayPercent: 0,
    deductible: 0,
    maxOutOfPocket: 10000,
    coveragePercent: 90,
    type: "government"
  },
  esis: {
    name: "ESIS",
    monthlyPremium: 350,
    coPayPercent: 0,
    deductible: 0,
    maxOutOfPocket: 5000,
    coveragePercent: 100,
    type: "government"
  },
  rsby: {
    name: "RSBY",
    monthlyPremium: 30,
    coPayPercent: 0,
    deductible: 0,
    maxOutOfPocket: 0,
    coveragePercent: 100,
    type: "government"
  },
  budget: {
    name: "Budget Care",
    monthlyPremium: 1500,
    coPayPercent: 10,
    deductible: 5000,
    maxOutOfPocket: 50000,
    coveragePercent: 80,
    type: "private"
  },
  essential: {
    name: "Essential Care",
    monthlyPremium: 3500,
    coPayPercent: 10,
    deductible: 10000,
    maxOutOfPocket: 75000,
    coveragePercent: 85,
    type: "private"
  },
  family: {
    name: "Family Shield",
    monthlyPremium: 8000,
    coPayPercent: 5,
    deductible: 15000,
    maxOutOfPocket: 100000,
    coveragePercent: 90,
    type: "private"
  },
  premium: {
    name: "Premium Plus",
    monthlyPremium: 15000,
    coPayPercent: 0,
    deductible: 20000,
    maxOutOfPocket: 150000,
    coveragePercent: 95,
    type: "private"
  }
};

const CostCalculator = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [doctorVisits, setDoctorVisits] = useState<number>(4);
  const [hospitalizations, setHospitalizations] = useState<number>(0);
  const [avgHospitalCost, setAvgHospitalCost] = useState<number>(50000);
  const [medications, setMedications] = useState<number>(2000);
  const [diagnostics, setDiagnostics] = useState<number>(3000);
  const [showResults, setShowResults] = useState(false);

  const calculateCosts = () => {
    if (!selectedPlan) return null;

    const plan = plans[selectedPlan];
    
    // Annual premium
    const annualPremium = plan.monthlyPremium * 12;
    
    // Healthcare costs
    const doctorVisitCost = doctorVisits * 500; // Avg ₹500 per visit
    const totalHospitalizationCost = hospitalizations * avgHospitalCost;
    const totalHealthcareCost = doctorVisitCost + totalHospitalizationCost + medications + diagnostics;
    
    // After deductible
    const costAfterDeductible = Math.max(0, totalHealthcareCost - plan.deductible);
    
    // Insurance coverage
    const insurancePays = costAfterDeductible * (plan.coveragePercent / 100);
    
    // Patient pays (co-pay)
    let patientPays = costAfterDeductible - insurancePays;
    
    // Apply co-pay percentage
    if (plan.coPayPercent > 0) {
      patientPays = costAfterDeductible * (plan.coPayPercent / 100);
    }
    
    // Cap at max out of pocket
    const outOfPocket = Math.min(patientPays + plan.deductible, plan.maxOutOfPocket);
    
    // Total annual cost
    const totalAnnualCost = annualPremium + outOfPocket;
    
    return {
      annualPremium,
      deductible: plan.deductible,
      outOfPocket,
      totalAnnualCost,
      insurancePays,
      totalHealthcareCost,
      savings: totalHealthcareCost - totalAnnualCost
    };
  };

  const results = selectedPlan ? calculateCosts() : null;

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Annual Cost Calculator
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estimate your total healthcare costs including premiums, co-pays, and out-of-pocket expenses
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Your Healthcare Details</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="plan" className="text-foreground">Select Insurance Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger id="plan" className="mt-2">
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ayushman">Ayushman Bharat PM-JAY</SelectItem>
                    <SelectItem value="cghs">CGHS</SelectItem>
                    <SelectItem value="esis">ESIS</SelectItem>
                    <SelectItem value="rsby">RSBY</SelectItem>
                    <SelectItem value="budget">Budget Care (Private)</SelectItem>
                    <SelectItem value="essential">Essential Care (Private)</SelectItem>
                    <SelectItem value="family">Family Shield (Private)</SelectItem>
                    <SelectItem value="premium">Premium Plus (Private)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="visits" className="text-foreground">Expected Doctor Visits/Year</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average cost per visit: ₹500</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="visits"
                  type="number"
                  value={doctorVisits}
                  onChange={(e) => setDoctorVisits(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="hospitalizations" className="text-foreground">Expected Hospitalizations/Year</Label>
                </div>
                <Input
                  id="hospitalizations"
                  type="number"
                  value={hospitalizations}
                  onChange={(e) => setHospitalizations(Number(e.target.value))}
                  min="0"
                />
              </div>

              {hospitalizations > 0 && (
                <div>
                  <Label htmlFor="hospCost" className="text-foreground">Average Hospitalization Cost (₹)</Label>
                  <Input
                    id="hospCost"
                    type="number"
                    value={avgHospitalCost}
                    onChange={(e) => setAvgHospitalCost(Number(e.target.value))}
                    min="0"
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="medications" className="text-foreground">Annual Medication Costs (₹)</Label>
                <Input
                  id="medications"
                  type="number"
                  value={medications}
                  onChange={(e) => setMedications(Number(e.target.value))}
                  min="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="diagnostics" className="text-foreground">Annual Diagnostic Tests (₹)</Label>
                <Input
                  id="diagnostics"
                  type="number"
                  value={diagnostics}
                  onChange={(e) => setDiagnostics(Number(e.target.value))}
                  min="0"
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={() => setShowResults(true)}
                className="w-full"
                disabled={!selectedPlan}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Total Cost
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Cost Breakdown</h3>
            
            {!selectedPlan || !showResults ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Select a plan and click "Calculate" to see your estimated annual costs
                </p>
              </div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
                  <p className="text-lg font-bold text-foreground">{plans[selectedPlan].name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plans[selectedPlan].type === "government" ? "Government Scheme" : "Private Insurance"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-foreground">Annual Premium</span>
                    <span className="font-semibold text-foreground">₹{results.annualPremium.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-foreground">Total Healthcare Costs</span>
                    <span className="font-semibold text-foreground">₹{results.totalHealthcareCost.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-foreground">Deductible</span>
                    <span className="font-semibold text-foreground">₹{results.deductible.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-green-600">Insurance Pays</span>
                    <span className="font-semibold text-green-600">₹{results.insurancePays.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-orange-600">Your Out-of-Pocket</span>
                    <span className="font-semibold text-orange-600">₹{results.outOfPocket.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total Annual Cost</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{results.totalAnnualCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {results.savings > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 dark:text-green-200 font-semibold">Your Savings</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          ₹{results.savings.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                        Amount saved by having insurance coverage
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 p-4 rounded-lg mt-6">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> This is an estimate based on typical costs. Actual costs may vary based on 
                    specific treatments, hospital charges, and policy terms. Always verify with your insurance provider.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CostCalculator;
