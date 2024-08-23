import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase config
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function HomePage() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after sign-out
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Home Page</h1>
      {userData ? (
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {userData.name}</h2>
          <p><strong>Role:</strong> {userData.role}</p>
          <button
            onClick={handleSignOut}
            className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default HomePage;
