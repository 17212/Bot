import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchHealth() {
  const { data } = await api.get('/health');
  return data;
}

export async function fetchStats() {
  const { data } = await axios.get('/trpc/stats.summary');
  return data.result?.data ?? {};
}

export async function fetchPosts() {
  const { data } = await axios.get('/trpc/posts.list');
  return data.result?.data ?? [];
}
