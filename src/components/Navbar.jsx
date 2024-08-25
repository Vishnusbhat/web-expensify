import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProfileModal from './ProfileModal';

function Navbar({ user }) {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [userData, setUserData] = useState(null);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || '');
            setDepartment(data.department || '');
            setName(data.name || '');
            setUserData(data);
            setProfileComplete(!!(data.role && data.department && data.name));
            console.log('Profile data:', data);
          } else {
            console.log('No such document!');
          }
        } else {
          console.log('No user found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async () => {
    try {
      const updatedData = {
        role,
        department,
        name,
      };

      if (photo) {
        const photoRef = ref(storage, `user_photos/${user.uid}/${photo.name}`);
        await uploadBytes(photoRef, photo);
        const photoURL = await getDownloadURL(photoRef);
        updatedData.photoURL = photoURL;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);

      // Fetch the updated user data to refresh the state
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        const updatedUserData = updatedUserSnap.data();
        setUserData(updatedUserData);
        setProfileComplete(!!(updatedUserData.role && updatedUserData.department && updatedUserData.name));
      }

      console.log('Profile updated with:', updatedData);
      setEditProfile(false); // Hide the form after submission
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center relative">
      <div className="text-xl font-bold">Expensify</div>
      <div className="relative">
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt="User Photo"
            className="w-12 h-12 rounded-full cursor-pointer border-2 border-white"
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
            <p className="truncate"><strong>Name:</strong> {name || 'N/A'}</p>
            <p className="truncate"><strong>Email:</strong> {user.email}</p>
            <p className="truncate"><strong>Role:</strong> {role || 'N/A'}</p>
            <p className="truncate"><strong>Department:</strong> {department || 'N/A'}</p>

            {!profileComplete && !editProfile && (
              <button
                onClick={() => setEditProfile(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              >
                Complete Profile
              </button>
            )}

            {profileComplete && !editProfile && (
              <button
                onClick={() => setEditProfile(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
              >
                Update Profile
              </button>
            )}

            {editProfile && (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="border rounded px-2 py-1 w-full mb-2"
                />
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
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </nav>
  );
}

export default Navbar;
