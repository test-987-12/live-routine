import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { Typography, Paper, Box, Avatar, Divider, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { getAuth, sendPasswordResetEmail, EmailAuthProvider, linkWithCredential } from 'firebase/auth';

// We'll need to reference the AuthPage component
const AuthPage = window.AuthPage;

const ProfilePage = () => {
  const proxyState = useProxy(window.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check if user is signed in with Google
  const isGoogleUser = () => {
    return proxyState.user &&
           proxyState.user.providerData &&
           proxyState.user.providerData.some(provider => provider.providerId === 'google.com');
  };

  // Check if user has password provider
  const hasPasswordProvider = () => {
    return proxyState.user &&
           proxyState.user.providerData &&
           proxyState.user.providerData.some(provider => provider.providerId === 'password');
  };

  // Function to handle setting a password for Google users
  const handleSetPassword = async () => {
    setPasswordError('');

    // Validate password
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(proxyState.user.email, password);

      // Link the Google account with email/password
      await linkWithCredential(auth.currentUser, credential);

      setSuccess('Password has been set successfully! You can now sign in with your email and password.');
      setOpenPasswordDialog(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error setting password:', err);
      setPasswordError(err.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle password reset
  const handleResetPassword = async () => {
    if (!proxyState.user || !proxyState.user.email) {
      setError('You need to be signed in with an email account to reset your password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, proxyState.user.email);
      setSuccess('Password reset email sent! Please check your inbox and spam folder.');
    } catch (err) {
      console.error('Error sending password reset email:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use effect to sign in anonymously if not logged in
  React.useEffect(() => {
    if (!proxyState.user) {
      console.log("ProfilePage: User not logged in, signing in anonymously");
      window.signInAnonymously();
    }
  }, [proxyState.user]);

  // Don't render anything if auth is still loading
  if (proxyState.authLoading) {
    return null;
  }

  // Show loading while signing in anonymously
  if (!proxyState.user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="w-full grow flex flex-col bg-white p-6 max-w-6xl mx-auto rounded-lg">
      {proxyState.isAnonymous && (
        <Box className="mb-4 p-2 bg-blue-50 rounded-md">
          <Typography variant="body2" color="primary">
            You are currently using the app anonymously. <a href="#/auth" className="text-blue-600 underline">Sign in</a> to save your preferences.
          </Typography>
        </Box>
      )}
      {/* Display error and success messages */}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      {success && <Alert severity="success" className="mb-4">{success}</Alert>}

      <Paper elevation={2} className="p-6">
        <Box className="flex flex-col items-center mb-6">
          <Avatar
            src={proxyState.user.photoURL} // Use photoURL if available
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mb: 2
            }}
          >
            {proxyState.user.email?.charAt(0).toUpperCase() ||
             proxyState.user.phoneNumber?.charAt(1) || 'U'}
          </Avatar>
          <Typography variant="h5" className="font-medium">
            User Profile
          </Typography>
        </Box>

        <Divider className="!my-4" />

        <Box className="space-y-4">
          {/* User ID */}
          <Box className="flex items-center">
            <Icons.Fingerprint className="mr-3 text-gray-500" />
            <div>
              <Typography variant="body2" color="textSecondary">
                User ID
              </Typography>
              <Typography variant="body1" className="break-all">
                {proxyState.user.uid || 'Unknown'}
              </Typography>
            </div>
          </Box>

          {proxyState.user.email && (
            <Box className="flex items-center">
              <Icons.Email className="mr-3 text-gray-500" />
              <div>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {proxyState.user.email}
                </Typography>
              </div>
            </Box>
          )}

          {proxyState.user.phoneNumber && (
            <Box className="flex items-center">
              <Icons.Phone className="mr-3 text-gray-500" />
              <div>
                <Typography variant="body2" color="textSecondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {proxyState.user.phoneNumber}
                </Typography>
              </div>
            </Box>
          )}

          <Box className="flex items-center">
            <Icons.CalendarToday className="mr-3 text-gray-500" />
            <div>
              <Typography variant="body2" color="textSecondary">
                Account Created
              </Typography>
              <Typography variant="body1">
                {proxyState.user.metadata?.creationTime
                  ? new Date(proxyState.user.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </Typography>
            </div>
          </Box>

          {/* Password Management Section - only show for non-anonymous users with email */}
          {!proxyState.isAnonymous && proxyState.user.email && (
            <Box className="pt-4">
              <Divider className="!mb-4" />

              {/* For Google users without password provider */}
              {isGoogleUser() && !hasPasswordProvider() && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <Icons.Lock />}
                  onClick={() => setOpenPasswordDialog(true)}
                  disabled={loading}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Set Password
                </Button>
              )}

              {/* For users with password provider or Google users who have set a password */}
              {(hasPasswordProvider() || (isGoogleUser() && hasPasswordProvider())) && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <Icons.LockReset />}
                  onClick={handleResetPassword}
                  disabled={loading}
                  fullWidth
                >
                  Reset Password
                </Button>
              )}

              <Typography variant="caption" color="textSecondary" className="mt-2 block text-center">
                {isGoogleUser() && !hasPasswordProvider()
                  ? "Set a password to sign in with email and password in addition to Google."
                  : "A password reset link will be sent to your email address."}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </div>
  );

  // Password Dialog for Google users to set a password
  const renderPasswordDialog = () => (
    <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
      <DialogTitle>Set Password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Setting a password will allow you to sign in with your email and password in addition to Google.
        </Typography>

        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          placeholder="At least 6 characters"
        />

        <TextField
          margin="dense"
          label="Confirm Password"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPasswordDialog(false)} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSetPassword}
          variant="contained"
          color="primary"
          disabled={loading || !password || !confirmPassword}
        >
          {loading ? <CircularProgress size={24} /> : 'Set Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {renderContent()}
      {renderPasswordDialog()}
    </>
  );
};

export default ProfilePage;
