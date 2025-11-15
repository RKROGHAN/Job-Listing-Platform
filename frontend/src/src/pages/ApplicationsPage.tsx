import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ApplicationsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Applications
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          This page will show job applications and their status.
        </Typography>
      </Box>
    </Container>
  );
};

export default ApplicationsPage;
