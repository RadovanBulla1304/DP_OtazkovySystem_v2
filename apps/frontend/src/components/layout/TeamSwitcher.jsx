import * as React from "react"
import { Box, Button, Typography, Popover, List, ListItem, ListItemText, Divider, Avatar } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { styled } from "@mui/material/styles"

// Sample data - replace with your actual data later
const sampleSubjects = [
  { id: 1, name: "Dizajn Hier" },
  { id: 2, name: "Priestorová akustika" },
  { id: 3, name: "Algoritmy a údajové Štruktúry" },
  
]

const TeamSwitcherButton = styled(Button)(({ theme }) => ({
  width: "100%",
  justifyContent: "space-between",
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  border: `1px solid ${theme.palette.divider}`,
  marginTop: "auto",
  marginBottom: theme.spacing(2),
}))

const SubjectAvatar = styled(Avatar)(({ theme }) => ({
  width: 24,
  height: 24,
  fontSize: "0.75rem",
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(1),
}))

const TeamSwitcher = () => {
  const [currentSubject, setCurrentSubject] = React.useState(sampleSubjects[0])
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSubjectSelect = (subject) => {
    setCurrentSubject(subject)
    handleClose()
  }

  const handleAddSubject = () => {
    // Placeholder for adding a new subject
    console.log("Add new subject")
    handleClose()
  }

  return (
    <>
      <TeamSwitcherButton
        onClick={handleClick}
        aria-controls={open ? "subject-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SubjectAvatar>{currentSubject.name.charAt(0)}</SubjectAvatar>
          <Typography variant="body2">
            {currentSubject.name}
          </Typography>
        </Box>
      </TeamSwitcherButton>

      <Popover
        id="subject-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ width: 230, maxHeight: 350, overflow: "auto" }}>
          <List dense>
            {sampleSubjects.map((subject) => (
              <ListItem
                key={subject.id}
                button
                onClick={() => handleSubjectSelect(subject)}
                selected={currentSubject.id === subject.id}
              >
                <SubjectAvatar>{subject.name.charAt(0)}</SubjectAvatar>
                <ListItemText primary={subject.name} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={handleAddSubject}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              <ListItemText primary="Pridať predmet" />
            </ListItem>
          </List>
        </Box>
      </Popover>
    </>
  )
}

export default TeamSwitcher
