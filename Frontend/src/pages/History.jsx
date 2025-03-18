import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext.jsx';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton, Card, CardContent, Typography } from '@mui/material';
import { toast, ToastContainer,  } from 'react-toastify';

export default function History() {
    const { fetchHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await fetchHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                console.log('Failed to fetch history:', error);
                toast.error(`Failed to fetch history error: ${error}`)
                // Implement Snackbar or error handling here
            }
        };

        fetchHistory();
    }, [fetchHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="p-4">
            <IconButton onClick={() => navigate('/home')} className="mb-4">
                <HomeIcon className="text-blue-500" />
            </IconButton>

            {meetings.length > 0 ? (
                meetings.map((meeting, index) => (
                    <Card key={meeting.meetingCode || index} variant="outlined" className="mb-4 shadow-md">
                        <CardContent>
                            <Typography variant="body2" color="textSecondary" className="text-sm">
                                Code: {meeting.meetingCode}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" className="mt-2">
                                Date: {formatDate(meeting.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography variant="body1" className="text-gray-600">
                    No meetings found.
                </Typography>
            )}
        </div>
    );
}

