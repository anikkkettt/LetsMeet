import axios from "axios";


const client = axios.create({
    baseURL: `http://localhost:8000/api/users`
});

export const register = async (name, username, password) => {
    try {
        const response = await client.post("/register", { name, username, password });
        if (response.status === 201) {
            return response.data.msg; 
        }
    } catch (err) {
        throw new Error(err.response?.data?.msg || "Registration failed"); 
    }
};

export const login = async (username, password) => {
    try {
        const response = await client.post("/login", { username, password });
        if (response.status === 200) {
            localStorage.setItem("token", response.data.token);
            return response.data;
        }
    } catch (err) {
        throw new Error(err.response?.data?.msg || "Login failed");
    }
};

export const getHistoryOfUser = async () => {
    try {
        const response = await client.get("/get_all_activity", {
            params: { token: localStorage.getItem("token") }
        });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.msg || "Failed to fetch history");
    }
};

export const addToUserHistory = async (meetingCode) => {
    try {
        const response = await client.post("/add_to_activity", {
            token: localStorage.getItem("token"),
            meeting_code: meetingCode
        });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.msg || "Failed to add to history");
    }
};