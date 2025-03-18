import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login, getHistoryOfUser, addToUserHistory } from "./authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [formState, setFormState] = useState(0);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const message = await register(name, username, password);
            console.log(message);
            return message;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const data = await login(username, password);
            setUserData(data);
            router("/home");
        } catch (err) {
            throw err;
        }
    };

    const fetchHistoryOfUser = async () => {
        try {
            const history = await getHistoryOfUser();
            return history;
        } catch (err) {
            throw err;
        }
    };

    const addHistory = async (meetingCode) => {
        try {
            const response = await addToUserHistory(meetingCode);
            return response;
        } catch (err) {
            throw err;
        }
    };

    const data = {
        userData,
        setUserData,
        formState,
        setFormState,
        handleRegister,
        handleLogin,
        fetchHistoryOfUser,
        addHistory
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};

