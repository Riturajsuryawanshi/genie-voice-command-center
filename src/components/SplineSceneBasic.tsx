
'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Button } from "@/components/ui/button"
import { Phone, Brain, MessageSquare, Shield, Clock, Users } from "lucide-react"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={400}
      />
      
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                CallGenie
              </h1>
              <p className="text-neutral-400 text-lg">AI Phone Assistant Revolution</p>
            </div>
          </div>
          
          <p className="text-neutral-300 max-w-lg text-lg leading-relaxed">
            Transform your business communication with our intelligent AI assistant that handles calls 24/7, 
            schedules appointments, and provides natural conversational experiences for your customers.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span className="text-neutral-300">Smart AI Responses</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-indigo-400" />
              <span className="text-neutral-300">24/7 Availability</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
              <span className="text-neutral-300">Natural Conversations</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-indigo-400" />
              <span className="text-neutral-300">Multi-caller Support</span>
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Start Free Trial
            </Button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
