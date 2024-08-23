import { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function Navbar({ user }) {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const dropdownRef = useRef(null);

  const toggleUserInfo = () => {
    setShowUserInfo(!showUserInfo);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the "remember me" cookie
      document.cookie = 'rememberMe=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Redirect to the login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const userInitial = user && user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowUserInfo(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center relative">
      <div className="text-xl font-bold">MyApp</div>
      <div className="relative">
        <button
          onClick={toggleUserInfo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          {userInitial}
        </button>
        {showUserInfo && user && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-64 bg-white text-black p-4 rounded shadow-lg overflow-hidden z-10"
          >
            <p className="truncate"><strong>Name:</strong> {user.displayName || 'N/A'}</p>
            <p className="truncate"><strong>Email:</strong> {user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
