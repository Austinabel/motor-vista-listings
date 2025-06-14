
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Shield, CheckCircle, AlertCircle, Phone } from "lucide-react";

const insuranceProviders = [
  {
    name: "AIICO Insurance",
    rating: 4.5,
    features: ["Comprehensive Coverage", "Third Party", "Fire & Theft"],
    contact: "0800-123-4567"
  },
  {
    name: "Leadway Assurance",
    rating: 4.3,
    features: ["Motor Insurance", "Fleet Coverage", "Online Claims"],
    contact: "0800-765-4321"
  },
  {
    name: "AXA Mansard",
    rating: 4.7,
    features: ["Quick Claims", "24/7 Support", "Roadside Assistance"],
    contact: "0800-987-6543"
  }
];

const insuranceTypes = [
  {
    type: "Third Party",
    description: "Covers damage to other people's property and injuries",
    price: "From ₦15,000/year",
    features: ["Legal requirement", "Basic coverage", "Affordable"]
  },
  {
    type: "Third Party Fire & Theft",
    description: "Includes fire damage and theft protection",
    price: "From ₦25,000/year",
    features: ["Fire coverage", "Theft protection", "Third party coverage"]
  },
  {
    type: "Comprehensive",
    description: "Full coverage including your own vehicle damage",
    price: "From ₦50,000/year",
    features: ["Own damage", "All third party benefits", "Windscreen cover"]
  }
];

const Insurance = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <Shield className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Car Insurance Guide</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Compare insurance options and find the best coverage for your vehicle
            </p>
          </div>

          {/* Insurance Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Types of Car Insurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insuranceTypes.map((insurance, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{insurance.type}</CardTitle>
                    <p className="text-blue-600 font-semibold">{insurance.price}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{insurance.description}</p>
                    <ul className="space-y-2">
                      {insurance.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Insurance Providers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Insurance Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insuranceProviders.map((provider, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{provider.name}</CardTitle>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{provider.rating}/5</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {provider.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Phone className="h-4 w-4 mr-2" />
                      {provider.contact}
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Get Quote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Insurance Tips */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Insurance Tips</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                      Before You Buy
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Compare quotes from multiple providers</li>
                      <li>• Check the insurer's claim settlement ratio</li>
                      <li>• Read policy terms and conditions carefully</li>
                      <li>• Consider your driving history and risk factors</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Money Saving Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Install anti-theft devices for discounts</li>
                      <li>• Maintain a clean driving record</li>
                      <li>• Consider higher deductibles to lower premiums</li>
                      <li>• Bundle with other insurance policies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Insurance;
