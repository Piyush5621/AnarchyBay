import LandingPage from './components/LandingPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import UploadResource from './components/UploadResource.jsx';
import MyLibrary from './components/MyLibrary.jsx';
import Profile from './components/Profile.jsx';

import "swiper/css";
import "swiper/css/pagination";
import SignUpPage from './components/auth/SignUpPage.jsx';
import LoginPage from './components/auth/LoginPage.jsx';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/upload' element={<UploadResource />} />
        <Route path='/library' element={<MyLibrary />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
