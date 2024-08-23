import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white text-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm lg:max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Login</h1>
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
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded w-full mb-2 sm:mb-3 hover:bg-blue-700 transition-colors"
        >
          Log in
        </button>
        <button
          onClick={handleGoogleLogin}
          className="bg-white text-gray-800 font-bold py-2 px-4 rounded w-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FcGoogle className="mr-2" size={24} />
          Log in with Google
        </button>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
