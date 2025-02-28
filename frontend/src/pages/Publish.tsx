import axios from "axios";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import { BACKEND_URL } from "../config";
import { useBlogs } from "../Hooks";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const navigate = useNavigate();
    const { loading } = useBlogs();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState(false);

    // Handle automatic fade-out of error messages
    useEffect(() => {
        if (errorMessage) {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-gray-200 flex flex-col">
                <AppBar />
                <div className="flex flex-grow justify-center items-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-200">
            <AppBar />
            <div className="flex justify-center pt-20 lg:pt-24 px-4">
                <div className="w-full max-w-3xl space-y-6 p-4 sm:p-5 lg:p-7 bg-[#15203a] rounded-xl">
                    <div className="w-full max-w-3xl bg-[#23324a] backdrop-blur-md p-5 sm:p-8 rounded-xl shadow-lg animate-fadeIn">
                        {/* Error message display */}
                        {errorMessage && (
                            <div className={`bg-red-600 text-white text-sm p-3 rounded-lg mb-4 transition-all duration-500 ${fadeOut ? "opacity-0 translate-y-2" : "opacity-100"}`}>
                                {errorMessage}
                            </div>
                        )}
                        
                        {/* Title input */}
                        <input
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            className="w-full p-3 bg-[#1e2b40] border border-[#2e3978] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            placeholder="Enter blog title..."
                        />
                        
                        {/* Content editor */}
                        <TextEditor onChange={(e) => setContent(e.target.value)} />
                        
                        {/* Publish button */}
                        <button
                            onClick={async () => {
                                if (!title || !content) {
                                    setErrorMessage("Title and content are required to publish the post.");
                                    return;
                                }
                                setIsPublishing(true);
                                try {
                                    const res = await axios.post(
                                        `${BACKEND_URL}/api/v1/blog/create`,
                                        { title, content },
                                        { headers: { Authorization: localStorage.getItem("token") } }
                                    );
                                    navigate(`/blog/${res.data.id}`);
                                } catch (e) {
                                    console.error("Error creating blog post:", e);
                                    alert("Failed to publish the post. Please try again.");
                                } finally {
                                    setIsPublishing(false);
                                }
                            }}
                            disabled={isPublishing}
                            className={`mt-4 w-full py-3 font-semibold rounded-lg shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 ${
                                isPublishing ? " hover:bg-blue-800 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 text-white"
                            }`}
                        >
                            {isPublishing ? (
                                <>
                                    <svg className="animate-spin size-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 16 0h-2a6 6 0 1 0-12 0H4z"></path>
                                    </svg>
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-9 18-2.5-6.5L3 12z" />
                                    </svg>
                                    <span>Publish</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// TextEditor component for content input
function TextEditor({ onChange }: { onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void }) {
    return (
        <div className="mt-4">
            <textarea
                onChange={onChange}
                rows={8}
                className="w-full p-3 bg-[#1e2b40] border border-[#2e3978] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
                placeholder="Write an article..."
                required
            />
        </div>
    );
}
