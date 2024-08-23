import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import Firebase config
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

function HomePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          console.log('Fetching data for user:', user.uid); // Debug: User ID
          const userDoc = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            console.log('User data fetched:', docSnap.data()); // Debug: Fetched data
            setUserData(docSnap.data());
          } else {
            console.log('No such document!');
            setError('No user data found.');
          }
        } else {
          console.log('No user is currently logged in.');
          setError('User not authenticated.');
          navigate('/login'); // Redirect to login if no user is logged in
        }
      } catch (error) {
        console.error('Error fetching user data: ', error);
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false); // Set loading to false once data is fetched or an error occurs
      }
    };

    fetchUserData();
  }, [navigate]); // Added navigate to dependencies

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after sign-out
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading message while fetching data
  }

  if (error) {
    return <p>{error}</p>; // Show error message if there was an error
  }

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
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default HomePage;
