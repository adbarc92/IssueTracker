import { User, UserRole } from 'types/user';
import { Task } from 'types/task';
import { useGetData, CacheKey, IDataLoader } from 'store/useGetData';
import { api } from 'store/api';

// Temp

// Helper function for the hook below, not technically a hook
export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// This is a hook because it returns a function that contains a hook
export const useGetUser = (id: number): IDataLoader<User> => {
  return useGetData(
    () => {
      return getUser(id);
    },
    CacheKey.USERS,
    String(id)
  );
};

export const getUsers = async (): Promise<User[] | null> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const useGetUsers = (): IDataLoader<User[] | null> => {
  return useGetData(getUsers, CacheKey.USERS);
};

export const createUser = async (
  name: string,
  email: string,
  role: UserRole
): Promise<User | null> => {
  try {
    const response = await api.post('/users', { name, email, role });
    console.log(response);
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTasks = async (): Promise<Task[] | null> => {
  try {
    const res = await api.get('/tasks');
    return res.data;
  } catch (e) {
    console.error(e);
    // throw e;
    return null;
  }
};

export const useGetTasks = (): IDataLoader<Task[] | null> => {
  return useGetData(getTasks, CacheKey.TASKS);
};
