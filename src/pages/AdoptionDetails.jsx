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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Adoption Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pet overview */}
        <div className="lg:col-span-1">
          <div className="rounded-lg overflow-hidden border">
            <img
              src={adoption.pet?.image || '/default-image.jpg'}
              alt={adoption.pet?.breed || 'Pet'}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Species</span><span>{adoption.pet?.species || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Breed</span><span>{adoption.pet?.breed || '—'}</span></div>
            
            <div className="flex justify-between"><span className="text-gray-600">Price</span><span>{adoption.pet?.price != null ? `Rs. ${adoption.pet.price}` : '—'}</span></div>
          </div>
        </div>

        {/* Adoption and pet details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Adoption info */}
          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Adoption Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Adopter name</span><div className="font-medium">{adoption.name || '—'}</div></div>
              <div><span className="text-gray-600">Phone</span><div className="font-medium">{adoption.phone || '—'}</div></div>
              <div><span className="text-gray-600">Adopter's age</span><div className="font-medium">{adoption.age ?? '—'}</div></div>
              <div><span className="text-gray-600">Status</span><div className="font-medium capitalize">{adoption.status || '—'}</div></div>
              <div><span className="text-gray-600">Adoption date</span><div className="font-medium">{adoption.date ? new Date(adoption.date).toLocaleDateString() : '—'}</div></div>
              <div><span className="text-gray-600">Appointment date</span><div className="font-medium">{adoption.visit ? new Date(adoption.visit).toLocaleDateString() : 'Not scheduled'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Address</span><div className="font-medium">{adoption.address || '—'}</div></div>
            </div>
          </section>

          {/* Pet care details */}
          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Pet Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2"><span className="text-gray-600">Gender</span><div className="font-medium">{adoption.pet?.gender || '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Color</span><div className="font-medium">{adoption.pet?.color || '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Age (years)</span><div className="font-medium">{adoption.pet?.age ?? '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Weight (kg)</span><div className="font-medium">{adoption.pet?.weight ?? '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Good with kids</span><div className="font-medium">{adoption.pet?.goodWithKids || '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Good with pets</span><div className="font-medium">{adoption.pet?.goodWithPets || '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Diet</span><div className="font-medium">{adoption.pet?.diet || '—'}</div></div>
              <div className="md:col-span-2"><span className="text-gray-600">Medical notes</span><div className="font-medium whitespace-pre-wrap">{adoption.pet?.medical || '—'}</div></div>
              <div><span className="text-gray-600">Born</span><div className="font-medium">{adoption.pet?.born || '—'}</div></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdoptionDetail;
