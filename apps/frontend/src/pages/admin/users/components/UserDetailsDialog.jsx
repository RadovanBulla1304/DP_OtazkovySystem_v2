import { useGetAdminUserDetailsQuery, useUpdateUserAcademicProfileMutation } from '@app/redux/api';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '-';
  }
};

const UserDetailsDialog = ({ open, user, onClose }) => {
  const userId = user?._id;
  const { data, isFetching, refetch } = useGetAdminUserDetailsQuery(userId, {
    skip: !open || !userId
  });

  const [updateAcademicProfile, { isLoading: isSaving }] = useUpdateUserAcademicProfileMutation();

  const details = data?.data;
  const userDetails = details?.user;

  const [adminNotes, setAdminNotes] = useState('');
  const [isRepetent, setIsRepetent] = useState(false);
  const [isPostZapis, setIsPostZapis] = useState(false);

  useEffect(() => {
    if (!open || !userDetails) return;
    setAdminNotes(userDetails.adminNotes || '');
    setIsRepetent(!!userDetails.isRepetent);
    setIsPostZapis(!!userDetails.isPostZapis);
  }, [open, userDetails]);

  const projects = useMemo(() => details?.projects || [], [details]);
  const pointsBySubject = useMemo(() => details?.pointsBySubject || [], [details]);
  const modulesOverview = useMemo(() => details?.modulesOverview || [], [details]);

  const handleSave = async () => {
    if (!userId) return;
    try {
      await updateAcademicProfile({
        userId,
        data: {
          adminNotes,
          isRepetent,
          isPostZapis
        }
      }).unwrap();
      toast.success('Profil študenta bol uložený');
      refetch();
    } catch (error) {
      console.error('Error updating academic profile:', error);
      toast.error('Nepodarilo sa uložiť profil študenta');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          mx: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle>Detail študenta</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {!userId ? (
          <Typography color="text.secondary">Nie je vybraný študent.</Typography>
        ) : isFetching ? (
          <Typography color="text.secondary">Načítavam údaje...</Typography>
        ) : (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Meno
                  </Typography>
                  <Typography>
                    {userDetails?.name} {userDetails?.surname}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{userDetails?.email || '-'}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Skupina
                  </Typography>
                  <Typography>{userDetails?.groupNumber || '-'}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Študentské číslo
                  </Typography>
                  <Typography>{userDetails?.studentNumber || '-'}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Predmety
                  </Typography>
                  <Typography>
                    {(userDetails?.assignedSubjects || [])
                      .map((s) => s.name || s.title)
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </Typography>
                </Grid2>
              </Grid2>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Administratívny profil
              </Typography>
              <Grid2 container spacing={2} alignItems="center">
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isRepetent}
                        onChange={(e) => setIsRepetent(e.target.checked)}
                      />
                    }
                    label="Repetent"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPostZapis}
                        onChange={(e) => setIsPostZapis(e.target.checked)}
                      />
                    }
                    label="Post-zápis"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Poznámky"
                    fullWidth
                    multiline
                    minRows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </Grid2>
              </Grid2>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Body podľa predmetov
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Predmet</TableCell>
                      <TableCell align="right">Body</TableCell>
                      <TableCell align="right">Záznamy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pointsBySubject.length > 0 ? (
                      pointsBySubject.map((row) => (
                        <TableRow key={String(row.subjectId || row.subjectName)}>
                          <TableCell>{row.subjectName}</TableCell>
                          <TableCell align="right">{row.totalPoints}</TableCell>
                          <TableCell align="right">{row.itemsCount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          Bez bodov
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Projekty
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Názov</TableCell>
                      <TableCell>Predmet</TableCell>
                      <TableCell>Stav</TableCell>
                      <TableCell>Termín</TableCell>
                      <TableCell align="right">Max bodov</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <TableRow key={project._id}>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>
                            {project.subject?.name || project.subject?.title || '-'}
                          </TableCell>
                          <TableCell>{project.status || '-'}</TableCell>
                          <TableCell>{formatDate(project.due_date)}</TableCell>
                          <TableCell align="right">{project.max_points ?? '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Žiadne projekty
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Moduly a aktivita
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Predmet</TableCell>
                      <TableCell>Modul</TableCell>
                      <TableCell align="right">Týždeň</TableCell>
                      <TableCell align="right">Vytvorené otázky</TableCell>
                      <TableCell align="right">Validácie</TableCell>
                      <TableCell align="right">Odpovede</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modulesOverview.length > 0 ? (
                      modulesOverview.map((module) => (
                        <TableRow key={module._id}>
                          <TableCell>{module.subjectName}</TableCell>
                          <TableCell>{module.title}</TableCell>
                          <TableCell align="right">{module.week_number ?? '-'}</TableCell>
                          <TableCell align="right">{module.createdQuestions}</TableCell>
                          <TableCell align="right">{module.validatedQuestions}</TableCell>
                          <TableCell align="right">{module.responseCount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Žiadne moduly
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
      >
        <Button
          onClick={onClose}
          color="error"
          variant="outlined"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Zrušiť
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!userId || isSaving}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {isSaving ? 'Ukladám...' : 'Uložiť profil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

export default UserDetailsDialog;
