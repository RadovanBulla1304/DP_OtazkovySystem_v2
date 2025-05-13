// AddSubjectModal.jsx
import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material"

const AddSubjectModal = ({ open, onClose, onCreate }) => {
  const [subjectName, setSubjectName] = useState("")

  const handleSubmit = () => {
    if (subjectName.trim()) {
      onCreate({ name: subjectName.trim() })
      setSubjectName("")
    }
  }

  const handleClose = () => {
    setSubjectName("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Zadaj názov predmetu</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Názov predmetu"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zrušiť</Button>
        <Button onClick={handleSubmit} variant="contained">Pridať</Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddSubjectModal
