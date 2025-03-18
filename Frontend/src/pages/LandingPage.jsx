import React from 'react'
import { Video, Users, Shield } from 'lucide-react'
import CustomButton from '../components/CustomButton'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Footer from '../components/Footer'


const LandingPage = () => {
  return (
    <div>
        <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
        </div>
    </div>
  )
}

export default LandingPage
