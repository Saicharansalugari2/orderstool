import React, { useState } from 'react';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';

const userDetails = {
  name: 'Saicharan Salugari',
  role: 'Front End Developer',
  email: 'saicharansalugari9@gmail.com',
  avatar: '/avatar.png' 
};

export default function UserProfile() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <AccountCircleIcon sx={{ fontSize: 32 }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            backgroundColor: '#FFFFFF !important',
            color: '#000000 !important'
          }
        }}
        PaperProps={{
          sx: {
            width: 300,
            mt: 1,
            backgroundColor: '#FFFFFF !important',
            color: '#000000',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF !important',
            color: '#000000 !important',
            p: 2,
          }}
        >
          <Stack spacing={2} sx={{ backgroundColor: '#FFFFFF !important' }}>
            <Box display="flex" alignItems="center" gap={2} sx={{ backgroundColor: '#FFFFFF !important' }}>
              <Avatar
                src={userDetails.avatar}
                alt={userDetails.name}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#F5F5F5',
                  color: '#000000',
                  fontSize: '1.5rem',
                  border: '2px solid rgba(0, 0, 0, 0.12)',
                }}
              >
                {userDetails.name.charAt(0)}
              </Avatar>
              <Box sx={{ backgroundColor: '#FFFFFF !important' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#000000 !important',
                    fontSize: '1.1rem',
                    backgroundColor: '#FFFFFF !important'
                  }}
                >
                  {userDetails.name}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.12)' }} />
            <Stack spacing={1.5} sx={{ backgroundColor: '#FFFFFF !important' }}>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ backgroundColor: '#FFFFFF !important' }}>
                <WorkIcon sx={{ color: '#000000 !important' }} />
                <Typography sx={{ 
                  color: '#000000 !important',
                  fontSize: '0.95rem',
                  backgroundColor: '#FFFFFF !important'
                }}>
                  {userDetails.role}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ backgroundColor: '#FFFFFF !important' }}>
                <EmailIcon sx={{ color: '#000000 !important' }} />
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#000000 !important',
                    wordBreak: 'break-all',
                    backgroundColor: '#FFFFFF !important'
                  }}
                >
                  {userDetails.email}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Popover>
    </>
  );
} 