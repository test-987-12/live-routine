import React from 'react';
import { useProxy } from 'valtio/utils';
import { Typography, Paper, Box, Avatar, Divider, Button } from '@mui/material';
import * as Icons from '@mui/icons-material';

// We'll need to reference the AuthPage component
const AuthPage = window.AuthPage;

const ProfilePage = () => {
  const proxyState = useProxy(window.state);

  // If user is not logged in, show a message
  if (!proxyState.user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Paper elevation={3} className="p-6 max-w-md">
          <Typography variant="h5" className="text-center mb-4">
            Please Sign In
          </Typography>
          <Typography variant="body1" className="text-center mb-4">
            You need to be signed in to view your profile.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => window.location.hash = '#/auth'}
            startIcon={<Icons.Login />}
          >
            Sign In
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="w-full grow flex flex-col bg-white p-6 max-w-6xl mx-auto rounded-lg">
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

        <Divider className="my-4" />

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
