
import { Footer } from "@/components/Footer";

import { usePageMeta } from "@/hooks/usePageMeta";
const Terms = () => {
  usePageMeta({ title: "Terms of service" });
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-600 mb-6">
                  <strong>Last updated:</strong> January 2025
                </p>
                <p className="text-gray-700">
                  Welcome to Motorcars.ng. These Terms of Service ("Terms") govern your use of our website and services. By using our platform, you agree to these terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using Motorcars.ng, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                <p className="text-gray-700 mb-3">
                  Permission is granted to temporarily download one copy of the materials on Motorcars.ng for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <p className="text-gray-700">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Vehicle Listings</h2>
                <p className="text-gray-700">
                  Users may list vehicles for sale subject to our listing policies. All listings must be accurate and truthful. We reserve the right to remove any listing that violates our policies or terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Dealer Verification</h2>
                <p className="text-gray-700">
                  While we verify our dealers, we do not guarantee the quality of their services or vehicles. Users should conduct their own due diligence before making any purchase.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Prohibited Uses</h2>
                <p className="text-gray-700 mb-3">You may not use our service:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>For any unlawful purpose</li>
                  <li>To post false or misleading information</li>
                  <li>To harass, abuse, or harm others</li>
                  <li>To spam or send unsolicited communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-700">
                  Motorcars.ng shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
                <p className="text-gray-700">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Contact Information</h2>
                <p className="text-gray-700">
                  If you have any questions about these Terms of Service, please contact us at support@motorcars.ng or +234 800 MOTOR (66867).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
