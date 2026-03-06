import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import AboutUs from './pages/aboutus/aboutus';
import ContactUs from './pages/contactus/contactus';
import Home from './pages/Home/home';
import CommunityList from './pages/communitylist/communitylist';
import CommunityDetail from './pages/communitydetail/communitydetail';
import MapData from './components/mapdata';
import EditGroup from './pages/communityedit/editgroup';
import CommunityForm from './pages/communityform/form';
import ArtistLogin from './pages/auth/artistlogin';
import EnterOTP from './pages/auth/enterotp';
import ArtistCorner from './pages/artistcorner/artistcorner';
import CommunityPage from './pages/communitypage/communitypage';
import Artist from './components/artists/artists';
import ApplicationVerification from './pages/applicationVerification/form';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/community" element={<CommunityList />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/communityform" element={<CommunityForm />} />
        <Route path="/checkint" element={<MapData />} />
        <Route path="/editgroup/:id" element={<EditGroup  />} />
        <Route path="/artist/login" element={<ArtistLogin />} />
        <Route path="/artist/enterotp" element={<EnterOTP />} />
        <Route path="/artistcorner" element={<ArtistCorner />} />
        <Route path="/communitypage/:id" element={<CommunityPage />} />
        <Route path="/community/:id/artists/:artistId" element={<Artist/>} />
        <Route path="/verify_application/:id" element={<ApplicationVerification />} />
      </Routes>
    </Router>
  );
}

export default App;
