import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const CompaniesPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Companies
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          This page will show a list of companies.
        </Typography>
      </Box>
    </Container>
  );
};

export default CompaniesPage;
