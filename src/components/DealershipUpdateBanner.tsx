import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DealershipUpdateBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Building className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-red-700">New Dealership Program!</h3>
                <Badge className="bg-red-600 hover:bg-red-700">
                  <Star className="w-3 h-3 mr-1" />
                  Updated
                </Badge>
              </div>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">₦45,000 one-time payment</span> - Get verified dealer status with 20 FREE car listings included!
              </p>
              <p className="text-sm text-gray-600">
                After your free listings, pay only per listing or choose our monthly subscription plans. 
                No annual fees - just pay for what you use!
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={() => navigate('/dealer-registration')}
              className="bg-red-600 hover:bg-red-700"
            >
              Join Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};