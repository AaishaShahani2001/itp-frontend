import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// Don't set baseURL for Vite proxy to work correctly
// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY || 'Rs. ';
    const backendUrl = import.meta.env.VITE_BASE_URL || 'https://itp-backend-waw1.onrender.com';

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [user, setUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    

    const[userData, setUserData] = useState(false)

    const [pets, setPets] = useState([])

    //Function to fetch all pets from the server
    const fetchPets = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/caretaker/pets`)

            data.success ? setPets(data.pets) : toast.error(data.message)
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Function to log out the user
    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsAdmin(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }

    //Load user profile
    const loadUserData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers: {token}})

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    //useEffect to retrieve the token from localStorage
    useEffect(()=>{
        fetchPets()
    }, [])

    //useEffect to load profile
    useEffect(() => {
        if (token) {
            loadUserData()
        } else {
            setUserData(false)
        }
    }, [token])

    const value = {
        navigate, currency, axios, user, setUser, token, setToken, isAdmin, setIsAdmin,
        showLogin, setShowLogin, logout, fetchPets, pets, setPets, backendUrl, userData, setUserData, loadUserData
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    return useContext(AppContext)
}
