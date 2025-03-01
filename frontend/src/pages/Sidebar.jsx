import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FaBars,
  FaPlus,
  FaUserCircle,
  FaArrowLeft,
  FaSearch,
  FaBell,
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import io from "socket.io-client";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import NotificationsPanel from "../components/NotificationsPanel";
import openAiGif from "../assets/hina.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ----- SOCKET INSTANCE -----
const socket = io("https://vsm-virtual-study-backend.onrender.com/", {
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

// Helper function to ensure a Base64 string is formatted as a data URI
const formatImageSrc = (image) => {
  if (!image) return null;
  return image.startsWith("data:") ? image : `data:image/png;base64,${image}`;
};

const Sidebar = ({
  isOpen,
  onToggle,
  onSelectChat,
  chats,
  setModalOpen,
  userId,
  searchTerm,
  setSearchTerm,
  notifications,
  showNotifications,
  onToggleNotifications,
  // onStatusUpdate & onGroupUpdate are passed from parent – they will update the notifications data
  onStatusUpdate = () => {},
  onGroupUpdate = () => {},
  showOpenAI,
  onToggleOpenAI,
}) => {
  const navigate = useNavigate();

  // User Profile Info
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [userProfileImage, setUserProfileImage] = useState(null);

  // Chat/Sidebar State
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [localChats, setLocalChats] = useState(chats || []);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Keep track of component mount time for spinner vs. "No chats" message
  const mountTimeRef = useRef(Date.now());

  // -------------------- FETCH GROUPS --------------------
  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
      const response = await axios.get("/auth/groups", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.groups) {
        setLocalChats(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // -------------------- FETCH UNREAD COUNTS --------------------
  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`/messages/unread/${userId}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const counts = response.data.reduce((acc, { groupId, count }) => {
        acc[groupId] = count;
        return acc;
      }, {});
      setUnreadCounts((prev) => ({ ...prev, ...counts }));
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, [userId]);

  // -------------------- FETCH USER PROFILE --------------------
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.get("/auth/profile", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      setUserName(userData.name || "User");
      setUserEmail(userData.email || "");
      if (userData.image?.data) {
        const bytes = new Uint8Array(userData.image.data);
        const chunkSize = 0x8000; // 32768 bytes
        let binary = "";
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(
            null,
            bytes.subarray(i, i + chunkSize)
          );
        }
        const base64String = window.btoa(binary);
        setUserProfileImage(`data:image/png;base64,${base64String}`);
      } else {
        setUserProfileImage(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("User");
    }
  }, []);

  // -------------------- SOCKET HANDLERS --------------------
  const handleNewMessage = useCallback(
    (message) => {
      // If a new message is sent to a chat that's not currently active, increment unread
      if (message.senderId !== userId && message.groupId !== activeChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.groupId]: (prev[message.groupId] || 0) + 1,
        }));
        fetchGroups();
      }
    },
    [userId, activeChat, fetchGroups]
  );

  const handleMessagesRead = useCallback(
    ({ groupId, userId: readByUserId }) => {
      // If current user read the messages in groupId, set that unread count to 0
      if (readByUserId === userId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [groupId]: 0,
        }));
      }
    },
    [userId]
  );

  // -------------------- INITIAL SETUP --------------------
  useEffect(() => {
    Promise.all([fetchGroups(), fetchUnreadCounts(), fetchUserProfile()]);
    const groupsInterval = setInterval(fetchGroups, 5000);
    const unreadCountsInterval = setInterval(fetchUnreadCounts, 5000);
    return () => {
      clearInterval(groupsInterval);
      clearInterval(unreadCountsInterval);
    };
  }, [fetchGroups, fetchUnreadCounts, fetchUserProfile]);

  // -------------------- SOCKET SETUP --------------------
  useEffect(() => {
    if (userId) {
      socket.connect();
      socket.emit("setUser", userId);
      socket.on("newMessage", handleNewMessage);
      socket.on("messagesMarkedAsRead", handleMessagesRead);
      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messagesMarkedAsRead", handleMessagesRead);
        socket.disconnect();
      };
    }
  }, [userId, handleNewMessage, handleMessagesRead]);

  // -------------------- SELECT CHAT --------------------
  const handleChatSelection = useCallback(
    (chat) => {
      setActiveChat(chat._id);
      onSelectChat(chat);
      // Mark messages as read for this chat
      socket.emit("markMessagesAsRead", { groupId: chat._id, userId });
      setUnreadCounts((prev) => ({ ...prev, [chat._id]: 0 }));
    },
    [userId, onSelectChat]
  );

  // -------------------- FILTER CHATS BY SEARCH --------------------
  const filteredChats = useMemo(() => {
    return localChats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localChats, searchTerm]);

  // -------------------- LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Show spinner if still loading or if no chats have loaded within 3s
  const timeSinceMount = Date.now() - mountTimeRef.current;
  const showSpinnerForChats =
    isLoading || (localChats.length === 0 && timeSinceMount < 3000);

  // Compute unread notifications count
  const unreadCount = notifications.filter(
    (n) => !n.read && (!n.status || n.status === "pending")
  ).length;

  return (
    <div className="relative p-4 h-screen flex flex-col bg-black text-white shadow-md rounded-lg overflow-hidden z-10">
      {/* Top Section */}
      <div
        className={`mb-4 py-1 flex ${
          isOpen ? "flex-row items-center space-x-2" : "flex-col space-y-2"
        }`}
      >
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
        >
          <FaHome className="text-xl" />
        </button>

        {/* Search Input */}
        {isOpen && (
          <div className="relative flex-1 max-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-2 py-1 w-full rounded-full bg-[#2A2A2D] text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Add Chat Button */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
          onClick={() => setModalOpen(true)}
        >
          <FaPlus className="text-xl" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
            onClick={onToggleNotifications}
          >
            <FaBell className="text-xl" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          {showNotifications && (
            <div className="absolute top-full right-[-40px] mt-2 z-50">
              <NotificationsPanel
                show={showNotifications}
                onClose={onToggleNotifications}
                notifications={notifications}
                onStatusUpdate={onStatusUpdate}
                onGroupUpdate={onGroupUpdate}
              />
            </div>
          )}
        </div>

        {/* Sidebar Toggle */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition duration-200"
          onClick={onToggle}
        >
          {isOpen ? (
            <FaArrowLeft className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </button>

        {/* OpenAI GIF Button */}
        <div className="relative">
          <button
            className="w-20 h-20 ml-[-10px] flex items-center justify-center overflow-hidden rounded-full bg-transparent"
            onClick={onToggleOpenAI}
          >
            <img
              src={openAiGif}
              alt="GIF"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-[#333]"></div>

      {/* Scrollable Chat List */}
      {isOpen && (
        <>
          <h2 className="text-lg font-semibold mb-3 text-center text-purple-300">
            Chats
          </h2>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {showSpinnerForChats ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              </div>
            ) : filteredChats.length > 0 ? (
              <ul className="space-y-1">
                {filteredChats.map((chat) => (
                  <li
                    key={chat._id}
                    onClick={() => handleChatSelection(chat)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-purple-600 ${
                      activeChat === chat._id ? "bg-purple-900" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                      {chat.image ? (
                        <img
                          src={formatImageSrc(chat.image)}
                          alt={chat.name}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        <FaUserCircle className="text-2xl text-gray-300 m-auto" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-100 truncate">
                          {chat.name}
                        </p>
                        {unreadCounts[chat._id] > 0 &&
                          chat._id !== activeChat && (
                            <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">
                              {unreadCounts[chat._id]}
                            </span>
                          )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No chats found</p>
            )}
          </div>
        </>
      )}

      {/* Divider */}
      <div className="my-3 border-t border-[#333]"></div>

      {/* Fixed Bottom Section: User Profile & Logout */}
      <div className="sticky bottom-0 flex items-center justify-between bg-black pt-2">
        {/* User Profile */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 ring-2 ring-purple-500">
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="User Profile"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <FaUserCircle className="text-gray-300 text-3xl" />
            )}
          </div>
          {isOpen && (
            <div className="font-medium text-gray-100 truncate">{userName}</div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-purple-600 hover:opacity-80 transition duration-200"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-purple-500"></div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={{ name: userName, email: userEmail, image: userProfileImage }}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={fetchUserProfile}
        />
      )}

      <ToastContainer />

      {/* Hide scrollbar via inline styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;

//
// UserProfileModal Component
//
const UserProfileModal = ({ user, onClose, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user.name || "");
  const [updatedImage, setUpdatedImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUpdatedImage(e.target.files[0]);
    }
  };

  // Save profile updates
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("No authorization token found.");
        return;
      }
      const formData = new FormData();
      formData.append("name", updatedName);
      if (updatedImage) {
        formData.append("image", updatedImage);
      }

      setIsUpdating(true);
      await axios.put(`/auth/users/${user.email}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setTimeout(() => {
        toast.success("Profile updated successfully!");
        onProfileUpdated && onProfileUpdated();
        setIsUpdating(false);
        setIsEditing(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update profile");
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded-lg w-80 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">
          User Profile
        </h2>
        {errorMsg && (
          <p className="text-red-400 text-sm mb-2 text-center">{errorMsg}</p>
        )}
        <div className="flex justify-center mb-4">
          {user.image && !updatedImage ? (
            <img
              src={user.image}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500"
            />
          ) : updatedImage ? (
            <img
              src={URL.createObjectURL(updatedImage)}
              alt="New Avatar"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500"
            />
          ) : (
            <FaUserCircle className="text-6xl text-gray-400" />
          )}
        </div>
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Update Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            />
          ) : (
            <p className="text-gray-200">{user.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <p className="text-gray-200">{user.email}</p>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                title="Cancel"
              >
                <FaTimes />
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 text-white"
                title="Save"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                ) : (
                  <FaSave />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
              title="Edit"
            >
              <FaEdit />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
