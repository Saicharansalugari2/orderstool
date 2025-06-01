"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Modal,
  Typography,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  styled,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft.js";
import HomeIcon from "@mui/icons-material/Home.js";
import ListIcon from "@mui/icons-material/List.js";
import CreateIcon from "@mui/icons-material/Create.js";
import AccountCircleIcon from "@mui/icons-material/AccountCircle.js";
import BarChartIcon from "@mui/icons-material/BarChart.js";

import UserProfile from './UserProfile';

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 100;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  { 
    label: "Home", 
    icon: <HomeIcon fontSize="large" sx={{ color: "#4CC9F0" }} />, 
    href: "/" 
  },
  {
    label: "ORDERS",
    icon: <ListIcon fontSize="large" sx={{ color: "#4ADE80" }} />,
    children: [
      { 
        label: "Create", 
        icon: <CreateIcon fontSize="large" sx={{ color: "#FF6B6B" }} />, 
        href: "/orders/create" 
      },
      { 
        label: "List", 
        icon: <ListIcon fontSize="large" sx={{ color: "#FFB86C" }} />, 
        href: "/orders/list" 
      },
    ],
  },
  {
    label: "REPORTS",
    icon: <BarChartIcon fontSize="large" sx={{ color: "#F472B6" }} />,
    href: "/reports"
  }
];

const USER_INFO = {
  name: "Sai Charan Salugari",
  role: "Admin",
  email: "saicharan.salugari@daxwell.com",
  avatarAlt: "User Avatar",
};

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    background: "#000000",
    backdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.03)",
    transition: theme.transitions.create(["width", "transform"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100%",
      background: "linear-gradient(180deg, rgba(76, 201, 240, 0.02) 0%, rgba(74, 222, 128, 0.02) 33%, rgba(255, 107, 107, 0.02) 67%, rgba(255, 184, 108, 0.02) 100%)",
      pointerEvents: "none",
    },
    "&:hover": {
      "& .collapse-button": {
        opacity: 1,
      },
    },
  },
}));

const CollapseButton = styled(IconButton)(() => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: "#ffffff",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  color: "#000000",
  transition: "all 0.3s ease",
  marginLeft: 12,
  "&:hover": {
    backgroundColor: "#ffffff",
    transform: "scale(1.1)",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
  },
}));

const StyledListItemButton = styled(ListItemButton)<{ component?: React.ElementType }>(() => ({
  borderRadius: "12px",
  padding: "12px",
  margin: "4px 8px",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "visible",
  backgroundColor: "rgba(255, 255, 255, 0.01)",
  border: "1px solid transparent",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    backgroundColor: "#ffffff",
    transform: "translateY(-2px)",
    "&::before": {
      opacity: 0,
    },
    "& .MuiListItemIcon-root": {
      color: "#000000",
      "& svg": {
        color: "#000000",
      },
    },
    "& .MuiListItemText-primary": {
      color: "#000000",
      fontWeight: 600,
    },
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "10%",
      height: "80%",
      width: "3px",
      background: "#ffffff",
      boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
      borderRadius: "2px",
    },
    "&:hover": {
      backgroundColor: "#ffffff",
      "& .MuiListItemIcon-root": {
        color: "#000000",
        "& svg": {
          color: "#000000",
        },
      },
      "& .MuiListItemText-primary": {
        color: "#000000",
        fontWeight: 600,
      },
    },
  },
}));

const UserAvatar = styled(Avatar)(() => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: "2px solid transparent",
  background: "#000000",
  "&:hover": {
    transform: "scale(1.05)",
    border: "2px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 0 15px rgba(76, 201, 240, 0.2)",
  },
}));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  }, [collapsed]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const openUserModal = () => setUserModalOpen(true);
  const closeUserModal = () => setUserModalOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUserModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActiveLink = (href?: string) => !!href && pathname === href;

  const renderMenuItems = (
    items: MenuItem[],
    parentCollapsed: boolean,
    level = 0
  ) =>
    items.map((item) => {
      if (item.children?.length) {
        return (
          <Box key={item.label} mb={2}>
            <ListItem
              sx={{
                px: parentCollapsed ? 0 : 1,
                pl: parentCollapsed ? 0 : 1 + level * 2,
                justifyContent: parentCollapsed ? "center" : "flex-start",
              }}
            >
              <StyledListItemButton disableRipple>
                <ListItemIcon
                  sx={{
                    color: "#c0c0c0",
                    minWidth: 40,
                    justifyContent: "center",
                    mr: parentCollapsed ? 0 : 1,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!parentCollapsed && (
                  <ListItemText
                    primary={item.label}
                    sx={{ ml: 0 }}
                    primaryTypographyProps={{ 
                      fontWeight: "bold",
                      sx: { color: "#c0c0c0" }
                    }}
                  />
                )}
              </StyledListItemButton>
            </ListItem>
            <List disablePadding>
              {renderMenuItems(item.children, parentCollapsed, level + 2)}
            </List>
          </Box>
        );
      }

      return (
        <ListItem
          key={item.label}
          sx={{
            px: parentCollapsed ? 0 : 1,
            pl: parentCollapsed ? 0 : 1 + level * 2,
            mb: 1.5,
          }}
        >
          <Link href={item.href ?? "#"} style={{ width: "100%", textDecoration: "none" }}>
            <StyledListItemButton selected={isActiveLink(item.href)}>
            <Tooltip title={item.label} placement="right" arrow>
              <ListItemIcon
                sx={{
                  color: isActiveLink(item.href)
                    ? theme.palette.primary.main
                    : "#c0c0c0",
                  minWidth: 40,
                  justifyContent: "center",
                  mr: parentCollapsed ? 0 : 1,
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {!parentCollapsed && (
              <ListItemText
                primary={item.label}
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    sx: { color: "#c0c0c0" }
                  }}
              />
            )}
            </StyledListItemButton>
          </Link>
        </ListItem>
      );
    });

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#000000",
        color: "#94A3B8",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <StyledDrawer
        variant="permanent"
        sx={{
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
          "& .MuiDrawer-paper": {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            p: 2,
            mb: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
            position: "relative",
          }}
        >
          {!collapsed && (
            <>
              <Typography
                variant="h5"
                sx={{
                  color: "#ffffff",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Orders Tool
              </Typography>
              <CollapseButton
                onClick={toggleSidebar}
                className="collapse-button"
                size="small"
                sx={{ position: "static", ml: 2, opacity: 1 }}
              >
                <ChevronLeftIcon 
                  sx={{
                    fontSize: "1.5rem",
                    transform: collapsed ? "rotate(180deg)" : "none",
                    transition: "transform 0.3s ease",
                    color: "#000000",
                  }}
                />
              </CollapseButton>
            </>
          )}
          {collapsed && (
            <CollapseButton
              onClick={toggleSidebar}
              className="collapse-button"
              size="small"
              sx={{ opacity: 1 }}
            >
              <ChevronLeftIcon 
                sx={{
                  fontSize: "1.5rem",
                  transform: "rotate(180deg)",
                  transition: "transform 0.3s ease",
                  color: "#000000",
          }}
              />
            </CollapseButton>
          )}
        </Box>

        <List sx={{ px: collapsed ? 1 : 2 }}>
          {renderMenuItems(MENU_ITEMS, collapsed)}
        </List>

          <Box
            sx={{
            mt: "auto",
            p: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
            gap: 2,
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.02))",
            }}
          >
          <UserAvatar onClick={openUserModal}>
            <AccountCircleIcon sx={{ color: "#94A3B8" }} />
          </UserAvatar>
          {!collapsed && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#E2E8F0", fontWeight: "bold" }}>
                {USER_INFO.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                {USER_INFO.role}
              </Typography>
            </Box>
          )}
        </Box>
      </StyledDrawer>

      <Modal
        open={userModalOpen}
        onClose={closeUserModal}
        aria-labelledby="user-modal-title"
      >
        <Box
              sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#000000",
            border: "1px solid rgba(255, 255, 255, 0.03)",
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            p: 4,
            color: "#E2E8F0",
              }}
            >
          <Typography variant="h6" component="h2" gutterBottom>
            User Profile
          </Typography>
          <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.03)" }} />
          <Typography variant="body1" gutterBottom sx={{ color: "#94A3B8" }}>
            Name: {USER_INFO.name}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: "#94A3B8" }}>
            Role: {USER_INFO.role}
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8" }}>
            Email: {USER_INFO.email}
            </Typography>
        </Box>
      </Modal>

      <UserProfile />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED}px)`,
          transition: (theme) =>
            theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
