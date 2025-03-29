import Dashboard from './pages/dashboard'
import OfferLetter from './pages/OfferLater'
import ChatBot from './components/chatBot'
import VerifyDocument from './pages/VerifyDocument'
import { useUser } from '@clerk/clerk-react'
import LandingPage from './pages/landingPage'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';


function App() {

  return (
    <>
      <div>

      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <div>
            <Dashboard />
            <OfferLetter />
            <ChatBot />
          </div>
        } />
        <Route path="/offer-letter" element={
          <div>
            <Dashboard />
            <OfferLetter />
            <ChatBot />
          </div>
        } />
        {/* <Route path="/chat-bot" element={
          <div>
            <Dashboard />
            <ChatBot />
          </div>
        } /> */}

        <Route path="/verify-document" element={
          <div>
            <Dashboard />
          <VerifyDocument />
            <ChatBot />
          </div>
          } />
        <Route path="/compleated" element={
          <div>
            <Dashboard />
            <ChatBot /> 
          </div>
          } />

      </Routes>
    </>
  )
}

export default App
