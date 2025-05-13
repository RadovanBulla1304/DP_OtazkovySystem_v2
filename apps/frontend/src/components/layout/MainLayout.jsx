import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ViewModuleIcon from "@mui/icons-material/ViewModule"
import GroupIcon from "@mui/icons-material/Group"
import MenuIcon from "@mui/icons-material/Menu"
import AvTimerIcon from "@mui/icons-material/AvTimer"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Button, Container, ListItemButton, Stack, useMediaQuery, Tooltip } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { Link, NavLink } from "react-router-dom"

import { styled } from "@mui/material/styles"
//import { replaceDiacritics } from '../../utils/common.util';
import logoCollapsed from "@app/assets/UNIZA_TEXT_B.png"
import logoExpanded from "@app/assets/UNIZA_TEXT_A.png"
import * as authService from "@app/pages/auth/authService"
import { replaceDiacritics } from "@app/utils/common.util"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import ProfileMenu from "./profile-menu.component"
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"
import SchoolIcon from "@mui/icons-material/School"
import TeamSwitcher from "./TeamSwitcher"

const drawerWidth = 240
const collapsedDrawerWidth = 65 // Width when drawer is collapsed

const MainLayout = ({ children }) => {
  const matched = useMediaQuery("(min-width:900px)")
  const navigate = useNavigate()
  const user = authService.getUserFromStorage()
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(false) // New state for drawer collapse

  if (!user) {
    navigate("/auth/login")
  }

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [profileMenuAnchorEl, setProfileAnchorEl] = React.useState(null)
  const profileMenuOpen = Boolean(profileMenuAnchorEl)

  const handleDrawerClose = () => {
    setIsClosing(true)
    setMobileOpen(false)
  }

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false)
  }

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  // New function to toggle drawer collapse state
  const toggleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed)
  }

  const openProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget)
  }

  const closeProfileMenu = () => {
    setProfileAnchorEl(null)
  }

  const handleLogout = async () => {
    authService.removeUserFromStorage()
    authService.removeTokenFromStorage()
    closeProfileMenu()
    navigate("/auth/login")
  }

  let drawerOption = []

  if (user?.isAdmin) {
    drawerOption.push({
      title: "Dashboard",
      navTo: "/",
      icon: <DashboardIcon />,
    })
    drawerOption.push({
      title: "Používatelia",
      navTo: "/admin/users",
      icon: <GroupIcon />,
    })
    drawerOption.push({
      title: "Predmety",
      navTo: "/subjects",
      icon: <SchoolIcon />,
    })
  }

  drawerOption = drawerOption.concat([
    {
      title: "Moduly",
      navTo: "/moduls",
      icon: <ViewModuleIcon />,
    },
    {
      title: "Moje otázky",
      navTo: "/my-questions",
      icon: <QuestionAnswerIcon />,
    },
    {
      title: "Testy",
      navTo: "/tests",
      icon: <AvTimerIcon />,
    },
  ])

  // Wrapper component to pass the collapsed state to TeamSwitcher
  const TeamSwitcherWrapper = ({ collapsed }) => {
    return <TeamSwitcher collapsed={collapsed} />
  }

  const drawer = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 0, // Remove horizontal padding
          height: "64px", // Standard height, or adjust as needed
        }}
      >
        <Link to="/" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <img
            src={drawerCollapsed ? logoCollapsed : logoExpanded}
            alt="uniza logo"
            style={{
              height: drawerCollapsed ? "36px" : "50px",
              transition: "all 0.3s ease",
              maxWidth: drawerCollapsed ? "unset" : "100%",
              objectFit: "contain",
            }}
          />
        </Link>
      </Toolbar>
      <Stack justifyContent={"space-between"} direction={"column"} flexGrow={2}>
        <List component="nav">
          {drawerOption.map((item) => {
            const NavItem = styled(ListItemButton)({})
            return (
              <ListItem key={item.title} disablePadding>
                <Tooltip title={drawerCollapsed ? item.title : ""} placement="right">
                  <NavItem
                    onClick={handleDrawerClose}
                    component={NavLink}
                    to={item.navTo}
                    style={({ isActive }) => {
                      return {
                        backgroundColor: isActive ? "#ffeecc" : "",
                        paddingLeft: drawerCollapsed ? "20px" : "16px", // Center icons when collapsed
                        paddingRight: drawerCollapsed ? "20px" : "16px",
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    {!drawerCollapsed && <ListItemText primary={item.title} />}
                  </NavItem>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>

        {/* TeamSwitcher at the bottom - modified to show avatar in collapsed mode */}
        <Box sx={{ px: 2, mt: "auto", mb: 2 }}>
          {!drawerCollapsed && (
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Zvoľ predmet:
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: drawerCollapsed ? "center" : "flex-start",
              width: "100%",
            }}
          >
            <TeamSwitcherWrapper collapsed={drawerCollapsed} />
          </Box>
        </Box>
      </Stack>
    </div>
  )

  // Calculate current drawer width based on collapsed state
  const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth

  return (
    <Box sx={{ display: "flex", width: "100vw" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Drawer collapse toggle button moved to AppBar */}
          <IconButton
            color="inherit"
            onClick={toggleDrawerCollapse}
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>

          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Otázkový systém
          </Typography>
          <Button color="inherit" onClick={openProfileMenu} startIcon={<AccountCircleIcon />}>
            {matched && replaceDiacritics(user?.fullName || "")}
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
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        aria-label="nav menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "flex" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentDrawerWidth,
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: "hidden",
            },
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
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          height: "100vh",
          overflow: "auto",
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ px: 0 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default MainLayout
