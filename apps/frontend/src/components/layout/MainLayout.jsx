import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';

import { Button, Container, ListItemButton, Stack, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';

import { styled } from '@mui/material/styles';
//import { replaceDiacritics } from '../../utils/common.util';
import logo from '@app/assets/UNIZA_TEXT_B.png';
import * as authService from '@app/pages/auth/authService';
import { replaceDiacritics } from '@app/utils/common.util';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './profile-menu.component';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const matched = useMediaQuery('(min-width:900px)');
  const navigate = useNavigate();
  const user = authService.getUserFromStorage();

  if (!user) {
    navigate('/auth/login');
  }

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [profileMenuAnchorEl, setProfileAnchorEl] = React.useState(null);
  const profileMenuOpen = Boolean(profileMenuAnchorEl);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const openProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    authService.removeUserFromStorage();
    authService.removeTokenFromStorage();
    closeProfileMenu();
    navigate('/auth/login');
  };

  const drawerOption = [
    {
      title: 'Dashboard',
      navTo: '/',
      icon: <DashboardIcon />
    }
  ];
  if (user?.isAdmin) {
    drawerOption.push({
      title: 'Používatelia',
      navTo: '/admin/users',
      icon: <GroupIcon />
    });
  }

  const drawer = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Link to={'/'}>
          <img src={logo} alt="uniza logo" height={50} style={{ objectFit: 'contain' }} />
        </Link>
      </Toolbar>
      <Stack justifyContent={'space-between'} direction={'column'} flexGrow={2}>
        <List component="nav">
          {drawerOption.map((item) => {
            const NavItem = styled(ListItemButton)({});
            return (
              <ListItem key={item.title} disablePadding>
                <NavItem
                  onClick={handleDrawerClose}
                  component={NavLink}
                  to={item.navTo}
                  style={({ isActive }) => {
                    return {
                      backgroundColor: isActive ? '#ffeecc' : ''
                    };
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} />
                </NavItem>
              </ListItem>
            );
          })}
        </List>
      </Stack>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', width: '100vw' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Správa predmetov
          </Typography>
          <Button color="inherit" onClick={openProfileMenu} startIcon={<AccountCircleIcon />}>
            {matched && replaceDiacritics(user?.fullName || '')}
          </Button>
          <ProfileMenu
            open={profileMenuOpen}
            anchorEl={profileMenuAnchorEl}
            onLogout={handleLogout}
            onClose={closeProfileMenu}
          />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="nav menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'flex' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ px: 0 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainLayout;
