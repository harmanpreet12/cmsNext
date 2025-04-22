"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

// Define types
type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
};

type WeatherData = {
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
};

type ThemeType = 'light' | 'dark' | 'blue';

type ThemeStyles = {
  [key in ThemeType]: {
    bg: string;
    card: string;
    text: string;
    border: string;
  };
};

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [username, setUsername] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [theme, setTheme] = useState<ThemeType>("light");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [taskPriority, setTaskPriority] = useState<Task['priority']>("medium");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    
    if (session?.user) {
      setUsername(session.user.name || "");
      // Load tasks from local storage
      const storedTasks = localStorage.getItem(`tasks_${session.user.email}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        
        // Using WeatherAPI for Toronto weather
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=f0d7a4f1e6774d9c85f214220252104&q=Toronto&aqi=no`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        } else {
          console.error('Failed to fetch weather data');
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    if (session?.user?.email && tasks.length > 0) {
      localStorage.setItem(`tasks_${session.user.email}`, JSON.stringify(tasks));
    }
  }, [tasks, session]);

  // Add new task
  const addTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newTask.trim()) return;
    
    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority: taskPriority,
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTaskItem]);
    setNewTask("");
    setTaskPriority("medium");
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // Also remove from local storage if it's the last task
    if (tasks.length === 1 && session?.user?.email) {
      localStorage.removeItem(`tasks_${session.user.email}`);
    }
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      setLoading(true);
      
      // First, verify current password by attempting to log in
      await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
        {
          identifier: session?.user?.email,
          password: currentPassword,
        }
      );
      
      // If login successful, update the password
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/change-password`,
        {
          currentPassword,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.jwt}`,
          },
        }
      );
      
      if (response.data && response.data.jwt) {
        // Update session with new JWT
        await update({
          ...session,
          user: {
            ...session?.user,
            jwt: response.data.jwt,
          },
        });
        
        setSuccessMessage("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      let errorMsg = "Failed to update profile";
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{error?: {message?: string}}>;
        const strapiError = axiosError.response?.data?.error?.message;
        if (strapiError) {
          errorMsg = strapiError;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!username) {
      setError("Username cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${session?.user?.id}`,
        {
          username: username,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.jwt}`,
          },
        }
      );
      
      if (response.data) {
        // Update session with new username
        await update({
          ...session,
          user: {
            ...session?.user,
            name: username,
          },
        });
        
        setSuccessMessage("Username updated successfully!");
      }
    } catch (error) {
      let errorMsg = "Failed to update username";
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as AxiosError<{error?: {message?: string}}>;
        const strapiError = axiosError.response?.data?.error?.message;
        if (strapiError) {
          errorMsg = strapiError;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
    localStorage.setItem('dashboard_theme', selectedTheme);
  };
  
  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard_theme') as ThemeType | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'blue')) {
      setTheme(savedTheme);
    }
  }, []);

  if (status === "loading") {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  const themeStyles: ThemeStyles = {
    light: {
      bg: "#f9fafb",
      card: "white",
      text: "#333333",
      border: "#e5e7eb"
    },
    dark: {
      bg: "#1f2937",
      card: "#374151",
      text: "#f3f4f6",
      border: "#4b5563"
    },
    blue: {
      bg: "#ebf5ff",
      card: "#ffffff",
      text: "#1e40af",
      border: "#bfdbfe"
    }
  };
  
  const currentTheme = themeStyles[theme];

  return (
    <div style={{ 
      backgroundColor: currentTheme.bg, 
      minHeight: "100vh",
      padding: "40px 20px",
      color: currentTheme.text,
      transition: "all 0.3s ease"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        backgroundColor: currentTheme.card, 
        borderRadius: "8px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "25px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${currentTheme.border}`,
          paddingBottom: "15px",
          marginBottom: "25px"
        }}>
          <h1 style={{ fontSize: "28px", margin: 0 }}>Dashboard</h1>
          
          <div style={{
            display: "flex",
            gap: "15px"
          }}>
            <button 
              onClick={() => setActiveTab("dashboard")}
              style={{
                backgroundColor: activeTab === "dashboard" ? "#3b82f6" : "transparent",
                color: activeTab === "dashboard" ? "white" : currentTheme.text,
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("tasks")}
              style={{
                backgroundColor: activeTab === "tasks" ? "#3b82f6" : "transparent",
                color: activeTab === "tasks" ? "white" : currentTheme.text,
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Tasks
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              style={{
                backgroundColor: activeTab === "profile" ? "#3b82f6" : "transparent",
                color: activeTab === "profile" ? "white" : currentTheme.text,
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              style={{
                backgroundColor: activeTab === "settings" ? "#3b82f6" : "transparent",
                color: activeTab === "settings" ? "white" : currentTheme.text,
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Settings
            </button>
          </div>
        </div>
        
        {activeTab === "dashboard" && (
          <>
            {session?.user ? (
              <div style={{ marginBottom: "30px" }}>
                <div style={{ 
                  display: "flex", 
                  marginBottom: "12px",
                  alignItems: "center"
                }}>
                  <span style={{ 
                    fontWeight: "bold", 
                    width: "100px" 
                  }}>Username:</span>
                  <span>{session.user.name || session.user.email}</span>
                </div>
                
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px"
                }}>
                  <span style={{ 
                    fontWeight: "bold", 
                    width: "100px" 
                  }}>Email:</span>
                  <span>{session.user.email}</span>
                </div>
              </div>
            ) : (
              <p style={{ marginBottom: "20px" }}>User information not available</p>
            )}
            
            {/* Weather Widget */}
            <div style={{
              backgroundColor: currentTheme === themeStyles.dark ? "#4b5563" : "#f3f4f6",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Weather in Toronto</h3>
              
              {weatherLoading ? (
                <p>Loading weather data...</p>
              ) : weatherData ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img 
                    src={weatherData.current.condition.icon} 
                    alt={weatherData.current.condition.text}
                    width="64"
                    height="64"
                  />
                  <div style={{ marginLeft: "15px" }}>
                    <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>
                      {weatherData.current.temp_c}°C
                    </p>
                    <p style={{ margin: "5px 0" }}>{weatherData.current.condition.text}</p>
                    <p style={{ margin: "5px 0" }}>
                      Humidity: {weatherData.current.humidity}% | 
                      Wind: {weatherData.current.wind_kph} km/h
                    </p>
                  </div>
                </div>
              ) : (
                <p>Weather data unavailable</p>
              )}
            </div>
            
            {/* Data Visualization Widget */}
            <div style={{
              backgroundColor: currentTheme === themeStyles.dark ? "#4b5563" : "#f3f4f6",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Activity Overview</h3>
              <div style={{ display: "flex", height: "150px", alignItems: "flex-end" }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const height = Math.floor(Math.random() * 100) + 20;
                  return (
                    <div key={day} style={{ flex: 1, margin: "0 5px", textAlign: "center" }}>
                      <div style={{
                        height: `${height}px`,
                        backgroundColor: "#3b82f6",
                        borderRadius: "4px 4px 0 0"
                      }} />
                      <div style={{ marginTop: "8px", fontSize: "14px" }}>{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{ 
                backgroundColor: "#ef4444", 
                color: "white", 
                border: "none", 
                padding: "10px 16px", 
                borderRadius: "4px", 
                cursor: "pointer",
                fontWeight: "500",
                display: "inline-block"
              }}
            >
              Logout
            </button>
          </>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Task Manager</h2>
            
            {/* Add new task form */}
            <form onSubmit={addTask} style={{ 
              marginBottom: "25px",
              backgroundColor: currentTheme === themeStyles.dark ? "#4b5563" : "#f3f4f6",
              padding: "15px",
              borderRadius: "8px"
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                />
                
                <select
                  value={taskPriority}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => 
                    setTaskPriority(e.target.value as Task['priority'])}
                  style={{
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                
                <button
                  type="submit"
                  disabled={!newTask.trim()}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: !newTask.trim() ? "not-allowed" : "pointer",
                    fontWeight: "500"
                  }}
                >
                  Add
                </button>
              </div>
            </form>
            
            {/* Task list */}
            <div>
              {tasks.length === 0 ? (
                <p style={{ textAlign: "center", padding: "20px" }}>
                  No tasks yet. Add a task to get started!
                </p>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 15px",
                      marginBottom: "10px",
                      backgroundColor: currentTheme === themeStyles.dark ? "#4b5563" : "white",
                      borderRadius: "6px",
                      borderLeft: `4px solid ${
                        task.priority === "high" ? "#ef4444" : 
                        task.priority === "medium" ? "#f59e0b" : "#10b981"
                      }`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        style={{ marginRight: "12px", width: "18px", height: "18px" }}
                      />
                      <span style={{ 
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.7 : 1,
                        fontSize: "16px"
                      }}>
                        {task.title}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{
                        fontSize: "12px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        backgroundColor: 
                          task.priority === "high" ? "#fecaca" : 
                          task.priority === "medium" ? "#fef3c7" : "#d1fae5",
                        color: 
                          task.priority === "high" ? "#b91c1c" : 
                          task.priority === "medium" ? "#92400e" : "#065f46",
                        marginRight: "10px"
                      }}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          backgroundColor: "transparent",
                          color: "#ef4444",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          transition: "background-color 0.2s"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === "profile" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Update Profile</h2>
            
            {error && (
              <div style={{
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 15px",
                borderRadius: "4px",
                marginBottom: "15px"
              }}>
                {error}
              </div>
            )}
            
            {successMessage && (
              <div style={{
                backgroundColor: "#f0fdf4",
                color: "#166534",
                padding: "10px 15px",
                borderRadius: "4px",
                marginBottom: "15px"
              }}>
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleUpdateUsername} style={{ marginBottom: "30px" }}>
              <h3>Update Username</h3>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Updating..." : "Update Username"}
              </button>
            </form>
            
            <form onSubmit={handleUpdateProfile}>
              <h3>Change Password</h3>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                />
              </div>
              
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                />
              </div>
              
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${currentTheme.border}`,
                    backgroundColor: currentTheme === themeStyles.dark ? "#374151" : "white",
                    color: currentTheme.text
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === "settings" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Dashboard Settings</h2>
            
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>Theme</h3>
              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  onClick={() => applyTheme("light")}
                  style={{
                    backgroundColor: theme === "light" ? "#3b82f6" : "#f3f4f6",
                    color: theme === "light" ? "white" : "#333",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => applyTheme("dark")}
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#374151",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Dark
                </button>
                <button
                  onClick={() => applyTheme("blue")}
                  style={{
                    backgroundColor: theme === "blue" ? "#3b82f6" : "#bfdbfe",
                    color: theme === "blue" ? "white" : "#1e40af",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Blue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}