import { useGetModulsBySubjectQuery, useGetSubjectByIdQuery } from '@app/redux/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import AddModulModal from '../admin/components/AddModulModal';

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isModulModalOpen, setIsModulModalOpen] = useState(false);

  // Fetch subject details
  const {
    data: subject,
    isLoading: isSubjectLoading,
    isError: isSubjectError,
    refetch: refetchSubject
  } = useGetSubjectByIdQuery(subjectId);

  // Fetch modules for this subject
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
    refetch: refetchModules
  } = useGetModulsBySubjectQuery(subjectId);

  const handleOpenModulModal = () => {
    setIsModulModalOpen(true);
  };

  const handleCloseModulModal = () => {
    setIsModulModalOpen(false);
  };

  const handleModulCreated = async () => {
    try {
      await refetchSubject();
      await refetchModules();
      handleCloseModulModal();
    } catch (error) {
      console.error('Error handling modul creation:', error);
    }
  };

  const handleEditSubject = () => {
    navigate(`/subjects/${subjectId}/edit`);
  };

  // Define columns for the modules table
  const columns = [
    { field: 'title', headerName: 'Názov modulu', flex: 1 },
    {
      field: 'date_start',
      headerName: 'Začiatok',
      flex: 1,
      valueGetter: (params) => {
        return params.row?.date_start ? dayjs(params.row.date_start).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'date_end',
      headerName: 'Koniec',
      flex: 1,
      valueGetter: (params) => {
        return params.row?.date_end ? dayjs(params.row.date_end).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'duration_days',
      headerName: 'Trvanie (dni)',
      flex: 1,
      valueGetter: (params) => {
        return params.row?.duration_days !== undefined ? params.row.duration_days : '-';
      }
    },
    {
      field: 'actions',
      headerName: 'Akcie',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/moduls/${params.row._id}`)}
          >
            Detail
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => navigate(`/moduls/${params.row._id}/edit`)}
          >
            Upraviť
          </Button>
        </Box>
      )
    }
  ];

  // Loading state
  if (isSubjectLoading || isModulesLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isSubjectError || isModulesError) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">Chyba pri načítaní údajov</Typography>
      </Box>
    );
  }

  // If subject not found
  if (!subject) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Predmet nebol nájdený</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/subjects" underline="hover" color="inherit">
          Predmety
        </Link>
        <Typography color="text.primary">{subject.name}</Typography>
      </Breadcrumbs>

      {/* Subject details card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h4" component="h1">
              {subject.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditSubject}>
                Upraviť predmet
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenModulModal}
              >
                Pridať modul
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                ID: {subject._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vytvorené: {dayjs(subject.createdAt).format('DD.MM.YYYY')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Počet modulov: {subject.moduls?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Počet priradených používateľov: {subject.assignedUsers?.length || 0}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modules table */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Moduly predmetu
        </Typography>

        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={modules}
            columns={columns}
            getRowId={(row) => row._id || Math.random().toString()}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              },
              sorting: {
                sortModel: [{ field: 'date_start', sort: 'desc' }]
              }
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true
              }
            }}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>

      {/* Add Module Modal */}
      <AddModulModal
        open={isModulModalOpen}
        onClose={handleCloseModulModal}
        subjectId={subjectId}
        onSuccess={handleModulCreated}
      />
    </Box>
  );
};

export default SubjectDetail;
