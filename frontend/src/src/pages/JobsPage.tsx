import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { useQuery } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { Job, JobSearchFilters, PaginationParams } from '../types';

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<JobSearchFilters>({
    keyword: searchParams.get('search') || '',
    location: '',
    jobType: undefined,
    experienceLevel: undefined,
    isRemote: undefined,
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const { data: jobsData, isLoading, error } = useQuery(
    ['jobs', filters, pagination],
    () => jobService.searchJobs(filters, pagination),
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (key: keyof JobSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({ ...prev, page: page - 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" textAlign="center">
          Failed to load jobs. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Find Your Next Job
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing opportunities from top companies
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search jobs, companies..."
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  placeholder="e.g. Software Engineer, Google"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g. New York, Remote"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={filters.jobType || ''}
                    label="Job Type"
                    onChange={(e) => handleFilterChange('jobType', e.target.value || undefined)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="FULL_TIME">Full Time</MenuItem>
                    <MenuItem value="PART_TIME">Part Time</MenuItem>
                    <MenuItem value="CONTRACT">Contract</MenuItem>
                    <MenuItem value="INTERNSHIP">Internship</MenuItem>
                    <MenuItem value="FREELANCE">Freelance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    value={filters.experienceLevel || ''}
                    label="Experience"
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value || undefined)}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="ENTRY_LEVEL">Entry Level</MenuItem>
                    <MenuItem value="MID_LEVEL">Mid Level</MenuItem>
                    <MenuItem value="SENIOR_LEVEL">Senior Level</MenuItem>
                    <MenuItem value="EXECUTIVE">Executive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {jobsData?.totalElements || 0} jobs found
          </Typography>

          <Grid container spacing={3}>
            {jobsData?.content.map((job: Job) => (
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
                      <Chip 
                        label={job.jobType.replace('_', ' ')} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={job.experienceLevel.replace('_', ' ')} 
                        size="small" 
                        variant="outlined" 
                      />
                      {job.isRemote && (
                        <Chip 
                          label="Remote" 
                          size="small" 
                          color="primary" 
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {job.description.substring(0, 150)}...
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {job.viewsCount} views • {job.applicationsCount} applications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
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

          {/* Pagination */}
          {jobsData && jobsData.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={jobsData.totalPages}
                page={pagination.page! + 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default JobsPage;
