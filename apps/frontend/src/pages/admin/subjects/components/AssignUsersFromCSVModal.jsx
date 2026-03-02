import {
  useAsignUserToSubjectMutation,
  useCreatePendingAssignmentsMutation,
  useGetUsersListQuery
} from '@app/redux/api';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';

const AssignUsersFromCSVModal = ({ open, onClose, subjectId, onSuccess }) => {
  const { data: allUsers = [], isLoading: isUsersLoading } = useGetUsersListQuery();
  const [assignUserToSubject, { isLoading: isAssigning }] = useAsignUserToSubjectMutation();
  const [createPendingAssignments, { isLoading: isSavingPending }] =
    useCreatePendingAssignmentsMutation();

  const [csvFile, setCsvFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [unmatchedRows, setUnmatchedRows] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file) => {
    // Try UTF-8 first, if it contains garbled characters (replacement char),
    // re-read with Windows-1250 which is common for Slovak/Czech CSV exports
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;

      // Check for common signs of wrong encoding (replacement character or mojibake)
      if (text.includes('\uFFFD') || /Ã[©¡­³º¤]/.test(text)) {
        const reReader = new FileReader();
        reReader.onload = (e2) => {
          processCSVText(e2.target.result);
        };
        reReader.readAsText(file, 'windows-1250');
        return;
      }

      processCSVText(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCSVText = (text) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    const parsed = [];
    const matched = [];
    const unmatched = [];

    // Detect delimiter from first line
    const firstLine = lines[0] || '';
    const delimiter = firstLine.includes(';') ? ';' : ',';
    lines.forEach((line, index) => {
      // Split by detected delimiter (semicolon or comma)
      const parts = line.split(delimiter).map((part) => part.trim().replace(/"/g, ''));

      // Based on your screenshot, the format is:
      // Column 0: skupina (3ZIH1A)
      // Column 1: priezvisko (surname) - "Bulla"
      // Column 2: meno (name) - "Radovan"
      // Column 3: os.číslo / ISIC (student number) - "319311"
      // Column 4 onwards: other data we don't need

      if (parts.length >= 4) {
        const group = parts[0];
        const surname = parts[1];
        const name = parts[2];
        const studentNumber = parts[3];

        // Skip if student number is empty or invalid
        if (!studentNumber || studentNumber === '') {
          return;
        }

        const rowData = {
          index,
          group,
          surname,
          name,
          studentNumber,
          originalLine: line
        };

        parsed.push(rowData);

        // Try to match user from database
        const matchedUser = findMatchingUser(allUsers, {
          name,
          surname,
          studentNumber
        });

        if (matchedUser) {
          matched.push({
            ...rowData,
            userId: matchedUser._id,
            userEmail: matchedUser.email,
            userGroupNumber: matchedUser.groupNumber,
            matched: true
          });
        } else {
          unmatched.push({
            ...rowData,
            matched: false
          });
        }
      }
    });

    setParsedData(parsed);
    setMatchedUsers(matched);
    setUnmatchedRows(unmatched);
  };

  const findMatchingUser = (users, csvRow) => {
    // Try to match by studentNumber first (most reliable and most important)
    if (csvRow.studentNumber) {
      const studentNumberStr = String(csvRow.studentNumber).trim();

      const byStudentNumber = users.find((user) => {
        if (!user.studentNumber) return false;
        const userStudentNumberStr = String(user.studentNumber).trim();
        return userStudentNumberStr === studentNumberStr;
      });

      if (byStudentNumber) {
        return byStudentNumber;
      }
    }

    // Try to match by name and surname (fallback)
    if (csvRow.name && csvRow.surname) {
      const byNameSurname = users.find(
        (user) =>
          user.name &&
          user.surname &&
          user.name.toLowerCase().trim() === csvRow.name.toLowerCase().trim() &&
          user.surname.toLowerCase().trim() === csvRow.surname.toLowerCase().trim()
      );

      if (byNameSurname) {
        return byNameSurname;
      }
    }

    return null;
  };

  const handleAssignUsers = async () => {
    if (matchedUsers.length === 0) {
      toast.warning('Žiadni používatelia na priradenie');
      return;
    }

    try {
      const userIds = matchedUsers.map((user) => user.userId);

      await assignUserToSubject({
        subjectId,
        userId: userIds.length === 1 ? userIds[0] : userIds
      }).unwrap();

      toast.success(`Úspešne priradených ${userIds.length} používateľov k predmetu`);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error('Chyba pri priraďovaní používateľov k predmetu');
    }
  };

  const handleSavePendingAssignments = async () => {
    if (unmatchedRows.length === 0) {
      toast.warning('Žiadni neregistrovaní študenti na uloženie');
      return;
    }

    try {
      const students = unmatchedRows.map((row) => ({
        studentNumber: row.studentNumber,
        name: row.name,
        surname: row.surname,
        group: row.group
      }));

      const result = await createPendingAssignments({
        subjectId,
        students
      }).unwrap();

      toast.success(result.message || `Uložených ${unmatchedRows.length} čakajúcich priradení`);

      if (result.results?.errors?.length > 0) {
        result.results.errors.forEach((err) => toast.warning(err));
      }
    } catch (error) {
      console.error('Error saving pending assignments:', error);
      toast.error('Chyba pri ukladaní čakajúcich priradení');
    }
  };

  const handleClose = () => {
    setCsvFile(null);
    setParsedData([]);
    setMatchedUsers([]);
    setUnmatchedRows([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle sx={{ fontWeight: 600, p: 0 }}>Priradiť používateľov z CSV</DialogTitle>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* File Upload Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Nahrajte CSV súbor
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Formát: skupina;priezvisko;meno;os.číslo;...
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Príklad: 3ZIH1A;&quot;Oliver&quot;;&quot;Donoval&quot;;&quot;319321&quot;;...
            </Typography>
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              <strong>Dôležité:</strong> Študenti sa párujú primárne podľa študentského čísla (4.
              stĺpec), ktoré musí byť v databáze. Prvý riadok (hlavička) sa preskočí.
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2 }}
            >
              Vybrať CSV súbor
              <input type="file" accept=".csv" hidden onChange={handleFileChange} />
            </Button>

            {csvFile && (
              <Chip
                label={csvFile.name}
                onDelete={() => {
                  setCsvFile(null);
                  setParsedData([]);
                  setMatchedUsers([]);
                  setUnmatchedRows([]);
                }}
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          {/* Loading State */}
          {isUsersLoading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {/* Summary */}
          {parsedData.length > 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Celkom riadkov: {parsedData.length} | Nájdených: {matchedUsers.length} |
                Nenájdených: {unmatchedRows.length}
              </Alert>
            </Box>
          )}

          {/* Raw CSV Data Table - Show all parsed data */}
          {parsedData.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Načítané údaje z CSV ({parsedData.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Skupina</TableCell>
                      <TableCell>Priezvisko</TableCell>
                      <TableCell>Meno</TableCell>
                      <TableCell>
                        <strong>Študentské číslo</strong>
                      </TableCell>
                      <TableCell>Stav</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.map((row, idx) => {
                      const isMatched = matchedUsers.some((m) => m.index === row.index);
                      return (
                        <TableRow
                          key={idx}
                          sx={{
                            backgroundColor: isMatched ? 'success.light' : 'error.light',
                            '&:hover': {
                              backgroundColor: isMatched ? 'success.main' : 'error.main'
                            }
                          }}
                        >
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{row.group}</TableCell>
                          <TableCell>{row.surname}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            <strong>{row.studentNumber}</strong>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isMatched ? '✓ Nájdený' : '✗ Nenájdený'}
                              color={isMatched ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Matched Users Table */}
          {matchedUsers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="success.main">
                Nájdení používatelia ({matchedUsers.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Skupina z CSV</TableCell>
                      <TableCell>Priezvisko</TableCell>
                      <TableCell>Meno</TableCell>
                      <TableCell>Študentské číslo</TableCell>
                      <TableCell>Email v systéme</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matchedUsers.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.group}</TableCell>
                        <TableCell>{row.surname}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.studentNumber}</TableCell>
                        <TableCell>{row.userEmail}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Unmatched Rows Table */}
          {unmatchedRows.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom color="error.main">
                Nenájdení používatelia ({unmatchedRows.length})
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Títo používatelia neboli nájdení v databáze a nebudú priradení.
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                Môžete uložiť čakajúce priradenia — keď sa títo študenti zaregistrujú a potvrdia
                email, budú automaticky priradení k tomuto predmetu.
              </Alert>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Skupina</TableCell>
                      <TableCell>Priezvisko</TableCell>
                      <TableCell>Meno</TableCell>
                      <TableCell>Študentské číslo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unmatchedRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.group}</TableCell>
                        <TableCell>{row.surname}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.studentNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          disabled={isAssigning || isSavingPending}
          variant="outlined"
          color="error"
        >
          Zrušiť
        </Button>
        <Button
          onClick={handleSavePendingAssignments}
          variant="outlined"
          color="warning"
          disabled={unmatchedRows.length === 0 || isSavingPending || isAssigning}
          startIcon={isSavingPending ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSavingPending
            ? 'Ukladám...'
            : `Uložiť ${unmatchedRows.length} čakajúcich priradení`}
        </Button>
        <Button
          onClick={handleAssignUsers}
          variant="contained"
          color="primary"
          disabled={matchedUsers.length === 0 || isAssigning || isSavingPending}
          startIcon={isAssigning ? <CircularProgress size={20} /> : null}
        >
          {isAssigning ? 'Priraďujem...' : `Priradiť ${matchedUsers.length} študentov k predmetu`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AssignUsersFromCSVModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func
};

export default AssignUsersFromCSVModal;
