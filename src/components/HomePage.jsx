import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; 

function HomePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError('No user data found.');
          }
        } else {
          setError('User not authenticated.');
          navigate('/login');
        }
      } catch (error) {
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const cardData = [
    { title: 'Inventory', route: '/inventory' },
    { title: 'Drives', route: '/drives' },
    { title: 'Calendar', route: '/calendar' },
    { title: 'Daily Points', route: '/daily-points' },
    { title: 'Apply for Leave', route: '/apply-leave' },
    { title: 'Attendance', route: '/attendance' },
  ];

  return (
    <div className=" min-h-screen w-full">
      <div className="flex flex-col items-center justify-start mt-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {cardData.map((card, index) => (
            <button
              key={index}
              className="p-4 sm:p-6 lg:p-8 h-24 sm:h-28 lg:h-32 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-center"
              onClick={() => navigate(card.route)}
            >
              {card.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
