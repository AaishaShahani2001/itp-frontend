// pages/AdoptionDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from "../context/AppContext";

const AdoptionDetail = () => {
  const { id } = useParams();
  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {backendUrl} = useAppContext();

  useEffect(() => {
    const fetchAdoption = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/adoption/details/${id}`);
        setAdoption(response.data.adoption);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdoption();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!adoption) return <div>No adoption found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Adoption Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={adoption.pet?.image || '/default-image.jpg'}
            alt={adoption.pet?.breed || 'Pet'}
            className="w-full rounded-md"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{adoption.pet?.breed || 'Unknown Breed'}</h2>
          <p>Species: {adoption.pet?.species || 'Unknown'}</p>
          <p>Adopter Name: {adoption.name}</p>
          <p>Age: {adoption.age}</p>
          <p>Address: {adoption.address}</p>
          <p>Phone: {adoption.phone}</p>
          <p>Status: {adoption.status}</p>
          <p>Adoption Date: {new Date(adoption.date).toLocaleDateString()}</p>
          <p>Appointment Date: {adoption.visit ? new Date(adoption.visit).toLocaleDateString() : 'Not scheduled'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdoptionDetail;
