import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import Navbar from './components/Navbar';
import HomePage from './components/HomePage'; // Import your pages
import LoginPage from './components/LoginPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up an authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state whenever authentication state changes
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
