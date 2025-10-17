import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-white min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">About Our Pet Care Platform</h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              We're revolutionizing pet care by connecting loving pet owners with comprehensive services, 
              making pet adoption, healthcare, and daily care seamless and joyful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#mission"
                className="inline-block bg-white text-green-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all text-lg"
              >
                Our Mission
              </a>
              <a
                href="#services"
                className="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-green-600 transition-all text-lg"
              >
                Our Services
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={assets.pets_n}
              alt="About Hero"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To create a comprehensive ecosystem where every pet receives the love, care, and attention they deserve. 
                We believe that pets are family, and our platform ensures they get the best possible care throughout their lives.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From adoption to daily care, veterinary services to grooming, we're here to support both pets and their 
                owners every step of the way.
              </p>
            </div>
            <div className="bg-primary/10 p-8 rounded-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To become the leading platform that transforms how people care for their pets, creating a world where 
                every pet has a loving home and access to quality care services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">Our Comprehensive Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <img src={assets.petIcon} alt="Adoption" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Pet Adoption</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with loving pets in need of homes through our verified adoption network.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <img src={assets.calendar} alt="Veterinary" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Veterinary Care</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional veterinary services and health checkups for your beloved pets.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <img src={assets.food} alt="Grooming" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Grooming Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional grooming and spa services to keep your pets looking and feeling their best.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <img src={assets.calendar} alt="Daycare" className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Pet Daycare</h3>
              <p className="text-gray-600 leading-relaxed">
                Safe and fun daycare services for when you need reliable pet care during the day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Compassion</h3>
              <p className="text-gray-600 leading-relaxed">
                Every decision we make is guided by our deep love and respect for animals and their well-being.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Trust & Safety</h3>
              <p className="text-gray-600 leading-relaxed">
                We maintain the highest standards of safety and verification to ensure secure experiences for all.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                We foster a supportive community where pet owners, caregivers, and service providers work together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">Meet Our Amazing Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              { name: 'Aaisha', role: 'Platform Director' },
              { name: 'Kushani', role: 'Tech Lead' },
              { name: 'Silomy', role: 'Community Manager' },
              { name: 'Dilush', role: 'Product Designer' },
              { name: 'Mithujaan', role: 'Operations Head' }
            ].map((member, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
                <img
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full mb-4 object-cover border-4 border-primary/20"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join Our Pet Care Community?</h2>
          <p className="text-xl mb-8 leading-relaxed">
            Whether you're looking to adopt a pet, need care services, or want to help pets in need, 
            we're here to support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/PetList"
              className="inline-block bg-white text-green-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all text-lg"
            >
              Browse Pets
            </a>
            <a
              href="/careservice"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-green-600 transition-all text-lg"
            >
              View Services
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-green-600 transition-all text-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;