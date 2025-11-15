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
  CardActions,
  Avatar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { jobService } from '../services/jobService';
import { Company, Job } from '../types';
import toast from 'react-hot-toast';

const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
      fetchCompanyJobs();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const companyData = await companyService.getCompanyById(Number(id));
      setCompany(companyData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load company details');
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const jobsData = await jobService.getJobsByCompany(Number(id));
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Failed to load company jobs', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !company) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link component={RouterLink} to="/companies" sx={{ textDecoration: 'none' }}>
          Companies
        </Link>
        <Typography color="text.primary">{company.name}</Typography>
      </Breadcrumbs>

      {/* Company Header */}
      <Paper elevation={3} sx={{ overflow: 'hidden', mb: 3 }}>
        {/* Cover Image */}
        <Box
          sx={{
            height: 200,
            background: company.coverImageUrl
              ? `url(${company.coverImageUrl}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        />
        
        {/* Company Info */}
        <Box sx={{ px: 4, pb: 4, mt: -8, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              src={company.logoUrl}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '3rem',
                bgcolor: '#667eea',
                flexShrink: 0,
              }}
            >
              {company.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, pt: 2, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  fontWeight="bold"
                  sx={{ 
                    wordBreak: 'break-word',
                    color: 'text.primary',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  }}
                >
                  {company.name}
                </Typography>
                {company.isVerified && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
              {company.industry && (
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ mb: 1, wordBreak: 'break-word' }}
                >
                  {company.industry}
                </Typography>
              )}
              {company.fullAddress && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <LocationIcon color="action" fontSize="small" />
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {company.fullAddress}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {company.website && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LanguageIcon />}
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </Button>
                )}
                {company.linkedinUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LinkedInIcon />}
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Company link copied to clipboard');
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* About Company */}
          {company.description && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About {company.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {company.description}
              </Typography>
            </Paper>
          )}

          {/* Company Details */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Company Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {company.industry && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WorkIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Industry
                    </Typography>
                  </Box>
                  <Typography variant="body1">{company.industry}</Typography>
                </Grid>
              )}
              {company.companySize && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Company Size
                    </Typography>
                  </Box>
                  <Typography variant="body1">{company.companySize}</Typography>
                </Grid>
              )}
              {company.foundedYear && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Founded
                    </Typography>
                  </Box>
                  <Typography variant="body1">{company.foundedYear}</Typography>
                </Grid>
              )}
              {company.email && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    <Link href={`mailto:${company.email}`} color="primary">
                      {company.email}
                    </Link>
                  </Typography>
                </Grid>
              )}
              {company.phone && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    <Link href={`tel:${company.phone}`} color="primary">
                      {company.phone}
                    </Link>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Active Job Listings */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active Job Listings ({jobs.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {jobs.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {jobs.map((job) => (
                  <Card key={job.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {job.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Chip label={job.jobType.replace('_', ' ')} size="small" variant="outlined" />
                            <Chip label={job.experienceLevel.replace('_', ' ')} size="small" variant="outlined" />
                            {job.isRemote && <Chip label="Remote" size="small" color="success" />}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                          {(job.minSalary || job.maxSalary) && (
                            <Typography variant="body2" color="primary" fontWeight="medium">
                              {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {job.description.substring(0, 150)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.applicationsCount} applications • Posted {formatDate(job.createdAt)}
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
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active job listings at the moment.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Info Card */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {company.industry && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Industry
                  </Typography>
                  <Typography variant="body1">{company.industry}</Typography>
                </Box>
              )}
              {company.companySize && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Company Size
                  </Typography>
                  <Typography variant="body1">{company.companySize}</Typography>
                </Box>
              )}
              {company.foundedYear && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Founded
                  </Typography>
                  <Typography variant="body1">{company.foundedYear}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {company.isVerified && (
                    <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" />
                  )}
                  {company.isActive && (
                    <Chip label="Active" color="primary" size="small" />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Contact Card */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {company.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Link href={`mailto:${company.email}`} color="primary" underline="hover">
                    {company.email}
                  </Link>
                </Box>
              )}
              {company.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" />
                  <Link href={`tel:${company.phone}`} color="primary" underline="hover">
                    {company.phone}
                  </Link>
                </Box>
              )}
              {company.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon color="action" />
                  <Link href={company.website} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">
                    Visit Website
                  </Link>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Social Links */}
          {(company.linkedinUrl || company.twitterUrl || company.facebookUrl) && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Follow Us
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {company.linkedinUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LinkedInIcon />}
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </Button>
                )}
                {company.twitterUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TwitterIcon />}
                    href={company.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </Button>
                )}
                {company.facebookUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FacebookIcon />}
                    href={company.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDetailsPage;
