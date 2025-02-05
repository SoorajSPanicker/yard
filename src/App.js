import React, { useEffect,useRef,useState } from 'react';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LicensingAgreement from './components/LicensingAgreement';
import UserSetup from './components/UserSetup';
import LoginPage from './components/Login';
import Home from './pages/Home';
import AdminPage from './components/AdminPage';
import { base_url } from './components/baseurl';
import ShipyardDashboard from './components/ShipyardDashboard';

const App = () => {
  const navigate = useNavigate();
  const startTimeRef = useRef(new Date()); // Track start time
  const [data,setData] =useState([])

  useEffect(() => {
  setData(localStorage.getItem('user')) 
  console.log(data);
  }, [data]);
 
 
  return (
    <Routes>    
      <Route path="/" element={<Home />} />  
      {/* <Route path="/dashboard" element={<ShipyardDashboard />} />    */}
 
    </Routes>
  );
};

export default App;
