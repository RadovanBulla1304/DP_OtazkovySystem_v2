import React from "react"
import { Box, Button, Typography, Popover, List, ListItem, ListItemText, Divider, Avatar } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import { styled } from "@mui/material/styles"
import AddSubjectModal from "../../pages/admin/components/AddSubjectModal"
import { useCreateSubjectMutation, useGetAllSubjectsQuery } from "@app/redux/api" // adjust path

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

// For collapsed mode
const CollapsedAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: "0.875rem",
  backgroundColor: theme.palette.primary.main,
  cursor: "pointer",
}))

const TeamSwitcher = ({ collapsed = false }) => {
  const { data: subjects = [], isLoading, refetch } = useGetAllSubjectsQuery()
  const [currentSubject, setCurrentSubject] = React.useState(null)

  React.useEffect(() => {
    if (subjects.length > 0 && !currentSubject) {
      setCurrentSubject(subjects[0])
    }
  }, [subjects, currentSubject])

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const [modalOpen, setModalOpen] = React.useState(false)
  const [createSubject] = useCreateSubjectMutation()

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
    handleClose()
    setModalOpen(true)
  }

  const handleCreateSubject = async (newSubject) => {
    try {
      const response = await createSubject(newSubject).unwrap()
      const createdSubject = response?.subject || newSubject
      setCurrentSubject(createdSubject)
      await refetch()
    } catch (err) {
      console.error("Failed to create subject:", err)
    } finally {
      setModalOpen(false)
    }
  }

  // Render different UI based on collapsed state
  if (collapsed) {
    return (
      <>
        <CollapsedAvatar onClick={handleClick}>{currentSubject?.name?.charAt(0) || "?"}</CollapsedAvatar>

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
            vertical: "center",
            horizontal: "left",
          }}
        >
          <Box sx={{ width: 230, maxHeight: 350, overflow: "auto" }}>
            <List dense>
              {isLoading ? (
                <ListItem>
                  <ListItemText primary="Načítavam..." />
                </ListItem>
              ) : (
                subjects.map((subject) => (
                  <ListItem
                    key={subject.id}
                    button
                    onClick={() => handleSubjectSelect(subject)}
                    selected={currentSubject?.id === subject.id}
                    sx={{ "&:hover": { cursor: "pointer" } }}
                  >
                    <SubjectAvatar>{subject.name.charAt(0)}</SubjectAvatar>
                    <ListItemText primary={subject.name} />
                  </ListItem>
                ))
              )}

              <Divider sx={{ my: 1 }} />
              <ListItem button onClick={handleAddSubject} sx={{ "&:hover": { cursor: "pointer" } }}>
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary="Pridať predmet" />
              </ListItem>
            </List>
          </Box>
        </Popover>

        <AddSubjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateSubject} />
      </>
    )
  }

  // Regular expanded view
  return (
    <>
      <TeamSwitcherButton
        onClick={handleClick}
        aria-controls={open ? "subject-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <SubjectAvatar>{currentSubject?.name?.charAt(0) || "?"}</SubjectAvatar>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {currentSubject?.name || "Žiadny predmet"}
          </Typography>
          <ExpandMoreIcon fontSize="small" />
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
            {isLoading ? (
              <ListItem>
                <ListItemText primary="Načítavam..." />
              </ListItem>
            ) : (
              subjects.map((subject) => (
                <ListItem
                  key={subject.id}
                  button
                  onClick={() => handleSubjectSelect(subject)}
                  selected={currentSubject?.id === subject.id}
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <SubjectAvatar>{subject.name.charAt(0)}</SubjectAvatar>
                  <ListItemText primary={subject.name} />
                </ListItem>
              ))
            )}

            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={handleAddSubject} sx={{ "&:hover": { cursor: "pointer" } }}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              <ListItemText primary="Pridať predmet" />
            </ListItem>
          </List>
        </Box>
      </Popover>

      <AddSubjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateSubject} />
    </>
  )
}

export default TeamSwitcher