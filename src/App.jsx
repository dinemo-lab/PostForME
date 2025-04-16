import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Twitter,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_LOCAL_URL;

function App() {
  const [topic, setTopic] = useState("");
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const generateTweet = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first!");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await axios.post(`${API_URL}/generate-tweet`, { topic });
      setGeneratedTweet(response.data.tweet);
      setCharCount(response.data.tweet.length);
      toast.success("Tweet generated successfully!");
    } catch (error) {
      console.error("Error generating tweet:", error);
      toast.error("Failed to generate tweet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const postTweet = async () => {
    if (!generatedTweet.trim()) {
      toast.error("Please generate a tweet first!");
      return;
    }

    try {
      setIsPosting(true);
      await axios.post(`${API_URL}/post-tweet`, { tweet: generatedTweet });
      toast.success("Tweet posted successfully!");
      setTopic("");
      setGeneratedTweet("");
      setCharCount(0);
    } catch (error) {
      console.error("Error posting tweet:", error);
      toast.error("Failed to post tweet. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleTweetChange = (e) => {
    const tweet = e.target.value;
    setGeneratedTweet(tweet);
    setCharCount(tweet.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="container mx-auto px-4 py-6 md:py-12">
        <header className="mb-8 md:mb-12 text-center">
          <div className="flex justify-center items-center mb-4">
            <Twitter
              className="h-8 w-8 md:h-10 md:w-10 text-blue-500 mr-2"
              strokeWidth={2}
            />
            <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              TweetGenius
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg font-medium">
            AI-powered tweet generation & posting
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl">
            <div className="p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                Generate Your Tweet
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  What would you like to tweet about?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="topic"
                    className="w-full px-4 py-3 md:py-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 pr-10"
                    placeholder="E.g., AI in healthcare, remote work trends, product launch"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  {topic && (
                    <button
                      className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => setTopic("")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <button
                className={`w-full cursor-pointer py-3 md:py-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
                  isGenerating
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
                onClick={generateTweet}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Create Tweet
                  </>
                )}
              </button>

              <div className="my-8">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Twitter className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                Your Tweet
              </h2>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="tweet"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Edit your tweet
                  </label>
                  <span
                    className={`text-sm font-medium ${
                      charCount > 270
                        ? "text-orange-500"
                        : charCount > 280
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {charCount}/280
                  </span>
                </div>
                <div
                  className={`relative border rounded-lg transition-all ${
                    charCount > 280
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                  }`}
                >
                  <textarea
                    id="tweet"
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none transition resize-none"
                    placeholder="Your AI-generated tweet will appear here..."
                    value={generatedTweet}
                    onChange={handleTweetChange}
                  ></textarea>
                  {charCount > 280 && (
                    <div className="absolute bottom-2 right-2 text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">
                        Exceeds character limit
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`w-full py-3 md:py-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
                  isPosting || charCount > 280 || !generatedTweet.trim()
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
                onClick={postTweet}
                disabled={
                  isPosting || charCount > 280 || !generatedTweet.trim()
                }
              >
                {isPosting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Post Tweet
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6 transition-all duration-300">
            <div className="p-6 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Focused on tweet posting only
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Do you like it?
                <a
                  href="mailto:dineshmourya02@example.com"
                  className="ml-2  text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  Contact me
                </a>
              </p>
            </div>
          </div>

          <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 mb-4">
            <p>
              © {new Date().getFullYear()} TweetGenius. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
