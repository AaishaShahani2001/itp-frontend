import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Adoption = () => {
  const { pets, axios, currency, backendUrl, token, getPets, userData } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  // Form fields
  const [name, setName] = useState(userData?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(userData?.address || "");
  const [age, setAge] = useState("");
  const [child, setChild] = useState("");
  const [reason, setReason] = useState("");
  
  // New fields
  const [occupation, setOccupation] = useState("");
  const [experience, setExperience] = useState("");
  const [livingSpace, setLivingSpace] = useState("");
  const [otherPets, setOtherPets] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [nicImage, setNicImage] = useState(null);
  const [nicImageFile, setNicImageFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPet(pets.find((pet) => pet._id === id));
  }, [pets, id]);

  // Strong validation functions
  const validators = {
    name: (val) => {
      if (!val || val.trim().length < 2) return "Name must be at least 2 characters";
      if (val.trim().length > 50) return "Name cannot exceed 50 characters";
      if (!/^[a-zA-Z\s]+$/.test(val)) return "Name can only contain letters and spaces";
      return true;
    },
    address: (val) => {
      if (!val || val.trim().length < 5) return "Address must be at least 5 characters";
      if (val.trim().length > 200) return "Address cannot exceed 200 characters";
      return true;
    },
    age: (val) => {
      const numAge = Number(val);
      if (!val) return "Age is required";
      if (isNaN(numAge)) return "Age must be a number";
      if (numAge < 18) return "You must be at least 18 years old to adopt";
      if (numAge > 100) return "Age cannot exceed 100 years";
      return true;
    },
    child: (val) => val !== "" || "Please select an option",
    reason: (val) => {
      if (!val || val.trim().length < 10) return "Reason must be at least 10 characters";
      if (val.trim().length > 500) return "Reason cannot exceed 500 characters";
      return true;
    },
    phone: (val) => {
      if (!val) return "Phone number is required";
      if (!/^(?:0|(?:\+94))7\d{8}$/.test(val)) return "Enter a valid Sri Lankan phone number (07XXXXXXXX or +947XXXXXXXX)";
      return true;
    },
    occupation: (val) => {
      if (!val || val.trim().length < 2) return "Occupation must be at least 2 characters";
      if (val.trim().length > 100) return "Occupation cannot exceed 100 characters";
      return true;
    },
    experience: (val) => val !== "" || "Please select your experience level",
    livingSpace: (val) => val !== "" || "Please select your living space type",
    otherPets: (val) => val !== "" || "Please specify if you have other pets",
    timeCommitment: (val) => val !== "" || "Please select your time commitment",
    emergencyContact: (val) => {
      if (!val) return "Emergency contact is required";
      if (!/^(?:0|(?:\+94))7\d{8}$/.test(val)) return "Enter a valid emergency contact number (07XXXXXXXX or +947XXXXXXXX)";
      return true;
    },
    nicImage: (val) => {
      if (!val) return "NIC image is required";
      return true;
    },
    nicImageFile: (val) => {
      if (!val) return "NIC image file is required";
      return true;
    }
  };

  // Live input handlers with validation
  const handleChange = (field, value) => {
    // Update value
    switch (field) {
      case "name": setName(value); break;
      case "address": setAddress(value); break;
      case "age": setAge(value); break;
      case "child": setChild(value); break;
      case "reason": setReason(value); break;
      case "phone": setPhone(value); break;
      case "occupation": setOccupation(value); break;
      case "experience": setExperience(value); break;
      case "livingSpace": setLivingSpace(value); break;
      case "otherPets": setOtherPets(value); break;
      case "timeCommitment": setTimeCommitment(value); break;
      case "emergencyContact": setEmergencyContact(value); break;
      case "nicImage": setNicImage(value); break;
      case "nicImageFile": setNicImageFile(value); break;
      default: break;
    }

    // Validate field
    const result = validators[field](value);
    setErrors((prev) => ({ ...prev, [field]: result === true ? "" : result }));
  };

  // Check if form is valid
  const isFormValid = () => {
    return Object.values(errors).every((err) => !err) &&
      name && address && age && child && reason && phone &&
      occupation && experience && livingSpace && otherPets && timeCommitment && emergencyContact && nicImageFile;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pet', id);
      formData.append('name', name.trim());
      formData.append('date', new Date().toISOString().split("T")[0]);
      formData.append('price', pet?.price || 0);
      formData.append('address', address.trim());
      formData.append('phone', phone);
      formData.append('age', Number(age));
      formData.append('child', child);
      formData.append('reason', reason.trim());
      formData.append('occupation', occupation.trim());
      formData.append('experience', experience);
      formData.append('livingSpace', livingSpace);
      formData.append('otherPets', otherPets);
      formData.append('timeCommitment', timeCommitment);
      formData.append('emergencyContact', emergencyContact);
      formData.append('nicImage', nicImageFile);

      const response = await axios.post(
        `${backendUrl}/api/adoption/create`,
        formData,
        { 
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/MyAdoptions");
        if (getPets) getPets();
      } else {
        toast.error(response.data.message || "Failed to create adoption");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return pet ? (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16 mb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer"
      >
        <img src={assets.arrow} alt="" className="rotate-180 opacity-65" />
        Back to pet list
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Pet Image & Details */}
        <div className="lg:col-span-2">
          <img
            src={pet.image}
            alt=""
            className="w-full h-auto md:max-h-200 object-cover rounded-xl mb-6 shadow-md"
          />
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                {pet.species} ● {pet.breed}
              </h1>
              <p className="text-gray-500 text-1g">Born on: {pet.born}</p>
            </div>
            <hr className="border-borderColor my-6" />
    
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 mt-20">
              {[
                { icon: assets.dog_icon1, text: `${pet.age} years` },
                { icon: assets.cat_icon, text: `${pet.gender}` },
                { icon: assets.color, text: `${pet.color}` },
                { icon: assets.food, text: `${pet.diet}` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center bg-light p-4 rounded-3xl">
                  <img src={icon} alt="" className="h-5 mb-2" />
                  {text}
                </div>
              ))}
            </div>
    
            {/* Medical */}
            <div className="mt-20">
              <h1 className="text-xl font-medium mb-3">Medical Status</h1>
              <p className="text-gray-500">{pet.medical}</p>
            </div>
    
            {/* Features */}
            <div className="mt-20">
              <h1 className="text-xl font-medium mb-3">Features</h1>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Friendly",
                  "Playful",
                  "Vaccinated",
                  "Loves cuddles",
                  "Indoor pet",
                ].map((item) => (
                  <li key={item} className="flex items-center text-gray-500">
                    <img src={assets.check} className="h-4 mr-2" alt="" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <form
            onSubmit={handleSubmit}
            className="shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-4 text-gray-500"
          >
          <p className="flex items-center justify-between text-2xl text-gray-800 font-semibold">
            {currency} {pet.price}
          </p>
          <hr className="border-borderColor my-4" />

          {/* Name */}
          <div>
            <label htmlFor="name">Your name:</label>
            <input
              type="text"
              id="name"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address">Your address (City):</label>
            <input
              type="text"
              id="address"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone">Your phone number:</label>
            <input
              type="tel"
              id="phone"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="07XXXXXXXX or +947XXXXXXXX"
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age">Your age:</label>
            <input
              type="text"
              id="age"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="Enter your age"
              required
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          {/* Child */}
          <div>
            <label htmlFor="child">If you have a child, age of the youngest:</label>
            <select
              id="child"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={child}
              onChange={(e) => handleChange("child", e.target.value)}
              required
            >
              <option value="">Select an option</option>
              <option value="no_child">No child</option>
              <option value="below_5">Below 5</option>
              <option value="above_5">Above 5</option>
            </select>
            {errors.child && <p className="text-red-500 text-xs mt-1">{errors.child}</p>}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason">Why do you like this pet?</label>
            <textarea
              id="reason"
              rows={4}
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Tell us why you want this pet (minimum 10 characters)"
              required
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="occupation">Your occupation:</label>
            <input
              type="text"
              id="occupation"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              placeholder="Enter your occupation"
              required
            />
            {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience">Your pet experience level:</label>
            <select
              id="experience"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              required
            >
              <option value="">Select your experience level</option>
              <option value="none">No experience</option>
              <option value="beginner">Beginner (1-2 years)</option>
              <option value="intermediate">Intermediate (3-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
            {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
          </div>

          {/* Living Space */}
          <div>
            <label htmlFor="livingSpace">Your living space type:</label>
            <select
              id="livingSpace"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={livingSpace}
              onChange={(e) => handleChange("livingSpace", e.target.value)}
              required
            >
              <option value="">Select your living space</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="farm">Farm</option>
              <option value="other">Other</option>
            </select>
            {errors.livingSpace && <p className="text-red-500 text-xs mt-1">{errors.livingSpace}</p>}
          </div>

          {/* Other Pets */}
          <div>
            <label htmlFor="otherPets">Do you have other pets?</label>
            <select
              id="otherPets"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={otherPets}
              onChange={(e) => handleChange("otherPets", e.target.value)}
              required
            >
              <option value="">Select an option</option>
              <option value="none">No other pets</option>
              <option value="dogs">Dogs</option>
              <option value="cats">Cats</option>
              <option value="other">Other pets</option>
              <option value="multiple">Multiple types</option>
            </select>
            {errors.otherPets && <p className="text-red-500 text-xs mt-1">{errors.otherPets}</p>}
          </div>

          {/* Time Commitment */}
          <div>
            <label htmlFor="timeCommitment">Your available time commitment:</label>
            <select
              id="timeCommitment"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={timeCommitment}
              onChange={(e) => handleChange("timeCommitment", e.target.value)}
              required
            >
              <option value="">Select your time commitment</option>
              <option value="part_time">Part-time (few hours daily)</option>
              <option value="full_time">Full-time (most of the day)</option>
              <option value="weekends_only">Weekends only</option>
              <option value="flexible">Flexible schedule</option>
            </select>
            {errors.timeCommitment && <p className="text-red-500 text-xs mt-1">{errors.timeCommitment}</p>}
          </div>

          {/* Emergency Contact */}
          <div>
            <label htmlFor="emergencyContact">Emergency contact number:</label>
            <input
              type="tel"
              id="emergencyContact"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              value={emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="07XXXXXXXX or +947XXXXXXXX"
              required
            />
            {errors.emergencyContact && <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>}
          </div>

          {/* NIC Image Upload */}
          <div>
            <label htmlFor="nicImage">Upload your NIC (National Identity Card):</label>
            <input
              type="file"
              id="nicImage"
              accept="image/*"
              className="w-full border borderColor px-3 py-2 rounded-lg"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNicImageFile(file);
                  handleChange("nicImageFile", file);
                  
                  // Create preview
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setNicImage(e.target.result);
                    handleChange("nicImage", e.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              required
            />
            {errors.nicImage && <p className="text-red-500 text-xs mt-1">{errors.nicImage}</p>}
            {nicImage && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ NIC image uploaded successfully</p>
                <img 
                  src={nicImage} 
                  alt="NIC Preview" 
                  className="mt-2 w-32 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 font-medium text-white rounded-xl ${
              isFormValid() ? "bg-primary hover:bg-primary-dull" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? "Processing..." : "Adopt Now"}
          </button>

          <p className="text-center text-sm">No credit card required to adopt</p>
          </form>
        </div>
      </div>
  ) : (
    <Loader />
  );
};

export default Adoption;
