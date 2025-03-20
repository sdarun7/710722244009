import axios from 'axios';
import { User, Post, Comment, UsersResponse, PostsResponse, CommentsResponse } from '../types';

const BASE_URL = 'http://20.244.56.144/test';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const getUsers = async (): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>('/users');
  return response.data;
};

export const getUserPosts = async (userId: string): Promise<PostsResponse> => {
  const response = await api.get<PostsResponse>(`/users/${userId}/posts`);
  return response.data;
};

export const getPostComments = async (postId: number): Promise<CommentsResponse> => {
  const response = await api.get<CommentsResponse>(`/posts/${postId}/comments`);
  return response.data;
};

export const getAllPosts = async (): Promise<Post[]> => {
  const users = await getUsers();
  const userIds = Object.keys(users.users);
  const postsPromises = userIds.map(userId => getUserPosts(userId));
  const postsResponses = await Promise.all(postsPromises);
  return postsResponses.flatMap(response => response.posts);
};

export const getRandomImage = (width: number = 400, height: number = 300): string => {
  return `https://picsum.photos/${width}/${height}`;
};

export const getRandomProfileImage = (): string => {
  return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
}; 