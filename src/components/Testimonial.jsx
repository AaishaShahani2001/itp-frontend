import React from "react";
import Title from "./Title";
import { useReviewContext } from "../context/ReviewContext";

const Star = ({ filled }) => (
  <svg className="w-4 h-4 text-yellow-400" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25l-6.16 3.73 1.64-7.03L2.5 9.77l7.19-.61L12 2.5l2.31 6.66 7.19.61-5 4.18 1.64 7.03z" />
  </svg>
);

const Testimonial = () => {
  const { reviews, isLoading } = useReviewContext();

  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">
      <Title title="What Our Customers Say" subTitle="See what our users think about their pet adoption experience." />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-18">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to share your experience!</p>
              </div>
            </div>
          ) : (
            reviews.map((testimonial, index) => (
              <div key={testimonial._id || index} className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                    {testimonial.userImage ? (
                      <img 
                        src={testimonial.userImage} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <Star key={idx} filled={testimonial.rating > idx} />
                    ))}
                  <span className="text-sm text-gray-500 ml-2">({testimonial.rating}/5)</span>
                </div>
                
                <p className="text-gray-600 leading-relaxed">"{testimonial.testimonial}"</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Testimonial;
