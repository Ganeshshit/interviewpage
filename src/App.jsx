import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 pb-4">Welcome to Your App</h1>
              <p className="text-gray-600 pt-4">Your Tailwind CSS is now working!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
