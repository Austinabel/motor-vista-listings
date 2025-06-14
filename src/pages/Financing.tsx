
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CreditCard, Calculator, TrendingUp, AlertTriangle } from "lucide-react";

const lenders = [
  {
    name: "First Bank Auto Loan",
    interestRate: "12-18%",
    maxTenure: "7 years",
    features: ["Quick approval", "Flexible repayment", "Competitive rates"],
    requirement: "Minimum monthly income: ₦100,000"
  },
  {
    name: "GTBank Auto Finance",
    interestRate: "15-20%",
    maxTenure: "5 years",
    features: ["Online application", "Same day approval", "No hidden charges"],
    requirement: "Minimum monthly income: ₦150,000"
  },
  {
    name: "Zenith Bank Car Loan",
    interestRate: "14-19%",
    maxTenure: "6 years",
    features: ["Low down payment", "Insurance inclusive", "Fast processing"],
    requirement: "Minimum monthly income: ₦120,000"
  }
];

const financingTips = [
  {
    title: "Check Your Credit Score",
    description: "A good credit score can help you get better interest rates and loan terms.",
    icon: TrendingUp
  },
  {
    title: "Shop Around",
    description: "Compare offers from multiple lenders to find the best deal for your situation.",
    icon: Calculator
  },
  {
    title: "Consider Down Payment",
    description: "A larger down payment reduces your loan amount and monthly payments.",
    icon: CreditCard
  },
  {
    title: "Understand Total Cost",
    description: "Look beyond monthly payments and consider the total cost of the loan.",
    icon: AlertTriangle
  }
];

const Financing = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <CreditCard className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Car Financing Guide</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find the best financing options to make your dream car affordable
            </p>
          </div>

          {/* Financing Options */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Financing Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lenders.map((lender, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{lender.name}</CardTitle>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Rate:</span> {lender.interestRate}</p>
                      <p><span className="font-semibold">Max Tenure:</span> {lender.maxTenure}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {lender.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-600 mb-4">{lender.requirement}</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Financing Calculator */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Loan Calculator</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Calculate Your Monthly Payment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Car Price (₦)</label>
                        <input 
                          type="number" 
                          placeholder="10,000,000"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Down Payment (₦)</label>
                        <input 
                          type="number" 
                          placeholder="2,000,000"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                        <input 
                          type="number" 
                          placeholder="15"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
                        <input 
                          type="number" 
                          placeholder="5"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Calculate Payment
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Estimated Monthly Payment</h3>
                    <div className="bg-gray-100 p-6 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600 mb-2">₦185,000</p>
                      <p className="text-sm text-gray-600">Monthly payment estimate</p>
                    </div>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span>₦8,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest:</span>
                        <span>₦3,100,000</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>₦11,100,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Financing Tips */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Financing Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {financingTips.map((tip, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <tip.icon className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="font-semibold mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Financing;
