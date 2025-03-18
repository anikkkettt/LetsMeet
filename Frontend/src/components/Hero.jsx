import React from 'react'
import CustomButton from './CustomButton'
const Hero = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6">
          Connect Anywhere, Anytime
        </h1>
        <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
          Experience seamless video conferencing with crystal-clear audio and HD video. Perfect for work, learning, or catching up with friends and family.
        </p>
        <CustomButton size="large" className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-100">
          Connect Now
        </CustomButton>
      </div>
    </div>
  )

  export default Hero;