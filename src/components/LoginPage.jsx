import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Import Firebase config
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or show success message if needed
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async () => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create Firestore document for the new user
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        // Add additional user info if needed
        // For example: name: '', role: '', department: ''
      });

      // Redirect or show success message if needed
    } catch (error) {
      setError('Signup failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create Firestore document for the new user if it doesn't exist
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          // Add additional user info if needed
          // For example: name: '', role: '', department: ''
        });
      }
      // Redirect or show success message if needed
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm lg:max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 sm:mb-4 p-2 sm:p-3 border border-gray-300 rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 sm:mb-6 p-2 sm:p-3 border border-gray-300 rounded w-full"
        />
        {isSignup && (
          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              // Add confirm password logic if needed
              className="p-2 sm:p-3 border border-gray-300 rounded w-full"
            />
          </div>
        )}
        <button
          onClick={isSignup ? handleSignup : handleLogin}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded w-full mb-2 sm:mb-3 hover:bg-blue-700 transition-colors"
        >
          {isSignup ? 'Sign Up' : 'Log In'}
        </button>
        <button
          onClick={handleGoogleLogin}
          className="bg-white text-gray-800 font-bold py-2 px-4 rounded w-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FcGoogle className="mr-2" size={24} />
          Log in with Google
        </button>
        <p className="text-center mt-4">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-500 ml-1 hover:underline"
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </p>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
