"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Define types
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface WeatherData {
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
  }>;
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Dynamically import Chart.js components to avoid SSR issues
const BarChart = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Bar),
  { ssr: false }
);

// Import Chart.js registration in a useEffect
const registerChartJS = () => {
  import('chart.js').then(({ Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend }) => {
    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
  });
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Complete dashboard', completed: false },
    { id: 2, title: 'Add data visualization', completed: false },
    { id: 3, title: 'Implement settings', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [{
      label: 'User Activity',
      data: [65, 59, 80, 81, 56],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  });

  // Register Chart.js components on client-side only
  useEffect(() => {
    registerChartJS();
  }, []);

  // Fetch weather data from API
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Using a placeholder API for demonstration
        const data: WeatherData = {
          main: { temp: 21 },
          weather: [{ description: 'Partly cloudy' }]
        };
        setWeatherData(data);
        
        // In production, you would use a real API call:
        // const response = await fetch('https://api.example.com/weather');
        // const data = await response.json();
        // setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };
    
    fetchWeatherData();
  }, []);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [status, router, session]);

  // Apply theme
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900';
  }, [theme]);

  // Task management functions
  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Update user credentials
  const updateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Credentials updated! In a real app, this would connect to your backend API.');
    // In a real implementation, you would call an API endpoint to update user credentials
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getMainContentBackground = () => {
    return theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Top Navigation */}
      <nav className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md flex justify-between items-center`}>
        <h1 className="text-xl font-bold">My Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Welcome, {session?.user?.name || 'User'}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`w-full md:w-64 p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <ul>
            <li className={`p-3 rounded mb-2 cursor-pointer ${activeTab === 'overview' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('overview')}>
              Overview
            </li>
            <li className={`p-3 rounded mb-2 cursor-pointer ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('tasks')}>
              Tasks
            </li>
            <li className={`p-3 rounded mb-2 cursor-pointer ${activeTab === 'settings' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('settings')}>
              Settings
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={`${getMainContentBackground()} p-6 rounded-lg shadow-md`}>
              <h2 className="text-2xl font-bold mb-6">Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info Card */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                  <h3 className="text-lg font-semibold mb-4">User Information</h3>
                  <p className="mb-2">
                    <span className="font-medium">Username:</span> {session?.user?.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {session?.user?.email}
                  </p>
                </div>
                
                {/* Weather Widget Card */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                  <h3 className="text-lg font-semibold mb-4">Weather Information</h3>
                  {weatherData ? (
                    <div>
                      <p className="text-2xl font-bold mb-1">London</p>
                      <p className="mb-2">Temperature: {weatherData.main?.temp}°C</p>
                      <p>Conditions: {weatherData.weather?.[0]?.description}</p>
                    </div>
                  ) : (
                    <p>Loading weather data...</p>
                  )}
                </div>
                
                {/* Analytics Chart */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm col-span-1 md:col-span-2`}>
                  <h3 className="text-lg font-semibold mb-4">Activity Analytics</h3>
                  <div style={{ height: '300px' }}>
                    {typeof window !== 'undefined' && (
                      <BarChart 
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Monthly User Activity'
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className={`${getMainContentBackground()} p-6 rounded-lg shadow-md`}>
              <h2 className="text-2xl font-bold mb-6">Task Management</h2>
              
              <div className="mb-4 flex">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <button
                  onClick={addTask}
                  className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li key={task.id} className={`p-3 rounded-md flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="mr-3 h-5 w-5"
                      />
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center py-4 text-gray-500">No tasks yet. Add one above!</p>
                )}
              </ul>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className={`${getMainContentBackground()} p-6 rounded-lg shadow-md`}>
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Theme Preferences</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    Light Mode
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Update Credentials</h3>
                <form onSubmit={updateCredentials} className="space-y-4">
                  <div>
                    <label className="block mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}