import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ProfileModal from './ProfileModal';

function Navbar({ user, userData }) {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [role, setRole] = useState(userData.role || '');
  const [department, setDepartment] = useState(userData.department || '');
  const [photo, setPhoto] = useState(null); // Handle the photo upload
  const [profileComplete, setProfileComplete] = useState(!!(userData.role && userData.department));

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

  const handleSubmit = () => {
    // Save the role, department, and photo data
    const updatedData = {
      role,
      department,
      photo,
    };

    // Logic to save the data, e.g., to Firebase or your backend
    console.log('Profile updated with:', updatedData);

    setProfileComplete(true);
  };

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
            className="absolute right-0 mt-2 w-64 bg-white text-black p-4 rounded shadow-lg overflow-hidden z-10 md:w-80 sm:w-full"
          >
            <p className="truncate"><strong>Name:</strong> {user.displayName || 'N/A'}</p>
            <p className="truncate"><strong>Email:</strong> {user.email}</p>
            <p className="truncate"><strong>Role:</strong> {profileComplete ? role : 'N/A'}</p>
            <p className="truncate"><strong>Department:</strong> {profileComplete ? department : 'N/A'}</p>

            {!profileComplete && (
              <>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role"
                  className="border rounded px-2 py-1 w-full mb-2"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department"
                  className="border rounded px-2 py-1 w-full mb-2"
                />
                <input
                  type="file"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="border rounded px-2 py-1 w-full mb-2"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
                >
                  Submit
                </button>
              </>
            )}

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
