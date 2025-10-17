import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import NotificationBell from './NotificationBell'

const Navbar = () => {

  const navigate = useNavigate()

  const {token, setToken, userData} = useAppContext();

  const [showMenu, setShowMenu] = useState(false)

  const logout = () => {
    setToken(false)
    localStorage.removeItem('token')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 bg-light border-b border-b-gray-400 m-auto'>
      <div className='flex'>
        <img src={assets.logo} alt="" className='w-10 ml-3 mr-2' />
        <p className='font-semibold text-4xl md:text-[30px]'>PetPulse</p>
      </div>

      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to="/">
          <li className='py-1'>Home</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

        <NavLink to="/PetList">
          <li className='py-1'>Pet List</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

        <NavLink to="/careservice">
          <li className='py-1'>Pet Care</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

        <NavLink to="/sales">
          <li className='py-1'>Sales</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

        <NavLink to="/contact">
          <li className='py-1'>Contact</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

        <NavLink to="/about">
          <li className='py-1'>About</li>
          <hr className='h-0.5 border-y-primary w-4/5 m-auto hidden' />
        </NavLink>

      </ul>

      <div className='flex items-center gap-4 mr-3'>
        {token && <NotificationBell />}
        {
          token?
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img src={userData.image} alt="" className='w-8 rounded-full' />
            <img src={assets.dropdown} alt=""className='w-2.5' />

            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-gray-200 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/MyProfile')} className='hover:text-black hover:font-semibold cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('/MyAdoptions')} className='hover:text-black hover:font-semibold cursor-pointer'>My Adoptions</p>
                <p onClick={() => navigate('/MyCareAppointments')} className='hover:text-black hover:font-semibold cursor-pointer'>My Care Appointments</p>
                <p onClick={logout} className='hover:text-black hover:font-semibold cursor-pointer'>Logout</p>
              </div>
            </div>
          </div>:
          <button onClick={() => navigate('/Login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Login</button>
        }
        </div>
    </div>
  )
}

export default Navbar