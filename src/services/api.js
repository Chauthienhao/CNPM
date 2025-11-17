const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// APIs

export const login = async (usernameOrEmail, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Backend expects { username, password }
      body: JSON.stringify({ username: usernameOrEmail, password })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.username || '');
      localStorage.setItem('userEmail', '');
      return { success: true, user: data.user };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
};

export const getCurrentUser = () => {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('userRole'),
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail')
  };
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Học sinh

export const getStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/students`);
    
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error('Get students error:', error);
    throw error;
  }
};

// Tuyến đường

export const getRoutes = async () => {
  try {
    const response = await fetch(`${API_URL}/routes`);
    
    if (!response.ok) throw new Error('Failed to fetch routes');
    return await response.json();
  } catch (error) {
    console.error('Get routes error:', error);
    throw error;
  }
};

// Điểm dừng

export const getStops = async () => {
  try {
    const response = await fetch(`${API_URL}/stops`);
    if (!response.ok) throw new Error('Failed to fetch stops');
    return await response.json();
  } catch (error) {
    console.error('Get stops error:', error);
 
    return [];
  }
};

// Thông báo

export const getBuses = async () => {
  try {
    const response = await fetch(`${API_URL}/buses`);
    if (!response.ok) throw new Error('Failed to fetch buses');
    return await response.json();
  } catch (error) {
    console.error('Get buses error:', error);
  
    return [];
  }
};

// Lịch trình

export const getSchedules = async () => {
  try {
    const response = await fetch(`${API_URL}/schedules`);
    
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return await response.json();
  } catch (error) {
    console.error('Get schedules error:', error);
    throw error;
  }
};

// Thông báo

export const getNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications`);
    
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Tài xế

export const getDrivers = async () => {
  try {
    const response = await fetch(`${API_URL}/drivers`);
    if (!response.ok) {
      console.warn('Drivers API responded with status', response.status);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Get drivers network/error:', error);
    return []; // Return empty so UI gracefully shows no data instead of error
  }
};
