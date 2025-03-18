

import {BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import Authentication from "./pages/Authentication.jsx"
import { AuthProvider } from "./context/authContext.jsx"
import Home from "./pages/Home.jsx"
import History from "./pages/History.jsx"
import Meeting from "./pages/Meeting.jsx"


function App() {

  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/:meetingCode" element={<Meeting />} />
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
