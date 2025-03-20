import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Card, CardContent, CardMedia, Box, Grid, CircularProgress } from '@mui/material';
import { Post, User } from '../types';
import { getUsers, getAllPosts, getPostComments, getRandomImage } from '../services/api';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<(Post & { user: User; commentCount: number; imageUrl: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const [usersResponse, posts] = await Promise.all([
        getUsers(),
        getAllPosts()
      ]);

      const users = Object.entries(usersResponse.users).map(([id, name]) => ({
        id,
        name
      }));

      const userMap = new Map(users.map(user => [parseInt(user.id), user]));

      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const commentsResponse = await getPostComments(post.id);
          return {
            ...post,
            commentCount: commentsResponse.comments.length
          };
        })
      );

      const postsWithUsers = postsWithComments
        .map(post => ({
          ...post,
          user: userMap.get(post.userid) || { id: post.userid.toString(), name: 'Unknown User' },
          imageUrl: getRandomImage()
        }))
        .sort((a, b) => b.id - a.id);

      setPosts(postsWithUsers);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  if (loading && posts.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Feed
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={post.imageUrl}
                alt="Post image"
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.user.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    Comments: {post.commentCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Feed; 