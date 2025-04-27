import React from 'react';
import { useProxy } from 'valtio/utils';
import { Typography, Paper, Box, Avatar, Divider } from '@mui/material';
import * as Icons from '@mui/icons-material';

// We'll need to reference the AuthPage component
const AuthPage = window.AuthPage;

const ProfilePage = () => {
  const proxyState = useProxy(window.state);

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

  return (
    <div className="w-full grow flex flex-col bg-white p-6 max-w-6xl mx-auto rounded-lg">
      {proxyState.isAnonymous && (
        <Box className="mb-4 p-2 bg-blue-50 rounded-md">
          <Typography variant="body2" color="primary">
            You are currently using the app anonymously. <a href="#/auth" className="text-blue-600 underline">Sign in</a> to save your preferences.
          </Typography>
        </Box>
      )}
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
        </Box>
      </Paper>
    </div>
  );
};

export default ProfilePage;
