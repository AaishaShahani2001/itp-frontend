import React, { useMemo, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import PetCard from '../components/PetCard'
import { useAppContext } from '../context/AppContext'
import Testimonial from '../components/Testimonial'
import RatingForm from '../components/RatingForm'

const PetList = () => {
  const [input, setInput] = useState('')
  const { pets } = useAppContext()

  const [reviews, setReviews] = useState([]);

  const handleReviewSubmit = (newReview) => {
    setReviews((prev) => [...prev, newReview]);
  };

  const PET_FILTERS = [
    { value: "all", label: "All pets" },
    { value: "Dog", label: "Dog" },
    { value: "Cat", label: "Cat" },
    { value: "Rabbit", label: "Rabbit" },
    { value: "Bird", label: "Bird" },
    { value: "Other", label: "Other" },
  ]

  const AGE_FILTERS = [
    { value: "all", label: "All ages" },
    { value: "1-3", label: "1 - 3 ages" },
    { value: "4-6", label: "4 - 6 ages" },
    { value: "above6", label: "Above 6 ages" },
  ]

  const GENDER_FILTERS = [
    { value: "all", label: "All gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ]

  const [age, setAge] = useState("all")
  const [petType, setPetType] = useState("all")
  const [gender, setGender] = useState("all")

  const filteredPets = useMemo(() => {
    return pets.filter((a) => {
      // age filter
      if (age === '1-3' && ![1, 2, 3].includes(a.age)) return false
      if (age === '4-6' && ![4, 5, 6].includes(a.age)) return false
      if (age === 'above6' && a.age <= 6) return false

      // pet type filter
      if (petType !== "all" && a.species !== petType) return false

      // gender filter
      if (gender !== "all" && a.gender !== gender) return false

      // search filter (type, breed, age)
      if (
        input &&
        !(
          a.species.toLowerCase().includes(input.toLowerCase()) ||
          a.breed.toLowerCase().includes(input.toLowerCase()) ||
          a.gender.toLowerCase().includes(input.toLowerCase()) ||
          String(a.age).includes(input)
        )
      ) {
        return false
      }

      return true
    })
  }, [pets, age, petType, gender, input])

  return (
    <div className='mb-20'>
      <div className='flex flex-col items-center py-20 bg-primary max-md:px-4'>
        <Title title='Available Pets' subTitle='Browse our selection of pets available for your adoption.' />

        <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search} alt="" className='w-4.5 h-4.5 mr-2' />
          <input 
            onChange={(e) => setInput(e.target.value)} 
            value={input} 
            type="text" 
            placeholder='Search by type, breed and age' 
            className='w-full h-full outline-none text-gray-500' 
          />
          <img src={assets.filter} alt="" className='w-4.5 h-4.5 ml-2' />
        </div>
      </div>
      
        <p className="text-lg text-gray-700 font-medium text-center mt-15 mb-15">
          🐾 Select your favourite pet for adoption 🐶🐱
        </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
        <select
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2"
          aria-label="Pet type filter"
        >
          {PET_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2"
          aria-label="Age filter"
        >
          {AGE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2"
          aria-label="Gender filter"
        >
          {GENDER_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Pets list */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p>Showing {filteredPets.length} pets</p>
        <div className='grid grid-cols-4 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredPets.map((pet, index) => (
            <PetCard key={index} pet={pet} />
          ))}
        </div>

        <Testimonial />

        <RatingForm onSubmit={handleReviewSubmit} />

      </div>
    </div>
  )
}

export default PetList
