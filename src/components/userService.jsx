import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

export const fetchUserData = async (uid) => {
  try {
    if (!uid) {
      throw new Error('User ID is missing');
    }

    // Reference to the user's document in Firestore
    const userDoc = doc(db, 'users', uid);
    // Fetch the document
    const userData = await getDoc(userDoc);

    // Check if the document exists and return its data
    return userData.exists() ? userData.data() : {};
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {};
  }
};
