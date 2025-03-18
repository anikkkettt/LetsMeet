import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext.jsx';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const { addHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        await addHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col">
            {/* Navbar */}
            <div className="flex justify-between items-center p-4 bg-white bg-opacity-20 backdrop-blur-md shadow-lg">
                <h2 className="text-2xl font-bold text-white">Let&apos;s Meet</h2>
                <div className="flex items-center space-x-4">
                    <IconButton onClick={() => navigate('/history')} className="text-white">
                        <RestoreIcon />
                    </IconButton>
                    <p className="text-white">History</p>
                    <Button onClick={handleLogout} className="text-white">
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl">
                    {/* Left Panel */}
                    <div className="flex flex-col space-y-6 text-white text-center md:text-left">
                        <h2 className="text-5xl font-bold">
                            Providing Quality Video Call seamlessly
                        </h2>
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <TextField
                                onChange={(e) => setMeetingCode(e.target.value)}
                                label="Meeting Code"
                                variant="outlined"
                                className="bg-white rounded-lg"
                            />
                            <Button
                                onClick={handleJoinVideoCall}
                                variant="contained"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Join
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="mt-8 md:mt-0">
                        <img src="https://www.freepik.com/free-psd/joyful-3d-emoji-laughing-heartily-expressing-pure-happiness-amusement_410550408.htm#fromView=keyword&page=1&position=3&new_detail=true&query=Smile+Emoji+Png"
                         alt="Logo" className="w-64 h-64 md:w-96 md:h-96" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);