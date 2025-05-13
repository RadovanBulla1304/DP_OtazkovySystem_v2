// AddSubjectModal.jsx
import React, { useState } from "react";
import { useCreateSubjectMutation } from "@app/redux/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";

const AddSubjectModal = ({ open, onClose, onSuccess }) => {
  const [subjectName, setSubjectName] = useState("");
  const [createSubject, { isLoading, error }] = useCreateSubjectMutation();

  const handleSubmit = async () => {
    if (!subjectName.trim()) return;
    
    try {
      const result = await createSubject({ name: subjectName.trim() }).unwrap();
      setSubjectName("");
      onSuccess?.(result);
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  const handleClose = () => {
    setSubjectName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Zadaj názov predmetu</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Chyba pri vytváraní predmetu
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Názov predmetu"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Zrušiť
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isLoading || !subjectName.trim()}
        >
          {isLoading ? <CircularProgress size={24} /> : "Pridať"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubjectModal;