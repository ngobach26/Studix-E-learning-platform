import axios from "axios";

const VITE_APP_BASE_URL = "http://localhost:3000/api";

const baseUrl = VITE_APP_BASE_URL + "/admin";

const listUsers = async (token) => {
    try{
        const response = await axios.get(`${baseUrl}/users`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("Response data", response.data);
        return response.data;
    }
    catch(err){
        console.log(err);
    }
};

const listCourses = async (token) => {
    const response = await axios.get(`${baseUrl}/courses`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    console.log("Response data", response.data);
    return response.data;

};

const acceptCourse = async (token, id) => {
    try {
        const response = await axios.patch(`${baseUrl}/courses/${id}/accept`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("Course approved to be published!");
        console.log("Hello", response.data);
        return response.data;
    } catch (err) {
        console.log(err);
    }
};


const denyCourse = async (token, id) => {
    try{
        const response = await axios.patch(`${baseUrl}/courses/${id}/ban`, {}, {
            headers:{
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    }
    catch(err){
        console.log(err);
    }
};

const deleteCourse = async (token, id) => {
    try {
        const response = await axios.delete(`${baseUrl}/courses/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    }
    catch(err){
        console.log(err);
    }
};

const getUserById = async (token, id) => {
    try{
        const response = await axios.get(`${baseUrl}/users/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    }
    catch(err){
        console.log(err);    
    }
};

export default { listUsers, listCourses, acceptCourse, denyCourse, deleteCourse, getUserById };