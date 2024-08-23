import { useState, useEffect, useRef } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebaseConfig';

const db = getFirestore();
const storage = getStorage();

function ProfileModal({ onClose, userData }) {
  const [formData, setFormData] = useState({
    photoURL: userData.photoURL || '',
    role: userData.role || '',
    department: userData.department || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const modalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type and size (optional)
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // Limit to 5MB
        setPhotoFile(file);
      } else {
        alert('Please select a valid image file (JPEG, PNG, etc.) with size less than 5MB.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (auth.currentUser) {
        let photoURL = formData.photoURL; // Preserve existing photoURL in case no new photo is uploaded

        if (photoFile) {
          const photoRef = ref(storage, `user_photos/${auth.currentUser.uid}/${photoFile.name}`);
          await uploadBytes(photoRef, photoFile);
          photoURL = await getDownloadURL(photoRef);
        }

        // Update the formData with the new photoURL
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          ...formData,
          photoURL, // Set the photoURL to the Firestore document
        });

        alert('Profile updated successfully!');
        onClose();
      } else {
        console.error('No user is currently logged in.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile. Please try again.');
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Complete Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Upload Photo</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              accept="image/*" // Optional: Restrict file types to images
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
