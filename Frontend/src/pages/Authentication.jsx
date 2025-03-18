import  { useState } from 'react';
import { AuthContext } from '../context/authContext';
import { toast, ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const Authentication = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const {formState, setFormState} = useContext(AuthContext); // 0 = Register, 1 = Login

    const { handleRegister, handleLogin } = useContext(AuthContext);

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                // Register
                const result = await handleRegister(name, username, password);
                toast.success(result);
            } else {
                // Login
                const result = await handleLogin(username, password);
                setUsername('');
                setPassword('');
                setMessage(result);
                setError('');
                setFormState(0); // Switch back to Register form after successful login
                toast.success(result);
            }
        } catch (err) {
            setError(err);
            const message = err.message || 'An error occurred';
            setMessage(message);
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                {formState === 0 ? (
                    // Register Form
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Register</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAuth}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Register
                        </button>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <button
                            onClick={() => setFormState(1)}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Log In
                        </button>
                    </div>
                ) : (
                    // Login Form
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">Log In</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAuth}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Log In
                        </button>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-sm text-gray-500">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <button
                            onClick={() => setFormState(0)}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Authentication;