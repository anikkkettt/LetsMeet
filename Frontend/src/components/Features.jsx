import React from 'react'
import { Video, Users, Shield } from 'lucide-react'


const features = [
    {
      name: 'HD Video & Audio',
      description: 'Crystal clear video and audio for an immersive experience.',
      icon: Video,
    },
    {
      name: 'Group Conferencing',
      description: 'Host meetings with up to 100 participants simultaneously.',
      icon: Users,
    },
    {
      name: 'Secure Meetings',
      description: 'End-to-end encryption for all your conversations.',
      icon: Shield,
    },
  ]
  
  const Features = () => (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Choose Let's Meet ?
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our platform offers the best-in-class features for all your video conferencing needs.
          </p>
        </div>
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  export default Features;