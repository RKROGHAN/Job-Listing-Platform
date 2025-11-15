import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { savedJobService } from '../services/savedJobService';
import { Job } from '../types';
import toast from 'react-hot-toast';

const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      checkApplicationStatus();
      checkSavedStatus();
    }
  }, [id, user]);

  const checkApplicationStatus = async () => {
    if (!user || !id) return;
    try {
      // Check if user has already applied
      const applications = await applicationService.getMyApplications();
      const hasAppliedToJob = applications.content?.some((app: any) => app.job?.id === Number(id)) || false;
      setHasApplied(hasAppliedToJob);
    } catch (err) {
      // Silently fail
      console.error('Failed to check application status', err);
    }
  };

  const checkSavedStatus = async () => {
    if (!user || !id) return;
    try {
      const result = await savedJobService.isJobSaved(Number(id));
      setIsSaved(result.isSaved);
    } catch (err) {
      // Silently fail - user might not be logged in
      console.error('Failed to check saved status', err);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setSaving(true);
      if (isSaved) {
        await savedJobService.unsaveJob(Number(id));
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        await savedJobService.saveJob(Number(id));
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const jobData = await jobService.getJobById(Number(id));
      setJob(jobData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for this job');
      navigate('/login');
      return;
    }

    if (!user.resumeUrl) {
      toast.error('Please upload your resume in your profile first');
      navigate('/profile');
      return;
    }

    try {
      setApplying(true);
      await applicationService.applyForJob({
        jobId: job!.id,
        coverLetter: coverLetter || undefined,
        resumeUrl: user.resumeUrl,
      });
      setHasApplied(true);
      setApplyDialogOpen(false);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return null;
  }

  const daysRemaining = getDaysRemaining(job.applicationDeadline);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link component={RouterLink} to="/jobs" sx={{ textDecoration: 'none' }}>
          Jobs
        </Link>
        <Typography color="text.primary">{job.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Job Header Card */}
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {job.title}
                </Typography>
                {job.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" color="primary">
                      {job.company.name}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography variant="body1">{job.location}</Typography>
                    {job.isRemote && (
                      <Chip label="Remote" size="small" color="success" sx={{ ml: 1 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WorkIcon color="action" fontSize="small" />
                    <Typography variant="body1">{job.jobType.replace('_', ' ')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon color="action" fontSize="small" />
                    <Typography variant="body1">{job.experienceLevel.replace('_', ' ')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <MoneyIcon color="action" fontSize="small" />
                  <Typography variant="h6" color="primary">
                    {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                  </Typography>
                </Box>
                {job.applicationDeadline && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Application Deadline: {formatDate(job.applicationDeadline)}
                      {daysRemaining !== null && (
                        <Chip
                          label={daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                          size="small"
                          color={daysRemaining > 0 ? (daysRemaining <= 7 ? 'warning' : 'success') : 'error'}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setApplyDialogOpen(true)}
                disabled={hasApplied || !user || (job.applicationDeadline ? (daysRemaining !== null && daysRemaining <= 0) : false)}
                startIcon={hasApplied ? <CheckCircleIcon /> : <DescriptionIcon />}
                sx={{ minWidth: 200 }}
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleSaveJob}
                disabled={saving || !user}
                startIcon={isSaved ? <CheckCircleIcon /> : undefined}
              >
                {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
              </Button>
              <Button variant="outlined" size="large">
                Share
              </Button>
            </Box>
          </Paper>

          {/* Job Description */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Job Description
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {job.description}
            </Typography>
          </Paper>

          {/* Requirements */}
          {job.requirements && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Requirements
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {job.requirements}
              </Typography>
            </Paper>
          )}

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Required Skills
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {job.requiredSkills.map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Benefits & Perks
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {job.benefits}
              </Typography>
            </Paper>
          )}

          {/* Application Instructions */}
          {job.applicationInstructions && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                How to Apply
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {job.applicationInstructions}
              </Typography>
            </Paper>
          )}

          {/* Job Stats */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Job Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Views
                </Typography>
                <Typography variant="h6">{job.viewsCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Applications
                </Typography>
                <Typography variant="h6">{job.applicationsCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Posted
                </Typography>
                <Typography variant="h6">{formatDate(job.createdAt)}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="h6">{formatDate(job.updatedAt)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Apply Card */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Apply
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {!user ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please login to apply for this job
                </Alert>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Login to Apply
                </Button>
              </Box>
            ) : hasApplied ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  You have already applied for this job
                </Alert>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/applications')}
                >
                  View My Applications
                </Button>
              </Box>
            ) : (
              <Box>
                {!user.resumeUrl && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please upload your resume in your profile
                  </Alert>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setApplyDialogOpen(true)}
                  disabled={!user.resumeUrl || (job.applicationDeadline ? (daysRemaining !== null && daysRemaining <= 0) : false)}
                >
                  Apply Now
                </Button>
                {job.applicationDeadline && daysRemaining !== null && daysRemaining <= 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Application deadline has passed
                  </Alert>
                )}
              </Box>
            )}
          </Paper>

          {/* Company Info */}
          {job.company && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About Company
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {job.company.name.charAt(0)}
                </Box>
                <Box>
                  <Typography variant="h6">{job.company.name}</Typography>
                  {job.company.industry && (
                    <Typography variant="body2" color="text.secondary">
                      {job.company.industry}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => job.company && navigate(`/companies/${job.company.id}`)}
              >
                View Company Profile
              </Button>
            </Paper>
          )}

          {/* Job Summary */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Job Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Job Type
                </Typography>
                <Typography variant="body1">{job.jobType.replace('_', ' ')}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Experience Level
                </Typography>
                <Typography variant="body1">{job.experienceLevel.replace('_', ' ')}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {job.location} {job.isRemote && '(Remote)'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Salary
                </Typography>
                <Typography variant="body1">
                  {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                </Typography>
              </Box>
              {job.category && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">{job.category.name}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Apply for {job.title}</Typography>
            <IconButton onClick={() => setApplyDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your resume will be attached automatically from your profile.
          </Alert>
          <TextField
            label="Cover Letter (Optional)"
            fullWidth
            multiline
            rows={6}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Write a cover letter explaining why you're a good fit for this position..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={applying}
            startIcon={applying ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {applying ? 'Applying...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetailsPage;
