import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StudyRecommendation = ({ userType }) => {
    const [topic, setTopic] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);

    const getRecommendation = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/ai/study-recommendations', { topic, userType });
            setRecommendation(response.data.recommendation);
        } catch (error) {
            console.error("Error fetching recommendation:", error);
            setRecommendation("Failed to fetch study recommendation.");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <motion.h1 
                className="text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                AI-Powered Study Recommendations
            </motion.h1>
            <div className="w-full max-w-lg p-6 bg-gray-800 shadow-lg rounded-lg">
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Enter a topic..." 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)}
                        className="p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:outline-none"
                    />
                    <button 
                        onClick={getRecommendation} 
                        disabled={loading}
                        className="w-full p-3 text-lg bg-blue-500 hover:bg-blue-600 rounded-lg transition duration-300"
                    >
                        {loading ? "Generating..." : "Get Recommendation"}
                    </button>
                    {recommendation && (
                        <motion.div 
                            className="mt-4 p-4 bg-gray-700 rounded-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {recommendation}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyRecommendation;
