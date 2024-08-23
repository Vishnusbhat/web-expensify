import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ProfileModal from './ProfileModal'; // Import the ProfileModal component

function Navbar({ user, userData }) {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // State for the profile modal
  const dropdownRef = useRef(null);

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'rememberMe=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowUserInfo(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center relative">
      <div className="text-xl font-bold">Expensify</div>
      <div className="relative">
        {userData.photoURL ? (
          <img
            src={userData.photoURL}
            alt="User Photo"
            className="w-12 h-12 rounded-full cursor-pointer"
            onClick={toggleUserInfo}
          />
        ) : (
          <button
            onClick={toggleUserInfo}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            {user && user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </button>
        )}
        {showUserInfo && user && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-64 bg-white text-black p-4 rounded shadow-lg overflow-hidden z-10"
          >
            {/* {userData.photoURL && (
              <img
                src={userData.photoURL}
                alt="User Photo"
                className="w-12 h-12 rounded-full mb-2"
              />
            )} */}
            <p className="truncate"><strong>Name:</strong> {user.displayName || 'N/A'}</p>
            <p className="truncate"><strong>Email:</strong> {user.email}</p>
            <p className="truncate"><strong>Role:</strong> {userData.role || 'N/A'}</p>
            <p className="truncate"><strong>Department:</strong> {userData.department || 'N/A'}</p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
            >
              Complete Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
            >
              Log out
            </button>
          </div>
        )}
      </div>
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} userData={userData} />}
    </nav>
  );
}

export default Navbar;
