
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Star } from "lucide-react";

export const DownloadApp = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold mb-6">Download Our App</h2>
            <p className="text-xl text-gray-600 mb-8">
              Get the best car buying experience on your mobile device. Browse, compare, and connect with dealers on the go.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-red-600" />
                </div>
                <span>Browse thousands of verified cars</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-red-600" />
                </div>
                <span>Connect directly with dealers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-red-600" />
                </div>
                <span>Get instant notifications</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <Download className="mr-2 h-5 w-5" />
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                <Download className="mr-2 h-5 w-5" />
                Download for Android
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <Card className="p-8 shadow-2xl">
              <div className="flex items-center justify-center w-48 h-80 bg-gray-900 rounded-3xl relative overflow-hidden">
                <Smartphone className="h-32 w-32 text-white opacity-20" />
                <div className="absolute inset-4 bg-gradient-to-b from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold mb-2">motorcars.ng</div>
                    <div className="text-sm opacity-80">Your trusted car marketplace</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
