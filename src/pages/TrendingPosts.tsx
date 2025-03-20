import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardMedia, Box, Grid } from '@mui/material';
import { Post, User } from '../types';
import { getUsers, getAllPosts, getPostComments, getRandomImage } from '../services/api';

interface PostWithDetails extends Post {
  user: User;
  commentCount: number;
  imageUrl: string;
}

const TrendingPosts: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

        const maxCommentCount = Math.max(...postsWithComments.map(post => post.commentCount));
        const trendingPostsWithUsers = postsWithComments
          .filter(post => post.commentCount === maxCommentCount)
          .map(post => ({
            ...post,
            user: userMap.get(post.userid) || { id: post.userid.toString(), name: 'Unknown User' },
            imageUrl: getRandomImage()
          }));

        setTrendingPosts(trendingPostsWithUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trending Posts
      </Typography>
      <Grid container spacing={3}>
        {trendingPosts.map((post) => (
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

export default TrendingPosts; 