import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import Navbar from './components/Navbar';
import HomePage from './components/HomePage'; // Import your pages
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

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
            {/* Public Routes */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

            {/* Protected Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <HomePage />
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
