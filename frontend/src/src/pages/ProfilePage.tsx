import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { fileService } from '../services/fileService';
import { skillService } from '../services/skillService';
import { User, Skill } from '../types';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchAvailableSkills = async () => {
    try {
      const skills = await skillService.getAllSkills();
      setAvailableSkills(skills);
    } catch (err: any) {
      toast.error('Failed to load skills');
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const profileData = await userService.getProfile();
      setUser(profileData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string, currentValue: string = '') => {
    setEditField(field);
    setEditValue(currentValue);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      const updateData: Partial<User> = {};
      
      switch (editField) {
        case 'firstName':
        case 'lastName':
        case 'phone':
        case 'bio':
        case 'location':
        case 'website':
        case 'linkedinUrl':
        case 'githubUrl':
          updateData[editField] = editValue;
          break;
        default:
          break;
      }

      const updatedUser = await userService.updateProfile(updateData);
      setUser(updatedUser);
      updateUser(updatedUser);
      setEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!authUser) {
      toast.error('Please login to upload resume');
      return;
    }

    // Validate file type (check both MIME type and extension)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
    
    if (!isValidType) {
      toast.error(`Invalid file type: ${file.type || 'unknown'}. Please upload a PDF (.pdf) or Word document (.doc, .docx).`);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    try {
      setUploadingResume(true);
      setUploadProgress(0);
      console.log('Uploading resume:', file.name, file.type, file.size);
      const result = await fileService.uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });
      setUser(result.user);
      updateUser(result.user);
      toast.success('Resume uploaded successfully');
    } catch (err: any) {
      console.error('Resume upload error:', err);
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to upload resume';
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      } else {
        // Something else happened
        toast.error(err.message || 'Failed to upload resume');
      }
    } finally {
      setUploadingResume(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAddSkills = async () => {
    setSkillsDialogOpen(true);
    await fetchAvailableSkills();
  };

  const handleSkillToggle = async (skillId: number) => {
    if (!user) return;

    const isSkillAdded = user.skills?.some(s => s.id === skillId) || false;

    try {
      let updatedUser: User;
      if (isSkillAdded) {
        updatedUser = await skillService.removeSkillFromUser(skillId);
      } else {
        updatedUser = await skillService.addSkillToUser(skillId);
      }
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success(isSkillAdded ? 'Skill removed' : 'Skill added');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update skills');
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      const updatedUser = await skillService.removeSkillFromUser(skillId);
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success('Skill removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove skill');
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateProfileCompletion = (user: User) => {
    let completed = 0;
    let total = 0;

    // Personal Details (30%)
    total += 30;
    if (user.firstName && user.lastName) completed += 10;
    if (user.email) completed += 10;
    if (user.phone) completed += 5;
    if (user.location) completed += 5;

    // Professional Summary (20%)
    total += 20;
    if (user.bio && user.bio.length > 50) completed += 20;

    // Skills (20%)
    total += 20;
    if (user.skills && user.skills.length > 0) {
      completed += Math.min(20, user.skills.length * 5);
    }

    // Resume (15%)
    total += 15;
    if (user.resumeUrl) completed += 15;

    // Social Links (10%)
    total += 10;
    if (user.linkedinUrl) completed += 5;
    if (user.githubUrl || user.website) completed += 5;

    // Profile Picture (5%)
    total += 5;
    if (user.profilePicture) completed += 5;

    return Math.round((completed / total) * 100);
  };

  const getProfileCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const profileCompletion = user ? calculateProfileCompletion(user) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header - Naukri Style */}
      <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: 120,
            position: 'relative',
          }}
        />
        <Box sx={{ px: 4, pb: 3, mt: -8 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Avatar
              src={user.profilePicture}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '3rem',
                bgcolor: '#667eea',
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box sx={{ flex: 1, pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Typography>
                {user.isVerified && (
                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
                    sx={{ height: 24 }}
                  />
                )}
              </Box>
              {user.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.location}
                  </Typography>
                </Box>
              )}
              {user.bio && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {user.bio}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit('bio', user.bio || '')}
                  size="small"
                >
                  Edit Profile
                </Button>
                {user.resumeUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    href={user.resumeUrl}
                    target="_blank"
                    size="small"
                  >
                    View Resume
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Completion Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Profile Completion
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Complete your profile to increase your chances of getting hired
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">
              {profileCompletion}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={profileCompletion}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white',
            },
          }}
        />
        {profileCompletion < 100 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              Complete these sections to improve your profile:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(!user.bio || user.bio.length < 50) && (
                <Chip label="Add Professional Summary" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {(!user.skills || user.skills.length === 0) && (
                <Chip label="Add Skills" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {!user.resumeUrl && (
                <Chip label="Upload Resume" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {!user.location && (
                <Chip label="Add Location" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Main Content */}
        <Grid item xs={12} md={8}>
          {/* Personal Details */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.firstName && user.lastName && user.email && user.phone && user.location ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon color="action" fontSize="small" />
                )}
                <Typography variant="h6" fontWeight="bold">
                  Personal Details
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => handleEdit('personal', '')}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              {user.phone && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1">{user.phone}</Typography>
                </Grid>
              )}
              {user.location && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                  </Box>
                  <Typography variant="body1">{user.location}</Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                </Box>
                <Chip
                  label={user.role.replace('_', ' ')}
                  color={user.role === 'ADMIN' ? 'error' : user.role === 'EMPLOYER' ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Professional Summary */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.bio && user.bio.length >= 50 ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon color="action" fontSize="small" />
                )}
                <Typography variant="h6" fontWeight="bold">
                  Professional Summary
                </Typography>
                {!user.bio && (
                  <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 1 }} />
                )}
              </Box>
              <IconButton size="small" onClick={() => handleEdit('bio', user.bio || '')}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {user.bio ? (
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {user.bio}
              </Typography>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add a professional summary to help employers understand your background and career goals.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit('bio', '')}
                >
                  Add Summary
                </Button>
              </Box>
            )}
          </Paper>

          {/* Skills Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.skills && user.skills.length > 0 ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon color="action" fontSize="small" />
                )}
                <Typography variant="h6" fontWeight="bold">
                  Skills
                </Typography>
                {(!user.skills || user.skills.length === 0) && (
                  <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 1 }} />
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {user.skills && user.skills.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user.skills.map((skill: Skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleRemoveSkill(skill.id)}
                    sx={{ mb: 1 }}
                  />
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={handleAddSkills}
                  sx={{ mb: 1 }}
                >
                  Add More
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add your skills to help employers find you. Include technical skills, programming languages, and tools you're proficient in.
                </Typography>
                <Button variant="outlined" startIcon={<StarIcon />} onClick={handleAddSkills}>
                  Add Skills
                </Button>
              </Box>
            )}
          </Paper>

          {/* Resume Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.resumeUrl ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon color="action" fontSize="small" />
                )}
                <Typography variant="h6" fontWeight="bold">
                  Resume
                </Typography>
                {!user.resumeUrl && (
                  <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 1 }} />
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {user.resumeUrl ? (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionIcon />}
                  href={user.resumeUrl.startsWith('http') ? user.resumeUrl : `http://localhost:8080${user.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </Button>
                <Button
                  variant="text"
                  size="small"
                  sx={{ ml: 1 }}
                  onClick={async () => {
                    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                >
                  Replace Resume
                </Button>
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
                      try {
                        const updatedUser = await fileService.deleteResume();
                        setUser(updatedUser);
                        updateUser(updatedUser);
                        toast.success('Resume deleted successfully');
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Failed to delete resume');
                      }
                    }
                  }}
                >
                  Delete Resume
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload your resume to apply for jobs quickly. Employers can view your resume when you apply.
                </Typography>
                <Box>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="resume-upload"
                    type="file"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                  />
                  <label htmlFor="resume-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<DescriptionIcon />}
                      disabled={uploadingResume}
                    >
                      {uploadingResume ? `Uploading... ${uploadProgress}%` : 'Upload Resume'}
                    </Button>
                  </label>
                  {uploadingResume && (
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Contact Information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {user.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon color="action" />
                  <Button
                    href={user.website}
                    target="_blank"
                    size="small"
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    Website
                  </Button>
                </Box>
              )}
              {user.linkedinUrl && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkedInIcon color="primary" />
                  <Button
                    href={user.linkedinUrl}
                    target="_blank"
                    size="small"
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    LinkedIn
                  </Button>
                </Box>
              )}
              {user.githubUrl && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GitHubIcon />
                  <Button
                    href={user.githubUrl}
                    target="_blank"
                    size="small"
                    sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    GitHub
                  </Button>
                </Box>
              )}
              {!user.website && !user.linkedinUrl && !user.githubUrl && (
                <Typography variant="body2" color="text.secondary">
                  No social links added
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Account Information */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Member since
              </Typography>
              <Typography variant="body1">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editField.charAt(0).toUpperCase() + editField.slice(1)}
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            multiline={editField === 'bio'}
            rows={editField === 'bio' ? 4 : 1}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Skills Selection Dialog */}
      <Dialog open={skillsDialogOpen} onClose={() => setSkillsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Skills</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select skills to add to your profile. You can search and filter skills by category.
          </Typography>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {availableSkills.map((skill) => {
              const isSelected = user?.skills?.some(s => s.id === skill.id) || false;
              return (
                <ListItem key={skill.id} disablePadding>
                  <ListItemButton onClick={() => handleSkillToggle(skill.id)}>
                    <Checkbox checked={isSelected} />
                    <ListItemText
                      primary={skill.name}
                      secondary={skill.description || skill.category}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillsDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
