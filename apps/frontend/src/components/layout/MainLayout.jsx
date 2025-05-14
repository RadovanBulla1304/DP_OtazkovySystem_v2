import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Button, Container, ListItemButton, Stack, Tooltip, useMediaQuery } from '@mui/material';
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

import logoExpanded from '@app/assets/UNIZA_TEXT_A.png';
import logoCollapsed from '@app/assets/UNIZA_TEXT_B.png';
import * as authService from '@app/pages/auth/authService';
import { useGetUserMeQuery } from '@app/redux/api';
import { replaceDiacritics } from '@app/utils/common.util';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SchoolIcon from '@mui/icons-material/School';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './profile-menu.component';
import TeamSwitcher from './TeamSwitcher';
const drawerWidth = 240;
const collapsedDrawerWidth = 65;

// Animation constants
const animationDuration = '400ms';
const customEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';

const SmoothDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    transition: `transform ${animationDuration} ${customEasing}, width ${animationDuration} ${customEasing}`,
    willChange: 'transform, width',
    overflowX: 'hidden',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
  }
});

const SmoothBox = styled(Box)({
  transition: `all ${animationDuration} ${customEasing}`,
  willChange: 'margin, width'
});

const SectionHeader = ({ title, collapsed }) => (
  <Typography
    variant="overline"
    component="div"
    sx={{
      px: collapsed ? 1 : 2,
      py: 1,
      color: 'text.secondary',
      fontWeight: 'bold',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08333em',
      textAlign: collapsed ? 'center' : 'left',
      transition: `all ${animationDuration} ${customEasing}`
    }}
  >
    {collapsed ? title.charAt(0) : title}
  </Typography>
);

const MainLayout = ({ children }) => {
  const matched = useMediaQuery('(min-width:900px)');
  const navigate = useNavigate();
  const { data: user } = useGetUserMeQuery();
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [profileMenuAnchorEl, setProfileAnchorEl] = React.useState(null);
  const profileMenuOpen = Boolean(profileMenuAnchorEl);

  if (!user) {
    navigate('/auth/login');
  }

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

  const toggleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
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

  let drawerOption = [];

  if (user?.isAdmin) {
    drawerOption.push({
      isHeader: true,
      title: 'Správca'
    });
    drawerOption.push({
      title: 'Dashboard',
      navTo: '/',
      icon: <DashboardIcon />
    });
    drawerOption.push({
      title: 'Používatelia',
      navTo: '/admin/users',
      icon: <GroupIcon />
    });
    drawerOption.push({
      isHeader: true,
      title: 'Funkcie'
    });
    drawerOption.push({
      title: 'Predmety',
      navTo: '/subjects',
      icon: <SchoolIcon />
    });
  }

  drawerOption = drawerOption.concat([
    {
      isHeader: true,
      title: 'Obsah'
    },
    {
      title: 'Moduly',
      navTo: '/moduls',
      icon: <ViewModuleIcon />
    },
    {
      title: 'Zoznam otázok',
      navTo: '/questions',
      icon: <QuestionMarkIcon />
    },
    {
      title: 'Moje otázky',
      navTo: '/my-questions',
      icon: <QuestionAnswerIcon />
    },
    {
      title: 'Testy',
      navTo: '/tests',
      icon: <AvTimerIcon />
    }
  ]);

  const TeamSwitcherWrapper = ({ collapsed }) => {
    return <TeamSwitcher collapsed={collapsed} />;
  };

  TeamSwitcherWrapper.propTypes = {
    collapsed: PropTypes.bool.isRequired
  };

  const drawer = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 0,
          height: '64px',
          minHeight: '64px !important',
          transition: `all ${animationDuration} ${customEasing}`
        }}
      >
        <Link to="/" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <img
            src={drawerCollapsed ? logoCollapsed : logoExpanded}
            alt="uniza logo"
            style={{
              height: drawerCollapsed ? '36px' : '50px',
              transition: `height ${animationDuration} ${customEasing}`,
              maxWidth: drawerCollapsed ? 'unset' : '100%',
              objectFit: 'contain',
              backfaceVisibility: 'hidden'
            }}
          />
        </Link>
      </Toolbar>
      <Stack justifyContent={'space-between'} direction={'column'} flexGrow={2}>
        <List
          component="nav"
          sx={{
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        >
          {drawerOption.map((item) => {
            if (item.isHeader) {
              return (
                <React.Fragment key={item.title}>
                  {!drawerCollapsed && (
                    <SectionHeader title={item.title} collapsed={drawerCollapsed} />
                  )}
                </React.Fragment>
              );
            }

            const NavItem = styled(ListItemButton)({
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              transition: `background-color 150ms ease, padding ${animationDuration} ${customEasing}`
            });

            return (
              <ListItem
                key={item.title}
                disablePadding
                sx={{
                  backfaceVisibility: 'hidden'
                }}
              >
                <Tooltip title={drawerCollapsed ? item.title : ''} placement="right">
                  <NavItem
                    onClick={handleDrawerClose}
                    component={NavLink}
                    to={item.navTo}
                    style={({ isActive }) => {
                      return {
                        backgroundColor: isActive ? '#ffeecc' : '',
                        paddingLeft: drawerCollapsed ? '20px' : '16px',
                        paddingRight: drawerCollapsed ? '20px' : '16px'
                      };
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerCollapsed ? 'unset' : '56px',
                        justifyContent: 'center',
                        transition: `min-width ${animationDuration} ${customEasing}`
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!drawerCollapsed && (
                      <ListItemText
                        primary={item.title}
                        sx={{
                          transition: `opacity ${animationDuration} ${customEasing}`,
                          opacity: drawerCollapsed ? 0 : 1
                        }}
                      />
                    )}
                  </NavItem>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        <Box
          sx={{
            px: 2,
            mt: 'auto',
            mb: 2,
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            transition: `all ${animationDuration} ${customEasing}`
          }}
        >
          {!drawerCollapsed && (
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                transition: `opacity ${animationDuration} ${customEasing}`,
                opacity: drawerCollapsed ? 0 : 1
              }}
            >
              Zvoľ predmet:
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: drawerCollapsed ? 'center' : 'flex-start',
              width: '100%'
            }}
          >
            <TeamSwitcherWrapper collapsed={drawerCollapsed} />
          </Box>
        </Box>
      </Stack>
    </div>
  );

  const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', width: '100vw' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: 0 },
          transition: `margin ${animationDuration} ${customEasing}, width ${animationDuration} ${customEasing}`
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

          <IconButton
            color="inherit"
            onClick={toggleDrawerCollapse}
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>

          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Otázkový systém
          </Typography>
          <Button color="inherit" onClick={openProfileMenu} startIcon={<AccountCircleIcon />}>
            {matched && replaceDiacritics(user?.name.concat(' ', user.surname) || '')}
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
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
          transition: `width ${animationDuration} ${customEasing}`
        }}
        aria-label="nav menu"
      >
        <SmoothDrawer
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
        </SmoothDrawer>
        <SmoothDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'flex' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              overflowX: 'hidden'
            }
          }}
          open
        >
          {drawer}
        </SmoothDrawer>
      </Box>
      <SmoothBox
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          ml: { md: 0 }
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ px: 0 }}>
          {children}
        </Container>
      </SmoothBox>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired
};
SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired
};

MainLayout.defaultProps = {
  children: null
};
SectionHeader.defaultProps = {
  title: '',
  collapsed: false
};

export default MainLayout;
