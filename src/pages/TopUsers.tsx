import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Avatar, Box, Grid } from '@mui/material';
import { User } from '../types';
import { getUsers, getAllPosts, getRandomProfileImage } from '../services/api';

interface UserWithCount extends User {
  postCount: number;
  profileImage: string;
}

const TopUsers: React.FC = () => {
  const [topUsers, setTopUsers] = useState<UserWithCount[]>([]);
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

        const userPostCounts = posts.reduce((acc, post) => {
          acc[post.userid] = (acc[post.userid] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const usersWithCounts = users
          .map(user => ({
            ...user,
            postCount: userPostCounts[parseInt(user.id)] || 0,
            profileImage: getRandomProfileImage()
          }))
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 5);

        setTopUsers(usersWithCounts);
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
        Top Users
      </Typography>
      <Grid container spacing={3}>
        {topUsers.map((user) => (
          <Grid item xs={12} key={user.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={user.profileImage}
                    alt={user.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Posts: {user.postCount}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TopUsers; 