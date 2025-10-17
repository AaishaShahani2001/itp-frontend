import React from 'react';
import { LuMapPin, LuPhone, LuMail, LuHeadphones, LuClock, LuMessageCircle } from "react-icons/lu";

const brandColor = "#3DED97";

const IconWrap = ({ children }) => (
  <div
    className="w-12 h-12 rounded-2xl grid place-items-center mx-auto"
    style={{
      background: `${brandColor}22`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    }}
  >
    <div className="text-4xl" style={{ color: brandColor }}>
      {children}
    </div>
  </div>
);

export default function ContactUs() {

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Get In Touch</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              We're here to help you and your pets! Whether you have questions about adoption, 
              need support with our services, or want to share feedback, we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Information</h2>
            <p className="text-xl text-gray-600">Choose the best way to reach us</p>
      </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Address */}
            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
          <IconWrap>
            <LuMapPin />
          </IconWrap>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Visit Us</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                123 Pet Care Avenue<br />
                Colombo 07, Sri Lanka<br />
                <span className="text-sm text-gray-500">Near Independence Square</span>
          </p>
        </div>

        {/* Phone */}
            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
          <IconWrap>
            <LuPhone />
          </IconWrap>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Call Us</h3>
              <div className="mt-4 space-y-2">
                <a href="tel:+94712345678" className="block text-gray-700 hover:text-primary transition-colors">
              +94 71 234 5678
            </a>
                <a href="tel:+94112345678" className="block text-gray-700 hover:text-primary transition-colors">
              +94 11 234 5678
            </a>
                <p className="text-sm text-gray-500 mt-2">Mon-Sat: 8 AM - 8 PM</p>
          </div>
        </div>

        {/* Email */}
            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
          <IconWrap>
            <LuMail />
          </IconWrap>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Email Us</h3>
              <div className="mt-4 space-y-2">
                <a href="mailto:support@petpulse.lk" className="block text-gray-700 hover:text-primary transition-colors">
                  support@petpulse.lk
                </a>
                <a href="mailto:info@petpulse.lk" className="block text-gray-700 hover:text-primary transition-colors">
                  info@petpulse.lk
                </a>
                <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
          </div>
        </div>

        {/* Customer Care */}
            <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
          <IconWrap>
            <LuHeadphones />
          </IconWrap>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Live Support</h3>
              <p className="mt-4 text-gray-600">
                Available: 8 AM – 8 PM (Mon–Sat)<br />
                <span className="text-primary font-semibold">Live Chat: 24/7</span>
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Business Hours Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Business Hours</h2>
            <p className="text-xl text-gray-600">We're here when you need us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LuClock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Main Office</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LuPhone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Phone Support</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Monday - Saturday:</strong> 8:00 AM - 8:00 PM</p>
                <p><strong>Sunday:</strong> 10:00 AM - 4:00 PM</p>
                <p><strong>Emergency:</strong> 24/7 Available</p>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LuMessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Online Support</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Live Chat:</strong> 24/7 Available</p>
                <p><strong>Email Response:</strong> Within 24 hours</p>
                <p><strong>Social Media:</strong> Always Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Social Media & Community Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Stay connected with us and other pet lovers! Follow us on social media for updates, 
            pet care tips, and community stories.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">📘</div>
              <h3 className="text-xl font-semibold mb-2">Facebook</h3>
              <p className="text-sm opacity-90">@PetPulseSL</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">Instagram</h3>
              <p className="text-sm opacity-90">@petpulse_sl</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">🐦</div>
              <h3 className="text-xl font-semibold mb-2">Twitter</h3>
              <p className="text-sm opacity-90">@PetPulseSL</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm opacity-90">+94 71 234 5678</p>
            </div>
          </div>
        </div>
      </section>
      </div>
  );
}