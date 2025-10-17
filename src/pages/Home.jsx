import React from "react";
import { assets } from "../assets/assets";
import { useReviewContext } from "../context/ReviewContext";

const Home = () => {
  const { reviews, isLoading } = useReviewContext();

  return (
    <div className="font-sans text-gray-800">
      <section
        className="relative bg-cover bg-center h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${assets.pets_home})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to PetPulse
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Connecting loving pets with caring homes
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Why Choose PetPulse?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-2xl font-semibold mb-4">Trusted Adoptions</h3>
              <p>
                Every pet listed is verified to ensure a safe and happy home for
                your new friend.
              </p>
            </div>
            <div className="bg-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-2xl font-semibold mb-4">Trusted Care Appointments</h3>
              <p>
                Our trusted care appointments ensure every pet receives expert attention,
                keeping them happy, healthy, and ready for adoption.
              </p>
            </div>
            <div className="bg-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-2xl font-semibold mb-4">Pet Health Tips</h3>
              <p>
                Access expert advice and tips to keep your pets healthy and
                thriving.
              </p>
            </div>
            <div className="bg-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
              <h3 className="text-2xl font-semibold mb-4">Community Support</h3>
              <p>
                Join a community of passionate pet lovers and share your
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pet Showcase Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Meet Our Lovely Pets
        </h2>
        <img src={assets.pets_home2} alt="Our pets..." className="w-screen" />
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={review._id || index} className="bg-green-200 p-6 rounded-2xl shadow-lg">
                  <p className="mb-4">"{review.testimonial}"</p>
                  <h4 className="font-bold">- {review.name}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-16 bg-primary text-gray-900 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Find Your New Friend?</h2>
      </section>
    </div>
  );
};

export default Home;
