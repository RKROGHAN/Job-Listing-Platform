import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: recentJobs } = useQuery('recentJobs', () => jobService.getRecentJobs(6));
  const { data: featuredJobs } = useQuery('featuredJobs', () => jobService.getFeaturedJobs(6));
  const { data: verifiedCompanies } = useQuery('verifiedCompanies', () => companyService.getVerifiedCompanies());

  const stats = [
    { label: 'Active Jobs', value: '10,000+', icon: <WorkIcon />, color: theme.palette.primary.main },
    { label: 'Companies', value: '2,500+', icon: <BusinessIcon />, color: theme.palette.secondary.main },
    { label: 'Job Seekers', value: '50,000+', icon: <PeopleIcon />, color: theme.palette.success.main },
    { label: 'Success Rate', value: '95%', icon: <TrendingUpIcon />, color: theme.palette.warning.main },
  ];

  const features = [
    {
      title: 'Smart Job Matching',
      description: 'Our AI-powered algorithm matches you with the perfect job opportunities based on your skills and preferences.',
      icon: <SearchIcon />,
    },
    {
      title: 'Company Insights',
      description: 'Get detailed insights about companies, their culture, and what it\'s like to work there.',
      icon: <BusinessIcon />,
    },
    {
      title: 'Application Tracking',
      description: 'Track your job applications, get status updates, and manage your job search efficiently.',
      icon: <TrendingUpIcon />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Find Your Dream Job
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Connect with top companies and discover amazing career opportunities
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" component="div" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Why Choose JobPortal?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            We make job searching and hiring simple, efficient, and effective
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mx: 'auto', mb: 2, width: 64, height: 64 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Recent Jobs Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
          Latest Job Opportunities
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover the newest job postings from top companies
        </Typography>
        <Grid container spacing={3}>
          {recentJobs?.slice(0, 6).map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={job.company?.logoUrl}
                      sx={{ mr: 2, width: 48, height: 48 }}
                    >
                      {job.company?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3" fontWeight="bold">
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.company?.name} • {job.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={job.jobType.replace('_', ' ')} size="small" />
                    <Chip label={job.experienceLevel.replace('_', ' ')} size="small" />
                    {job.isRemote && <Chip label="Remote" size="small" color="primary" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {job.description.substring(0, 150)}...
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/jobs')}
          >
            View All Jobs
          </Button>
        </Box>
      </Container>

      {/* Top Companies Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Top Companies
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Join these amazing companies and build your career
          </Typography>
          <Grid container spacing={3}>
            {verifiedCompanies?.slice(0, 6).map((company) => (
              <Grid item xs={12} sm={6} md={4} key={company.id}>
                <Card sx={{ textAlign: 'center', height: '100%', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Avatar
                      src={company.logoUrl}
                      sx={{ mx: 'auto', mb: 2, width: 80, height: 80 }}
                    >
                      {company.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                      {company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {company.industry}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: 'gold', fontSize: 20 }} />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      View Company
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Join thousands of professionals who found their dream jobs through JobPortal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!user && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          )}
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
