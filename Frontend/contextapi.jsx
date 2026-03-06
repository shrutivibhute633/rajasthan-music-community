import React, { createContext, useState, useContext } from "react";

// Create context with default values
const UserContext = createContext({
  user: null, // Object to hold user details
  isAuthenticated: false,
  setUser: () => {}, // Placeholder functions
  login: () => {},
  logout: () => {},
  signup: () => {},
});

// Custom hook to use user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user object { id, role, username, etc. }
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login function
  const login = (userData) => {
    setUser(userData); // e.g., { id: 1, role: "artist", username: "user1" }
    setIsAuthenticated(true);
    // Optionally, save to localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  // Signup function (can be similar to login after API call)
  const signup = (userData) => {
    setUser(userData); // Set user data after successful signup
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  // Provide the context value
  const value = {
    user,
    isAuthenticated,
    setUser,
    login,
    logout,
    signup,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};