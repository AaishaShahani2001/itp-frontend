import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useReviewContext } from "../context/ReviewContext";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

const RatingForm = () => {
  const { token, userData } = useAppContext();
  const { myReview, submitReview, updateReview, fetchMyReview } = useReviewContext();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's existing review if any
  useEffect(() => {
    if (token) {
      fetchMyReview();
    }
  }, [token]);

  // Populate form with existing review data
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setReview(myReview.testimonial);
      setName(myReview.name);
      setLocation(myReview.location);
    } else if (userData) {
      setName(userData.name || "");
      setLocation(userData.location || "");
    }
  }, [myReview, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    if (!rating || !review.trim() || !name.trim() || !location.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      name: name.trim(),
      location: location.trim(),
      rating,
      testimonial: review.trim(),
    };

    try {
      let result;
      if (myReview) {
        result = await updateReview(reviewData);
      } else {
        result = await submitReview(reviewData);
      }

      if (result.success) {
        toast.success(result.message);
        if (!myReview) {
          setRating(0);
          setReview("");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Share Your Experience</h2>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your location"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`w-8 h-8 text-2xl transition-all duration-200 ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-400`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating === 0 ? "Select a rating" : 
               rating === 1 ? "Poor" :
               rating === 2 ? "Fair" :
               rating === 3 ? "Good" :
               rating === 4 ? "Very Good" : "Excellent"}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Share your experience with our pet adoption service..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingForm;
