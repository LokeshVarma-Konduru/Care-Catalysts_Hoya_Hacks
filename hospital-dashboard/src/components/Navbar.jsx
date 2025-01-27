import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Box,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Feedback as FeedbackIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Submit Feedback', icon: <FeedbackIcon />, path: '/form' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <List sx={{ mt: 1 }}>
      {menuItems.map((item) => (
        <ListItem
          button
          component={Link}
          to={item.path}
          key={item.text}
          selected={isActive(item.path)}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text}
            sx={{
              color: isActive(item.path) ? 'primary.main' : 'inherit',
              '& .MuiListItemText-primary': {
                fontWeight: isActive(item.path) ? 600 : 400,
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          maxWidth: '1800px !important',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: '64px', sm: '70px' },
            py: 1
          }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HospitalIcon sx={{ display: 'flex', mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Care Catalysts
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              ml: 'auto' 
            }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  color={isActive(item.path) ? 'primary' : 'inherit'}
                  sx={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
