import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  Bookmark as BookmarkIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { savedJobService } from '../services/savedJobService';
import { notificationService } from '../services/notificationService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: recentJobs } = useQuery('recentJobs', () => jobService.getRecentJobs(5));
  const { data: myApplications } = useQuery('myApplications', () => applicationService.getMyApplications({ page: 0, size: 5 }));
  const { data: savedJobs } = useQuery('savedJobs', () => savedJobService.getAllSavedJobs());
  const { data: unreadNotifications } = useQuery('unreadNotifications', () => notificationService.getUnreadNotifications());
  const { data: myJobs } = useQuery('myJobs', () => jobService.getMyJobs(), {
    enabled: user?.role === 'EMPLOYER',
  });

  const getDashboardTitle = () => {
    if (user?.role === 'JOB_SEEKER') {
      return 'Job Seeker Dashboard';
    } else if (user?.role === 'EMPLOYER') {
      return 'Employer Dashboard';
    }
    return 'Dashboard';
  };

  const getQuickActions = () => {
    if (user?.role === 'JOB_SEEKER') {
      return [
        { label: 'Browse Jobs', icon: <WorkIcon />, path: '/jobs', color: 'primary' },
        { label: 'My Applications', icon: <TrendingUpIcon />, path: '/applications', color: 'secondary' },
        { label: 'Saved Jobs', icon: <BookmarkIcon />, path: '/saved-jobs', color: 'success' },
        { label: 'Update Profile', icon: <PersonIcon />, path: '/profile', color: 'info' },
      ];
    } else if (user?.role === 'EMPLOYER') {
      return [
        { label: 'Post a Job', icon: <WorkIcon />, path: '/post-job', color: 'primary' },
        { label: 'My Jobs', icon: <BusinessIcon />, path: '/jobs', color: 'secondary' },
        { label: 'Applications', icon: <TrendingUpIcon />, path: '/applications', color: 'success' },
        { label: 'Company Profile', icon: <BusinessIcon />, path: '/profile', color: 'info' },
      ];
    }
    return [];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {getDashboardTitle()}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.firstName}! Here's what's happening with your account.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getQuickActions().map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: `${action.color}.main`, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  {action.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {action.label}
                </Typography>
                <Button
                  variant="contained"
                  color={action.color as any}
                  onClick={() => navigate(action.path)}
                  fullWidth
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {user?.role === 'JOB_SEEKER' ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Job Applications
                  </Typography>
                  <List>
                    {myApplications?.content.slice(0, 3).map((application) => (
                      <ListItem key={application.id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            <WorkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={application.job.title}
                          secondary={`Applied on ${new Date(application.appliedAt).toLocaleDateString()} • Status: ${application.status}`}
                        />
                        <Chip 
                          label={application.status.replace('_', ' ')} 
                          size="small" 
                          color={application.status === 'ACCEPTED' ? 'success' : application.status === 'REJECTED' ? 'error' : 'default'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    My Job Postings
                  </Typography>
                  <List>
                    {myJobs?.slice(0, 3).map((job) => (
                      <ListItem key={job.id} divider>
                        <ListItemAvatar>
                          <Avatar>
                            <WorkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={job.title}
                          secondary={`Posted on ${new Date(job.createdAt).toLocaleDateString()} • ${job.applicationsCount} applications`}
                        />
                        <Chip 
                          label={job.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={job.isActive ? 'success' : 'default'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {unreadNotifications && unreadNotifications.length > 0 ? (
                <List>
                  {unreadNotifications.slice(0, 5).map((notification) => (
                    <ListItem key={notification.id} divider>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/notifications')}
              >
                View All Notifications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Latest Job Opportunities
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentJobs?.slice(0, 5).map((job) => (
                  <ListItem key={job.id} divider>
                    <ListItemAvatar>
                      <Avatar src={job.company?.logoUrl}>
                        {job.company?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={job.title}
                      secondary={`${job.company?.name} • ${job.location} • ${job.jobType.replace('_', ' ')}`}
                    />
                    <Button
                      size="small"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/jobs')}
              >
                Browse All Jobs
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Your Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {user?.role === 'JOB_SEEKER' ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Applications</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {myApplications?.totalElements || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Saved Jobs</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {savedJobs?.length || 0}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Job Postings</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {myJobs?.length || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Applications</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {myJobs?.reduce((sum, job) => sum + job.applicationsCount, 0) || 0}
                      </Typography>
                    </Box>
                  </>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Unread Notifications</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {unreadNotifications?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
