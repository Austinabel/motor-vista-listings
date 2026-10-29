
import { Zap, TrendingUp, Eye, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BoostSales = () => {
  const boostOptions = [
    {
      title: "Featured Listing",
      description: "Make your listing stand out at the top of search results",
      price: "₦5,000",
      duration: "7 days",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      features: ["Top placement in search", "Special badge", "3x more views"]
    },
    {
      title: "Premium Spotlight",
      description: "Get maximum visibility with homepage feature",
      price: "₦10,000",
      duration: "14 days",
      icon: <Eye className="h-8 w-8 text-primary" />,
      features: ["Homepage spotlight", "Social media promotion", "5x more views", "Priority in search"]
    },
    {
      title: "Targeted Promotion",
      description: "Reach specific buyers interested in your car type",
      price: "₦15,000",
      duration: "30 days",
      icon: <Target className="h-8 w-8 text-primary" />,
      features: ["Targeted email campaigns", "Push notifications", "Social media ads", "10x more qualified leads"]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span>Boost Your Sales</span>
            </CardTitle>
            <CardDescription>
              Increase your car's visibility and sell faster with our promotional packages.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boostOptions.map((option, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{option.price}</div>
                    <div className="text-sm text-muted-foreground">for {option.duration}</div>
                  </div>
                  
                  <ul className="space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Select Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">Need help choosing?</h3>
              <p className="text-muted-foreground mb-4">
                Email us at support@motorcars.ng to discuss promoting your listing.
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-accent">
                Contact Sales Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BoostSales;
