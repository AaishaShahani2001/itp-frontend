import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react"; // QR code generator

const MyAdoptions = () => {
  const { axios, token, currency, backendUrl, userData } = useAppContext();
  const navigate = useNavigate();
  const [adoptionDetail, setAdoptionDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    address: "",
    age: "",
    child: "",
    reason: "",
    phone: "",
    occupation: "",
    experience: "",
    livingSpace: "",
    otherPets: "",
    timeCommitment: "",
    emergencyContact: "",
  });

  // Fetch Adoptions
  const fetchMyAdoptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/adoption/user`, {
        headers: { token },
      });

      if (response.data.success) {
        setAdoptionDetail(response.data.adoptions || []);
      } else {
        setError(response.data.message || "Failed to fetch adoptions");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit form
  const handleEditClick = (adoption) => {
    setEditData({
      id: adoption._id,
      name: adoption.name || "",
      address: adoption.address || "",
      age: adoption.age || "",
      child: adoption.child || "",
      reason: adoption.reason || "",
      phone: adoption.phone || "",
      occupation: adoption.occupation || "",
      experience: adoption.experience || "",
      livingSpace: adoption.livingSpace || "",
      otherPets: adoption.otherPets || "",
      timeCommitment: adoption.timeCommitment || "",
      emergencyContact: adoption.emergencyContact || "",
    });
    setIsEditOpen(true);
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendUrl}/api/adoption/edit-adoption/${editData.id}`,
        {
          name: editData.name,
          address: editData.address,
          age: editData.age,
          child: editData.child,
          reason: editData.reason,
          phone: editData.phone,
          occupation: editData.occupation,
          experience: editData.experience,
          livingSpace: editData.livingSpace,
          otherPets: editData.otherPets,
          timeCommitment: editData.timeCommitment,
          emergencyContact: editData.emergencyContact,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Adoption updated successfully!");
        setIsEditOpen(false);
        fetchMyAdoptions();
      } else {
        toast.error(response.data.message || "Failed to update adoption");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Cancel adoption
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this adoption?")) return;
    try {
      const response = await axios.delete(
        `${backendUrl}/api/adoption/delete-adoption/${id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Adoption canceled!");
        fetchMyAdoptions();
      } else {
        toast.error(response.data.message || "Failed to cancel adoption");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handlePay = (adoption) => {
    // Create order object for upload slip page
    const order = {
      currency: currency,
      subtotal: adoption.price || 0,
      items: [{
        id: adoption._id,
        service: "adoption",
        title: `Adoption - ${adoption.pet?.species} ${adoption.pet?.breed}`,
        basePrice: adoption.price || 0,
        lineTotal: adoption.price || 0,
        extras: []
      }],
      note: "Please upload a clear image/PDF of your bank transfer slip for adoption payment.",
      adoptionId: adoption._id
    };

    // Navigate to upload slip page with order data
    navigate("/payments/upload-slip", { state: { order } });
  };

  useEffect(() => {
    if (userData && token) {
      fetchMyAdoptions();
    } else {
      setError("User not authenticated");
      setIsLoading(false);
    }
  }, [userData, token]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mb-20">
      <Title title="My Adoptions" subTitle="View and manage your adoptions" align="left" />

      <div>
        {adoptionDetail.length === 0 ? (
          <p className="mt-12">No adoptions found.</p>
        ) : (
          adoptionDetail.map((adoption, index) => {
            const isCompleted = adoption.status === "completed" || adoption.status === "approved" || adoption.status === "rejected";

            return (
              <div
                key={adoption._id}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
              >
                {/* Pet Info */}
                <div className="md:col-span-1">
                  <div className="rounded-md overflow-hidden mb-3">
                    <img
                      src={adoption.pet?.image || ""}
                      alt={adoption.pet?.breed || "Pet"}
                      className="w-full h-auto aspect-video object-cover"
                    />
                  </div>
                  <p className="text-lg font-medium mt-2">{adoption.pet?.breed || "Unknown Breed"}</p>
                  <p className="text-gray-500">{adoption.pet?.species || "Unnamed"}</p>

                  
                    {/* Only show Pay button if adoption is approved */}
                    {adoption.status === "approved" && (
                      <button
                        className={`mt-5 border border-blue-500 px-12 py-2 rounded-full transition-all ${
                        adoption.isPaid
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "hover:bg-blue-500 hover:text-white"
                        }`}
                        disabled={adoption.isPaid}
                        onClick={() => handlePay(adoption)}
                        >
                        {adoption.isPaid ? 'Paid' : 'Pay'}
                      </button>
                    )}
                    
                    {/* Show status messages for non-approved adoptions */}
                    {adoption.status === "pending" && (
                      <div className="mt-5 text-center">
                        <p className="text-sm text-orange-600 font-medium">Awaiting Admin Approval</p>
                        <p className="text-xs text-gray-500 mt-1">Payment will be available after approval</p>
                      </div>
                    )}
                    
                    {adoption.status === "rejected" && (
                      <div className="mt-5 text-center">
                        <p className="text-sm text-red-600 font-medium">Application Rejected</p>
                        <p className="text-xs text-gray-500 mt-1">Payment not available for rejected adoptions</p>
                      </div>
                    )}
                </div>

                {/* Adoption Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <p className="px-3 py-1.5 bg-light rounded">Adoption #{index + 1}</p>
                    <p
                      className={`px-3 py-1 text-xs rounded-full ${
                        adoption.status === "pending"
                          ? "bg-orange-400/15 text-orange-600"
                          : adoption.status === "approved"
                          ? "bg-green-400/15 text-green-600"
                          : adoption.status === "completed"
                          ? "bg-blue-400/15 text-blue-600"
                          : "bg-red-400/15 text-red-600"
                      }`}
                    >
                      {adoption.status === "pending" ? "Pending" : 
                       adoption.status === "approved" ? "Approved" :
                       adoption.status === "completed" ? "Completed" :
                       "Rejected"}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 mt-5">
                    <img src={assets.calendar} alt="" className="w-4 h-4 mt-1" />
                    <div>
                      <p>Adoption date:</p>
                      <p>{new Date(adoption.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mt-3">
                    <img src={assets.calendar} alt="" className="w-4 h-4 mt-1" />
                    <div>
                      <p>Your appointment date:</p>
                      <p>
                        {adoption.visit
                          ? new Date(adoption.visit).toLocaleDateString()
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex flex-col justify-between gap-4">
                  {/* QR Code */}
                  <div className="flex flex-col items-end mr-4">
                    <p className="text-xs mb-1">Scan QR for details</p>
                    <QRCodeCanvas
                      value={`https://itp-frontend.onrender.com/adoption/details/${adoption._id}`}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="text-sm text-gray-500 text-right mr-6">
                    <p>{adoption.isPaid ? 'Paid amount' : 'Amount to be pay'}</p>
                    <h1 className="text-2xl font-semibold text-primary">
                      {currency} {adoption.price || 0}
                    </h1>
                  </div>

                  <div className="flex gap-5">
                    <button
                      className={`border border-primary px-5 py-2 rounded-full transition-all ${
                        isCompleted
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:bg-primary hover:text-white"
                      }`}
                      onClick={() => handleEditClick(adoption)}
                      disabled={isCompleted}
                    >
                      Edit
                    </button>

                    <button
                      className={`border border-red-700 px-5 py-2 rounded-full transition-all ${
                        isCompleted
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "hover:bg-red-400 hover:text-white"
                      }`}
                      onClick={() => handleCancel(adoption._id)}
                      disabled={isCompleted}
                    >
                      Cancel
                    </button>
                  </div>

                  {isCompleted && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed, approved and rejected adoption cannot be edited or cancelled
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <form onSubmit={handleEditSubmit} className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit Adoption</h2>
                  <p className="text-gray-600 mt-1">Update your adoption application details</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="07XXXXXXXX"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Age</label>
                      <input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        min="18"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Occupation</label>
                      <input
                        type="text"
                        value={editData.occupation}
                        onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Address</label>
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Emergency Contact</label>
                      <input
                        type="tel"
                        value={editData.emergencyContact}
                        onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="07XXXXXXXX"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pet Care Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Pet Care Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Pet Experience Level</label>
                      <select
                        value={editData.experience}
                        onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select experience level</option>
                        <option value="none">No experience</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Living Space</label>
                      <select
                        value={editData.livingSpace}
                        onChange={(e) => setEditData({ ...editData, livingSpace: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select living space</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="farm">Farm</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Other Pets</label>
                      <select
                        value={editData.otherPets}
                        onChange={(e) => setEditData({ ...editData, otherPets: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select option</option>
                        <option value="none">No other pets</option>
                        <option value="dogs">Dogs</option>
                        <option value="cats">Cats</option>
                        <option value="other">Other animals</option>
                        <option value="multiple">Multiple types</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Time Commitment</label>
                      <select
                        value={editData.timeCommitment}
                        onChange={(e) => setEditData({ ...editData, timeCommitment: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select time commitment</option>
                        <option value="part_time">Part-time</option>
                        <option value="full_time">Full-time</option>
                        <option value="weekends_only">Weekends only</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">If you have a child, age of the youngest</label>
                      <select
                        value={editData.child}
                        onChange={(e) => setEditData({ ...editData, child: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select an option</option>
                        <option value="no_child">No child</option>
                        <option value="below_5">Below 5</option>
                        <option value="above_5">Above 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">Why do you like this pet?</label>
                      <textarea
                        value={editData.reason}
                        onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdoptions;
