import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import { auth } from './firebaseConfig';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DriveDetails from './components/DriveDetails';
import ProtectedRoute from './components/ProtectedRoute';
import CalendarPage from './components/CalendarPage'; // Import the CalendarPage component
import { fetchUserData } from './components/userService'; // Import the fetchUserData function

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setUserData(data);
      } else {
        setUserData({});
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} userData={userData} />
        <div className="p-4">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <HomePage userData={userData} /> {/* Pass userData to HomePage */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute user={user}>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drives"
              element={
                <ProtectedRoute user={user}>
                  < DriveDetails/>
                </ProtectedRoute>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
