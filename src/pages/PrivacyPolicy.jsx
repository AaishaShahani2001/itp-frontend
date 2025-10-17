import React from "react";
import Title from "../components/Title";

const PrivacyPolicy = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 mb-20 text-gray-700">
      <Title title="Privacy Policy" subTitle="How we protect your information" align="left" />

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg mt-8 space-y-6">
        <p>
          At <strong>Your Pet Adoption and Caring Site</strong>, your privacy is very important to us. This Privacy Policy explains what information we collect, how we use it, and how we protect your personal data when you use our services.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">1. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Personal information such as name, email, phone number, and address when you create an account or fill adoption forms.</li>
            <li>Pet preferences, adoption history, and inquiries submitted through our forms.</li>
            <li>Technical information such as IP address, browser type, and device details for analytics and site improvement.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To process pet adoption requests and communicate with you regarding your adoption or inquiries.</li>
            <li>To improve our website, services, and user experience.</li>
            <li>To send promotional emails, updates, or newsletters (only if you opt-in).</li>
            <li>To comply with legal obligations and prevent fraud or misuse of our services.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">3. Sharing Your Information</h2>
          <p>We do not sell or rent your personal information. We may share your data with:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Authorized pet care partners to facilitate the adoption process.</li>
            <li>Service providers helping us with analytics, website hosting, and email communication.</li>
            <li>When required by law or to protect our rights, users, or pets.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">4. Cookies and Tracking</h2>
          <p>We may use cookies and similar technologies to improve your experience, analyze traffic, and personalize content. You can disable cookies in your browser settings, but some features may not work properly.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">5. Your Rights</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You can access, update, or delete your personal information by contacting us.</li>
            <li>You can opt-out of marketing emails at any time using the unsubscribe link.</li>
            <li>You can request the removal of your information from our system where legally applicable.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">6. Security</h2>
          <p>We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">7. Changes to this Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated date. We encourage you to review this page periodically.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-primary pl-3">8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: <a href="mailto:info@yourpetadoption.com" className="text-blue-500 underline">info@yourpetadoption.com</a></p>
          <p>Phone: +94 123 456 7890</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
