import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import { BACKEND_URL } from "../config";

interface Blog {
    id: string;
    title?: string;
    content?: string;
}

export const Edit = ({ blog }: { blog: Blog }) => {
    const [title, setTitle] = useState(blog.title || "");
    const [content, setContent] = useState(blog.content || "");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const { id } = blog;
    const navigate = useNavigate();

    // Handle error message fading effect
    useEffect(() => {
        if (errorMessage) {
            setFadeOut(false);
            const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
            const removeTimer = setTimeout(() => {
                setErrorMessage(null);
                setFadeOut(false);
            }, 3000);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(removeTimer);
            };
        }
    }, [errorMessage]);

    // Fetch blog details if not provided initially
    useEffect(() => {
        if (!blog.title || !blog.content) {
            const fetchBlog = async () => {
                try {
                    const { data } = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                        headers: { Authorization: localStorage.getItem("token") },
                    });
                    setTitle(data.title);
                    setContent(data.content);
                } catch (error) {
                    console.error("Error fetching blog details:", error);
                    setErrorMessage("Failed to fetch blog details.");
                }
            };
            fetchBlog();
        }
    }, [id, blog]);

    // Handle blog update
    const handleUpdate = async () => {
        try {
            await axios.put(`${BACKEND_URL}/api/v1/blog/update/${id}`, { title, content }, {
                headers: { Authorization: localStorage.getItem("token") },
            });
            navigate(`/blog/${id}`);
        } catch (error) {
            console.error("Error updating blog:", error);
            setErrorMessage("Access denied: You do not have permission to update this blog.");
        }
    };

    // Handle blog deletion
    const handleDelete = async () => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/delete/${id}`, {
                headers: { Authorization: localStorage.getItem("token") },
            });
            navigate("/blogs");
        } catch (error) {
            console.error("Error deleting blog:", error);
            setErrorMessage("Access denied: You do not have permission to delete this blog.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-200">
            <AppBar />
            <div className="flex justify-center w-full pt-20 lg:pt-24 px-4">
                <div className="w-full max-w-3xl space-y-6 p-4 sm:p-5 lg:p-7 bg-[#15203a] rounded-xl">
                    <div className="w-full max-w-screen-lg bg-[#23324a] p-5 rounded-xl shadow-lg backdrop-blur-md animate-fadeIn">
                        {/* Error Message */}
                        {errorMessage && (
                            <div className={`bg-red-600 text-white text-sm p-3 rounded-lg mb-4 transition-all duration-500 ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100"}`}>
                                {errorMessage}
                            </div>
                        )}

                        {/* Title Input */}
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="bg-[#1e2b40] border border-[#2e3978] text-gray-300 rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        {/* Content Input */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Content"
                            className="border border-[#2e3978] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 block w-full text-gray-300 bg-[#1e2b40] p-3 h-56 mt-4 resize-none"
                        />

                        {/* Action Buttons */}
                        <div className="flex space-x-4 w-full sm:w-auto justify-center sm:justify-start mt-5">
                            <button onClick={handleUpdate} className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md focus:ring-2 focus:ring-indigo-500 w-full">
                                Update
                            </button>
                            <button onClick={() => setShowConfirmDelete(true)} className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md focus:ring-2 focus:ring-red-500 w-full">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Deletion */}
            {showConfirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-[#23324a] p-6 rounded-xl shadow-lg text-gray-200 w-80">
                        <p className="text-lg font-semibold mb-4">Are you sure you want to delete this blog?</p>
                        <div className="flex justify-between">
                            <button onClick={() => setShowConfirmDelete(false)} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">Cancel</button>
                            <button onClick={() => { setShowConfirmDelete(false); handleDelete(); }} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
