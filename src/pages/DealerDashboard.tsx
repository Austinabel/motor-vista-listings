
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const DealerDashboard = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Dealer Dashboard</h1>
            <Link to="/sell">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                List a New Car
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Welcome to your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Here you can manage your car listings, view analytics, and more.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DealerDashboard;
