import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const PetCard = ({pet}) => {
  const [showModal, setShowModal] = useState(false)
  const { currency, backendUrl } = useAppContext()
  const navigate = useNavigate()

  return (
    <>
      <div onClick={() => {navigate(`/adoption/${pet._id}`); scrollTo(0,0)}} className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer'>

            <div className='relative  h-48 overglow-hidden'>
              <img src={pet.image} alt="Pet Image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />

              {pet.isAvailable && <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available Now</p>}

              <div className='absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
                  <span className='font-semibold'>{currency} {pet.price}</span>
              </div>
            </div>

          <div className='p-4 sm:p-5'>
              <div className='flex justify-between items-start mb-2'>
                  <div>
                      <h3 className='text-lg font-medium'>{pet.species} • {pet.breed}</h3>
                      <p className='text-muted-foreground text-sm'>Born on: {pet.born}</p>
                  </div>
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          setShowModal(true);
                      }}
                      className='p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-200 group'
                      title="View full details"
                  >
                      <svg 
                          className='w-4 h-4 text-primary group-hover:text-primary-dark transition-colors duration-200' 
                          fill='none' 
                          stroke='currentColor' 
                          viewBox='0 0 24 24'
                      >
                          <path 
                              strokeLinecap='round' 
                              strokeLinejoin='round' 
                              strokeWidth={2} 
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
                          />
                          <path 
                              strokeLinecap='round' 
                              strokeLinejoin='round' 
                              strokeWidth={2} 
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' 
                          />
                      </svg>
                  </button>
              </div>

              <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
                  <div className='flex items-center text-sm text-muted-foreground'>
                      <img src={assets.dog_icon1} alt="" className='h-4 mr-2' />
                      <span>{pet.age} years old</span>
                  </div>

                  <div className='flex items-center text-sm text-muted-foreground'>
                      <img src={assets.cat_icon} alt="" className='h-4 mr-2' />
                      <span>{pet.gender}</span>
                  </div>
              </div>

          </div>
      </div>

      {/* Pet Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Pet Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pet Image */}
                <div>
                  <img 
                    src={pet.image} 
                    alt="Pet Image" 
                    className="w-full h-80 object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* Pet Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {pet.species} • {pet.breed}
                    </h3>
                    <p className="text-gray-600 text-lg">Born on: {pet.born}</p>
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <img src={assets.dog_icon1} alt="" className="h-5 mr-2" />
                        <span className="font-medium text-gray-700">Age</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{pet.age} years old</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <img src={assets.cat_icon} alt="" className="h-5 mr-2" />
                        <span className="font-medium text-gray-700">Gender</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{pet.gender}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <img src={assets.color} alt="" className="h-5 mr-2" />
                        <span className="font-medium text-gray-700">Color</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{pet.color}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-gray-700">Weight</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{pet.weight} kg</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-700">Adoption Price</span>
                      <span className="text-2xl font-bold text-primary">{currency} {pet.price}</span>
                    </div>
                  </div>

                  {/* Diet Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Diet Information</h4>
                    <p className="text-gray-600">{pet.diet}</p>
                  </div>

                  {/* Medical Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Medical Status</h4>
                    <p className="text-gray-600">{pet.medical}</p>
                  </div>

                  {/* Compatibility */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Good with Kids</h4>
                      <p className="text-lg font-semibold text-green-700">{pet.goodWithKids}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Good with Other Pets</h4>
                      <p className="text-lg font-semibold text-blue-700">{pet.goodWithPets}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PetCard
