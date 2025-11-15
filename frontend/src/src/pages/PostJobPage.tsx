import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';
import { categoryService } from '../services/categoryService';
import { skillService } from '../services/skillService';
import { JobRequest, Job, Company, Category, Skill } from '../types';
import toast from 'react-hot-toast';

const steps = ['Job Details', 'Requirements & Benefits', 'Additional Information'];

const jobTypes = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const experienceLevels = [
  { value: 'ENTRY_LEVEL', label: 'Entry Level' },
  { value: 'MID_LEVEL', label: 'Mid Level' },
  { value: 'SENIOR_LEVEL', label: 'Senior Level' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState<string>('');
  const [job, setJob] = useState<Job | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<JobRequest>({
    title: '',
    description: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID_LEVEL',
    minSalary: undefined,
    maxSalary: undefined,
    currency: 'USD',
    isRemote: false,
    applicationDeadline: '',
    requirements: '',
    benefits: '',
    applicationInstructions: '',
    companyId: undefined,
    categoryId: undefined,
    requiredSkillIds: [],
  });

  useEffect(() => {
    if (user?.role !== 'EMPLOYER') {
      navigate('/');
      return;
    }
    fetchInitialData();
    if (id) {
      fetchJobDetails();
    }
  }, [user, id]);

  const fetchInitialData = async () => {
    try {
      // Fetch user's company
      try {
        const myCompany = await companyService.getMyCompany();
        setCompanies([myCompany]);
        setFormData((prev) => ({ ...prev, companyId: myCompany.id }));
      } catch (err) {
        // Company doesn't exist, that's okay
        console.log('No company found, user needs to create one first');
      }

      // Fetch categories
      const cats = await categoryService.getAllCategories();
      setCategories(cats);

      // Fetch skills
      const skills = await skillService.getAllSkills();
      setAllSkills(skills);
    } catch (err: any) {
      console.error('Failed to fetch initial data', err);
      toast.error('Failed to load form data');
    }
  };

  const fetchJobDetails = async () => {
    try {
      setFetching(true);
      const jobData = await jobService.getJobById(Number(id));
      setJob(jobData);
      setFormData({
        title: jobData.title || '',
        description: jobData.description || '',
        location: jobData.location || '',
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        minSalary: jobData.minSalary,
        maxSalary: jobData.maxSalary,
        currency: jobData.currency || 'USD',
        isRemote: jobData.isRemote || false,
        applicationDeadline: jobData.applicationDeadline
          ? new Date(jobData.applicationDeadline).toISOString().split('T')[0]
          : '',
        requirements: jobData.requirements || '',
        benefits: jobData.benefits || '',
        applicationInstructions: jobData.applicationInstructions || '',
        companyId: jobData.company?.id,
        categoryId: jobData.category?.id,
        requiredSkillIds: jobData.requiredSkills?.map((s) => s.id) || [],
      });
    } catch (err: any) {
      toast.error('Failed to load job details');
      navigate('/post-job');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handleSkillsChange = (selectedSkills: Skill[]) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkillIds: selectedSkills.map((s) => s.id),
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.title.trim()) {
        setError('Job title is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Job description is required');
        return;
      }
      if (!formData.location.trim()) {
        setError('Location is required');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!formData.title.trim()) {
        setError('Job title is required');
        setActiveStep(0);
        return;
      }
      if (!formData.description.trim()) {
        setError('Job description is required');
        setActiveStep(0);
        return;
      }
      if (!formData.location.trim()) {
        setError('Location is required');
        setActiveStep(0);
        return;
      }

      const jobRequest: JobRequest = {
        ...formData,
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : undefined,
      };

      if (job) {
        // Update existing job
        await jobService.updateJob(job.id, jobRequest);
        toast.success('Job updated successfully!');
      } else {
        // Create new job
        await jobService.createJob(jobRequest);
        toast.success('Job posted successfully!');
      }

      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save job';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const selectedSkills = allSkills.filter((s) => formData.requiredSkillIds?.includes(s.id));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {job ? 'Update Job Posting' : 'Post a New Job'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {job
            ? 'Update the job details that job seekers can view'
            : 'Create a job posting to attract qualified candidates'}
        </Typography>
      </Box>

      {companies.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You need to create a company profile first before posting jobs.{' '}
          <Button
            size="small"
            onClick={() => navigate('/create-company')}
            sx={{ textTransform: 'none' }}
          >
            Create Company Profile
          </Button>
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Job Details */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Job Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  InputProps={{
                    startAdornment: (
                      <WorkIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={8}
                  label="Job Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
                  helperText="This description will be visible to job seekers"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA or Remote"
                  InputProps={{
                    startAdornment: (
                      <LocationIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isRemote}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isRemote: e.target.checked }))
                      }
                      name="isRemote"
                    />
                  }
                  label="Remote Work Available"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Job Type"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  {jobTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Experience Level"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  {experienceLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Minimum Salary"
                  name="minSalary"
                  type="number"
                  value={formData.minSalary || ''}
                  onChange={handleNumberChange}
                  InputProps={{
                    startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Maximum Salary"
                  name="maxSalary"
                  type="number"
                  value={formData.maxSalary || ''}
                  onChange={handleNumberChange}
                  InputProps={{
                    startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr} value={curr}>
                      {curr}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <TimeIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  helperText="Leave empty for no deadline"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Requirements & Benefits */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Requirements & Benefits
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the required qualifications, skills, experience, education, certifications, etc..."
                  helperText="What qualifications and experience are required for this position?"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Benefits & Perks"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="List the benefits, perks, and advantages of working at your company..."
                  helperText="What benefits and perks do you offer? (e.g., Health insurance, 401k, flexible hours, remote work, etc.)"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Skills
                </Typography>
                <Autocomplete
                  multiple
                  options={allSkills}
                  getOptionLabel={(option) => option.name}
                  value={selectedSkills}
                  onChange={(_, newValue) => handleSkillsChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select required skills"
                      helperText="Choose the skills required for this position"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 3: Additional Information */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Additional Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Application Instructions"
                  name="applicationInstructions"
                  value={formData.applicationInstructions}
                  onChange={handleChange}
                  placeholder="Provide specific instructions for applicants (e.g., 'Please submit your resume and portfolio', 'Include salary expectations', etc.)"
                  helperText="Any special instructions for applicants?"
                />
              </Grid>
              {companies.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Company
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {companies[0].name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        This job will be associated with your company profile
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || companies.length === 0}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Saving...' : job ? 'Update Job' : 'Post Job'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostJobPage;
