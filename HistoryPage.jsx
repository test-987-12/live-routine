import React, { useState, useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import {
  Typography,
  Paper,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import * as Icons from '@mui/icons-material';

const HistoryPage = () => {
  const globalState = useProxy(window.state);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!globalState.user) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://nub-live-default-rtdb.asia-southeast1.firebasedatabase.app/preferences/${globalState.user.uid}.json`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch user history');
        }
        
        const userData = await response.json();
        
        if (userData && userData.history) {
          setHistory(userData.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching user history:', err);
        setError('Failed to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [globalState.user]);

  // Use effect to sign in anonymously if not logged in
  React.useEffect(() => {
    if (!globalState.user) {
      console.log("HistoryPage: User not logged in, signing in anonymously");
      window.signInAnonymously();
    }
  }, [globalState.user]);

  // Don't render anything if auth is still loading
  if (globalState.authLoading) {
    return null;
  }

  // Show loading while signing in anonymously
  if (!globalState.user) {
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

  const formatHistoryItem = (item) => {
    if (!Array.isArray(item) || item.length === 0) {
      return 'Unknown';
    }
    
    return item.join(', ');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="w-full grow flex flex-col bg-white p-6 max-w-6xl mx-auto rounded-lg">
      {globalState.isAnonymous && (
        <Box className="mb-4 p-2 bg-blue-50 rounded-md">
          <Typography variant="body2" color="primary">
            You are currently using the app anonymously. <a href="#/auth" className="text-blue-600 underline">Sign in</a> to save your history.
          </Typography>
        </Box>
      )}

      <Typography variant="h5" component="h1" className="mb-4 font-medium">
        Your History
      </Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="w-full flex items-center justify-center py-8">
          <CircularProgress />
        </div>
      ) : history.length === 0 ? (
        <Paper elevation={1} className="p-6 text-center">
          <Icons.History sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary" className="mt-2">
            No History Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your search and view history will appear here.
          </Typography>
        </Paper>
      ) : (
        <div className="space-y-4">
          {history.sort((a, b) => b.time - a.time).map((item, index) => (
            <Card key={index} elevation={1} className="overflow-hidden">
              <CardContent>
                <Box className="flex justify-between items-start">
                  <Typography variant="h6" component="h2" className="font-medium">
                    Change #{index + 1}
                  </Typography>
                  <Tooltip title="Last accessed">
                    <Typography variant="caption" color="textSecondary">
                      {item.time ? 
                        formatTimestamp(item.time) : 
                        'Unknown time'}
                    </Typography>
                  </Tooltip>
                </Box>
                <Divider className="my-2" />
                <Box className="mt-2">
                  <Typography variant="body2" className="mb-1 font-medium">
                    Affected Classes:
                  </Typography>
                  <Box className="flex flex-wrap gap-1">
                    {Array.isArray(item.data) && item.data.map((subItem, subIndex) => (
                      <Chip 
                        key={subIndex} 
                        label={subItem.affected?.join(', ')} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
