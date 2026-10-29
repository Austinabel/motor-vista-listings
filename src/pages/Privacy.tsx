
import { Footer } from "@/components/Footer";

import { usePageMeta } from "@/hooks/usePageMeta";
const Privacy = () => {
  usePageMeta({ title: "Privacy policy" });
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <p className="text-gray-600 mb-6">
                  <strong>Last updated:</strong> January 2025
                </p>
                <p className="text-gray-700">
                  This Privacy Policy describes how Motorcars.ng collects, uses, and protects your personal information when you use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-3">We collect information you provide directly to us, such as:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Personal information (name, email, phone number)</li>
                  <li>Account information and preferences</li>
                  <li>Vehicle listing information</li>
                  <li>Communication records</li>
                  <li>Payment information (processed securely by third parties)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700 mb-3">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Provide and maintain our services</li>
                  <li>Process transactions and communications</li>
                  <li>Send you updates and promotional materials</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
                <p className="text-gray-700">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with verified dealers when you express interest in their vehicles, and with service providers who help us operate our platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking</h2>
                <p className="text-gray-700">
                  We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                <p className="text-gray-700 mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Data portability</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Third-Party Links</h2>
                <p className="text-gray-700">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our services are not intended for children under 18. We do not knowingly collect personal information from children under 18.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Changes to Privacy Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at privacy@motorcars.ng or +234 800 MOTOR (66867).
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

export default Privacy;
