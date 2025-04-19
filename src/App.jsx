import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Twitter,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Globe,
  Plus,
  Minus,
  Layers
} from "lucide-react";

const API_URL = import.meta.env.VITE_LOCAL_URL;

function App() {
  const [topic, setTopic] = useState("");
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [language, setLanguage] = useState("english");
  const [mode, setMode] = useState("single"); // "single" or "thread"
  const [threadTweets, setThreadTweets] = useState([""]);
  const [threadPartCount, setThreadPartCount] = useState(3);
  const [remainingTweets, setRemainingTweets] = useState(17);

  // Fetch rate limit info on component mount
  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        const response = await axios.get(`${API_URL}/rate-limit`);
        setRemainingTweets(response.data.remaining);
      } catch (error) {
        console.error("Error fetching rate limit:", error);
      }
    };

    fetchRateLimit();
  }, []);

  const generateTweet = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first!");
      return;
    }

    try {
      setIsGenerating(true);
      
      if (mode === "single") {
        const response = await axios.post(`${API_URL}/generate-tweet`, { 
          topic,
          language
        });
        setGeneratedTweet(response.data.tweet);
        setCharCount(response.data.tweet.length);
        toast.success("Tweet generated successfully!");
      } else {
        // Thread generation
        const response = await axios.post(`${API_URL}/generate-thread`, { 
          topic,
          partCount: threadPartCount,
          language
        });
        setThreadTweets(response.data.tweets);
        toast.success("Thread generated successfully!");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate ${mode === "single" ? "tweet" : "thread"}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const postTweet = async () => {
    if (mode === "single") {
      if (!generatedTweet.trim()) {
        toast.error("Please generate a tweet first!");
        return;
      }
      
      if (generatedTweet.length > 280) {
        toast.error("Tweet exceeds character limit!");
        return;
      }

      try {
        setIsPosting(true);
        const response = await axios.post(`${API_URL}/post-tweet`, { tweet: generatedTweet });
        toast.success("Tweet posted successfully!");
        setTopic("");
        setGeneratedTweet("");
        setCharCount(0);
        
        // Update remaining tweet count
        if (response.data.rateLimit) {
          setRemainingTweets(response.data.rateLimit.remaining);
        }
      } catch (error) {
        console.error("Error posting tweet:", error);
        if (error.response?.status === 429) {
          toast.error("Tweet limit reached! Try again later.");
        } else {
          toast.error("Failed to post tweet. Please try again.");
        }
      } finally {
        setIsPosting(false);
      }
    } else {
      // Thread posting
      const validTweets = threadTweets.filter(tweet => tweet.trim().length > 0);
      
      if (validTweets.length === 0) {
        toast.error("Please generate a thread first!");
        return;
      }
      
      if (validTweets.some(tweet => tweet.length > 280)) {
        toast.error("One or more tweets in thread exceed character limit!");
        return;
      }

      try {
        setIsPosting(true);
        const response = await axios.post(`${API_URL}/post-thread`, { tweets: validTweets });
        toast.success("Thread posted successfully!");
        setTopic("");
        setThreadTweets([""]);
        
        // Update remaining tweet count
        if (response.data.rateLimit) {
          setRemainingTweets(response.data.rateLimit.remaining);
        }
      } catch (error) {
        console.error("Error posting thread:", error);
        if (error.response?.status === 429) {
          toast.error("Tweet limit reached! Try again later.");
        } else {
          toast.error("Failed to post thread. Please try again.");
        }
      } finally {
        setIsPosting(false);
      }
    }
  };

  const handleTweetChange = (e) => {
    const tweet = e.target.value;
    setGeneratedTweet(tweet);
    setCharCount(tweet.length);
  };

  const handleThreadTweetChange = (index, value) => {
    const newThreadTweets = [...threadTweets];
    newThreadTweets[index] = value;
    setThreadTweets(newThreadTweets);
  };

  const increaseThreadParts = () => {
    if (threadPartCount < 5) {
      setThreadPartCount(threadPartCount + 1);
    }
  };

  const decreaseThreadParts = () => {
    if (threadPartCount > 2) {
      setThreadPartCount(threadPartCount - 1);
    }
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
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-2 mt-4 inline-flex">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              {remainingTweets} posts remaining today
            </span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl">
            <div className="p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                Generate Your Content
              </h2>

              {/* Mode Selector */}
              <div className="mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      mode === "single"
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    }`}
                    onClick={() => setMode("single")}
                  >
                    <div className="flex items-center justify-center">
                      <Twitter className="h-4 w-4 mr-1" />
                      Single Tweet
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      mode === "thread"
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    }`}
                    onClick={() => setMode("thread")}
                  >
                    <div className="flex items-center justify-center">
                      <Layers className="h-4 w-4 mr-1" />
                      Thread
                    </div>
                  </button>
                </div>
              </div>

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

              {/* Language Selection Dropdown */}
              <div className="mb-6">
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"
                >
                  <Globe className="h-4 w-4 mr-1 text-blue-500" />
                  Select Tweet Language
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>

              {/* Thread Parts Control (only show if in thread mode) */}
              {mode === "thread" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Layers className="h-4 w-4 mr-1 text-blue-500" />
                    Number of Tweets in Thread
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={decreaseThreadParts}
                      disabled={threadPartCount <= 2}
                      className={`p-2 rounded-l-lg border border-gray-300 dark:border-gray-600 ${
                        threadPartCount <= 2
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="px-6 py-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1 text-center font-medium">
                      {threadPartCount}
                    </div>
                    <button
                      onClick={increaseThreadParts}
                      disabled={threadPartCount >= 5}
                      className={`p-2 rounded-r-lg border border-gray-300 dark:border-gray-600 ${
                        threadPartCount >= 5
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    Maximum 5 tweets in thread due to rate limits (17 tweets/day)
                  </p>
                </div>
              )}

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
                    Create {mode === "single" ? "Tweet" : "Thread"}
                  </>
                )}
              </button>

              <div className="my-8">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                {mode === "single" ? (
                  <>
                    <Twitter className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                    Your Tweet
                  </>
                ) : (
                  <>
                    <Layers className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                    Your Thread
                  </>
                )}
              </h2>

              {mode === "single" ? (
                // Single Tweet Editor
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
              ) : (
                // Thread Tweets Editor
                <div className="mb-6 space-y-4">
                  {Array.from({ length: threadPartCount }).map((_, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label
                          htmlFor={`tweet-${index}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Tweet {index + 1}
                        </label>
                        <span
                          className={`text-sm font-medium ${
                            (threadTweets[index]?.length || 0) > 270
                              ? "text-orange-500"
                              : (threadTweets[index]?.length || 0) > 280
                              ? "text-red-500"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {threadTweets[index]?.length || 0}/280
                        </span>
                      </div>
                      <div
                        className={`relative border rounded-lg transition-all ${
                          (threadTweets[index]?.length || 0) > 280
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
                        }`}
                      >
                        <textarea
                          id={`tweet-${index}`}
                          rows="4"
                          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none transition resize-none"
                          placeholder={`Tweet ${index + 1} of your thread...`}
                          value={threadTweets[index] || ""}
                          onChange={(e) => handleThreadTweetChange(index, e.target.value)}
                        ></textarea>
                        {(threadTweets[index]?.length || 0) > 280 && (
                          <div className="absolute bottom-2 right-2 text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">
                              Exceeds character limit
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className={`w-full py-3 md:py-4 rounded-lg font-semibold text-white transition duration-300 flex items-center justify-center ${
                  isPosting || 
                  (mode === "single" ? (charCount > 280 || !generatedTweet.trim()) : 
                    threadTweets.filter(t => t.trim()).length === 0 || threadTweets.some(t => t.length > 280))
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
                onClick={postTweet}
                disabled={
                  isPosting || 
                  (mode === "single" ? (charCount > 280 || !generatedTweet.trim()) : 
                    threadTweets.filter(t => t.trim()).length === 0 || threadTweets.some(t => t.length > 280))
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
                    Post {mode === "single" ? "Tweet" : "Thread"}
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
                  Generate tweets in English, Hindi, or Hinglish!
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