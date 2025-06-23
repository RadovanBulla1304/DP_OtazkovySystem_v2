import logoExpanded from '@app/assets/UNIZA_TEXT_A.png';
import logoCollapsed from '@app/assets/UNIZA_TEXT_B.png';
import * as authService from '@app/pages/auth/authService';
import { useGetUserMeQuery } from '@app/redux/api';
import { replaceDiacritics } from '@app/utils/common.util';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
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
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import ProfileMenu from './profile-menu.component';
import TeamSwitcher from './TeamSwitcher';

const drawerWidth = 240;
const collapsedDrawerWidth = 65;

// Animation constants
const animationDuration = '300ms';
const customEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material Design recommended easing

// Styled components with optimized transitions
const SmoothDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    transition: `
      width ${animationDuration} ${customEasing},
      transform ${animationDuration} ${customEasing}
    `,
    willChange: 'width, transform',
    overflowX: 'hidden',
    boxShadow: theme.shadows[4],
    borderRight: 'none',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    contain: 'strict'
  }
}));

const SmoothBox = styled(Box)({
  transition: `margin ${animationDuration} ${customEasing}, width ${animationDuration} ${customEasing}`,
  willChange: 'margin, width',
  transform: 'translateZ(0)'
});

const LogoContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 64,
  minHeight: 64,
  overflow: 'hidden',
  position: 'relative',
  '& img': {
    position: 'absolute',
    transition: `
      opacity ${animationDuration} ${customEasing},
      transform ${animationDuration} ${customEasing}
    `,
    willChange: 'opacity, transform',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden'
  }
});

const SectionHeader = React.memo(({ title, collapsed }) => (
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
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: `all ${animationDuration} ${customEasing}`,
      willChange: 'opacity, transform',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    }}
  >
    {collapsed ? title.charAt(0) : title}
  </Typography>
));
SectionHeader.displayName = 'SectionHeader';

const NavItem = styled(ListItemButton)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: `
    background-color 150ms ease,
    padding-left ${animationDuration} ${customEasing},
    padding-right ${animationDuration} ${customEasing}
  `,
  willChange: 'padding, transform',
  backfaceVisibility: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '&.active': {
    backgroundColor: theme.palette.action.selected
  }
}));

const MainLayout = ({ children }) => {
  const matched = useMediaQuery('(min-width:900px)');
  const navigate = useNavigate();
  const { data: user } = useGetUserMeQuery();
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [profileMenuAnchorEl, setProfileAnchorEl] = React.useState(null);
  const profileMenuOpen = Boolean(profileMenuAnchorEl);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  DrawerContent.propTypes = {
    drawerCollapsed: PropTypes.bool.isRequired
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
    setDrawerCollapsed((prev) => !prev);
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
    drawerOption.push(
      { isHeader: true, title: 'Správca' },
      { title: 'Dashboard', navTo: '/', icon: <DashboardIcon /> }
      // { title: 'Používatelia', navTo: '/admin/users', icon: <GroupIcon /> },
      // { isHeader: true, title: 'Funkcie' },
      // { title: 'Predmety', navTo: '/subjects', icon: <SchoolIcon /> }
    );
  }

  drawerOption = drawerOption.concat([
    { isHeader: true, title: 'Obsah' },
    // { title: 'Moduly', navTo: '/moduls', icon: <ViewModuleIcon /> },
    { title: 'Projekty', navTo: '/moduls', icon: <AccountTreeIcon /> },
    { title: 'Fórum', navTo: '/moduls', icon: <ViewModuleIcon /> }
  ]);
  if (!user?.isAdmin) {
    drawerOption.push({
      title: 'Moje otázky',
      navTo: '/my-questions',
      icon: <QuestionAnswerIcon />
    });
  }
  drawerOption = drawerOption.concat([
    { title: 'Otázky', navTo: '/all-questions', icon: <QuestionMarkIcon /> },
    { title: 'Testy', navTo: '/tests', icon: <AvTimerIcon /> }
  ]);

  const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', width: '100vw', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: `margin ${animationDuration} ${customEasing}, width ${animationDuration} ${customEasing}`,
          willChange: 'margin, width'
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
          transition: `width ${animationDuration} ${customEasing}`,
          willChange: 'width'
        }}
        aria-label="nav menu"
      >
        <SmoothDrawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
            BackdropProps: {
              transitionDuration: animationDuration
            }
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth
            }
          }}
        >
          <DrawerContent drawerCollapsed={false} />
        </SmoothDrawer>
        <SmoothDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'flex' },
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth
            }
          }}
          open
        >
          <DrawerContent drawerCollapsed={drawerCollapsed} />
        </SmoothDrawer>
      </Box>
      <SmoothBox
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          willChange: 'margin, width'
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ px: 0 }}>
          {children}
        </Container>
      </SmoothBox>
    </Box>
  );

  function DrawerContent({ drawerCollapsed }) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <LogoContainer>
          <Link
            to="/"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '5px'
            }}
          >
            <img
              src={logoExpanded}
              alt="uniza logo expanded"
              style={{
                height: '50px',
                width: 'auto',
                opacity: drawerCollapsed ? 0 : 1,
                transform: drawerCollapsed ? 'translateX(-100%)' : 'translateX(0)'
              }}
              draggable={false}
            />
            <img
              src={logoCollapsed}
              alt="uniza logo collapsed"
              style={{
                height: '50px',
                width: 'auto',
                opacity: drawerCollapsed ? 1 : 0,
                transform: drawerCollapsed ? 'translateX(0)' : 'translateX(100%)'
              }}
              draggable={false}
            />
          </Link>
        </LogoContainer>
        <Stack justifyContent="space-between" direction="column" flexGrow={2}>
          <List component="nav" sx={{ overflow: 'hidden' }}>
            {drawerOption.map((item, index) => {
              if (item.isHeader) {
                return (
                  <React.Fragment key={`header-${index}`}>
                    {!drawerCollapsed && (
                      <SectionHeader title={item.title} collapsed={drawerCollapsed} />
                    )}
                  </React.Fragment>
                );
              }

              return (
                <ListItem key={item.title} disablePadding sx={{ overflow: 'hidden' }}>
                  <Tooltip title={drawerCollapsed ? item.title : ''} placement="right">
                    <NavItem
                      component={NavLink}
                      to={item.navTo}
                      sx={{
                        pl: drawerCollapsed ? '20px' : '16px',
                        pr: drawerCollapsed ? '20px' : '16px'
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
                            opacity: drawerCollapsed ? 0 : 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        />
                      )}
                    </NavItem>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>

          {/* {!user?.isAdmin && (
            <Box
              sx={{
                px: 2,
                mt: 'auto',
                mb: 2,
                transition: `all ${animationDuration} ${customEasing}`,
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              {!drawerCollapsed && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    transition: `opacity ${animationDuration} ${customEasing}`,
                    opacity: drawerCollapsed ? 0 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
                <TeamSwitcher collapsed={drawerCollapsed} />
              </Box>
            </Box>
          )} */}

          <Box
            sx={{
              px: 2,
              mt: 'auto',
              mb: 2,
              transition: `all ${animationDuration} ${customEasing}`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          >
            {!drawerCollapsed && (
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  transition: `opacity ${animationDuration} ${customEasing}`,
                  opacity: drawerCollapsed ? 0 : 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
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
              <TeamSwitcher collapsed={drawerCollapsed} />
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }
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
