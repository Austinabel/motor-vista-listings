
import { Footer } from "@/components/Footer";
import { Car, Shield, Users, Award } from "lucide-react";

const About = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">About Motorcars.ng</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Motorcars.ng is Nigeria's premier online automotive marketplace, connecting car buyers with verified dealers across the country. Since our inception, we've been committed to revolutionizing the car buying and selling experience in Nigeria.
              </p>
              
              <p className="text-gray-700 mb-6">
                Our platform provides a secure, transparent, and efficient way for Nigerians to buy and sell vehicles. Whether you're looking for a brand new car, a reliable used vehicle, or want to sell your current car, Motorcars.ng is your trusted partner in the automotive journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Car className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Wide Selection</h3>
                <p className="text-gray-600">Thousands of vehicles from verified dealers across Nigeria</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Verified Dealers</h3>
                <p className="text-gray-600">All our dealers are thoroughly vetted and verified for your safety</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Customer First</h3>
                <p className="text-gray-600">24/7 customer support to assist you throughout your journey</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Award className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Trusted Platform</h3>
                <p className="text-gray-600">Nigeria's most trusted automotive marketplace</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-6">
                To make car buying and selling in Nigeria transparent, secure, and accessible to everyone. We believe every Nigerian deserves access to reliable transportation and fair automotive transactions.
              </p>
              
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-700">
                To be the leading automotive marketplace in West Africa, setting the standard for online vehicle transactions and customer service excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
