import React from 'react'
import CustomButton from './CustomButton'
import { useNavigate } from 'react-router-dom'
import {AuthContext} from "../context/authContext"
import { useContext } from 'react'


const Navbar = () => {
  
  const router = useNavigate();
  const {formState, setFormState} = useContext(AuthContext);
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">
              Let's Meet
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <CustomButton variant="ghost">Join as Guest</CustomButton>
            <CustomButton variant="outline" onClick={() => {
              setFormState(0);
                        router("/auth")
            }}>Register</CustomButton>
            <CustomButton onClick={() => {
              setFormState(1);
                        router("/auth")
            }}>Login</CustomButton>
          </div>
        </div>
      </div>
    </nav>
  )
}
  export default Navbar;
