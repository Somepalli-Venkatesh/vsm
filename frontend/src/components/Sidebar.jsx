import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaTimes, 
  FaBars, 
  FaPlus, 
  FaUserCircle, 
  FaArrowLeft, 
  FaSearch 
} from "react-icons/fa";

const Sidebar = ({ isOpen, onToggle, onSelectChat, chats, setModalOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("Loading...");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found in localStorage");
          setUserName("User");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        if (response.data) {
          setUserName(response.data.name || "User");
          setProfileImage(response.data.image || null);
        } else {
          console.warn("Invalid response structure", response.data);
          setUserName("User");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserName("User");
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="p-4 h-full flex flex-col overflow-y-auto">
      {/* Sidebar Header */}
      <div className="mb-4 py-1 flex items-center justify-between">
        {isOpen && (
          <div className="relative flex-1 max-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-1 border rounded w-full"
            />
          </div>
        )}
        <div className={`flex items-center p-1 space-x-1 ${!isOpen ? 'flex-col space-y-2' : ''}`}>
          <button
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus />
          </button>
          <button
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            onClick={onToggle}
          >
            {isOpen ? <FaArrowLeft /> : <FaBars />}
          </button>
        </div>
      </div>

      <div className="my-2 border-t-2 border-gray-300"></div>

      {/* Chats List */}
      {isOpen && (
        <>
          <h2 className="text-xl font-bold mb-4 text-center text-black">Chats</h2>
          <ul className={`flex-1 ${!isOpen ? 'flex-col space-y-2' : ''}`}>
            {chats.length > 0 ? (
              chats.map((chat, index) => (
                <li
                  key={chat.id || index}
                  className="p-2 mb-2 rounded cursor-pointer hover:bg-gray-200 flex items-center gap-2 border-b border-gray-400 opacity-60"
                  onClick={() => onSelectChat(chat)}
                >
                  <div className="w-10 h-10 bg-amber-300 rounded-full">
                    <img
                      src={chat.image}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-bold">{chat.name}</p>
                    <p className="text-sm text-gray-600">{chat.message}</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No chats found</p>
            )}
          </ul>
        </>
      )}

      {/* Divider between Chats and Login User Details */}
      <div className="my-4 border-t-2 border-gray-300"></div>

      {/* User Profile Section */}
      <div className={`mt-auto flex justify-start items-center p-2 gap-2 ${!isOpen ? 'flex-col space-y-2' : ''}`}>
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-400"
          />
        ) : (
          <FaUserCircle className="text-gray-500 text-3xl" />
        )}
        <div className="text-black font-semibold">{userName}</div>
      </div>
    </div>
  );
};

export default Sidebar;
