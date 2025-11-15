import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const NotificationsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Notifications
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          This page will show user notifications.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotificationsPage;
