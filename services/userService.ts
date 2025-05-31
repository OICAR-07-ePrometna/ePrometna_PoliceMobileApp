import type { User } from '@/models/user';
import apiClient from '@/services/axios';


export async function getLoggedInUser(): Promise<User | undefined> {
  try {
    const response = await apiClient.get(`/user/my-data`);
    console.log('Logged in user data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}