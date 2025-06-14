
import { Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Favorites = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-600" />
              <span>My Favorites</span>
            </CardTitle>
            <CardDescription>
              View and manage your favorite car listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-500 mb-6">
                Start exploring cars and save your favorites by clicking the heart icon on any listing.
              </p>
              <a
                href="/cars"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Browse Cars
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Favorites;
