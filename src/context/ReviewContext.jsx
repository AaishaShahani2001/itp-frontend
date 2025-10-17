import { createContext, useContext, useState, useEffect } from "react";
import { useAppContext } from "./AppContext";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { axios, backendUrl, token } = useAppContext();

  // Fetch all approved reviews
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/user/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's own review
  const fetchMyReview = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/my-review`, {
        headers: { token }
      });
      if (response.data.success) {
        setMyReview(response.data.review);
      }
    } catch (error) {
      console.error("Error fetching my review:", error);
    }
  };

  // Submit a new review
  const submitReview = async (reviewData) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/submit-review`, reviewData, {
        headers: { token }
      });
      if (response.data.success) {
        setMyReview(response.data.review);
        // Refresh reviews list
        await fetchReviews();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to submit review" 
      };
    }
  };

  // Update user's review
  const updateReview = async (reviewData) => {
    try {
      const response = await axios.put(`${backendUrl}/api/user/update-review`, reviewData, {
        headers: { token }
      });
      if (response.data.success) {
        setMyReview(response.data.review);
        // Refresh reviews list
        await fetchReviews();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error("Error updating review:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to update review" 
      };
    }
  };

  // Delete user's review
  const deleteReview = async () => {
    try {
      const response = await axios.delete(`${backendUrl}/api/user/delete-review`, {
        headers: { token }
      });
      if (response.data.success) {
        setMyReview(null);
        // Refresh reviews list
        await fetchReviews();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to delete review" 
      };
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <ReviewContext.Provider value={{ 
      reviews, 
      myReview,
      isLoading,
      fetchReviews,
      fetchMyReview,
      submitReview,
      updateReview,
      deleteReview
    }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => useContext(ReviewContext);
