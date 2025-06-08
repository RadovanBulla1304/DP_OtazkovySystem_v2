import { useCurrentSubject } from '@app/hooks/useCurrentSubject'; // path as created above
import { useCurrentSubjectId } from '@app/hooks/useCurrentSubjectId'; // path as created above
import { useGetModulsBySubjectQuery } from '@app/redux/api';
import ListIcon from '@mui/icons-material/List';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid'; // Changed from Unstable_Grid to standard Grid
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import AddQuestionModal from '../admin/components/AddQuestionModal';
const ModulsList = () => {
  const currentSubject = useCurrentSubject();
  const subjectId = useCurrentSubjectId();
  console.log('Current subject ID:', subjectId);
  const { data = [], isLoading } = useGetModulsBySubjectQuery(subjectId, {
    skip: !subjectId
  });

  useEffect(() => {
    console.log('Raw data from API:', data);
  }, [data]);
  // Make sure we have valid data to work with
  const validData = Array.isArray(data)
    ? data.filter((item) => item !== null && item !== undefined)
    : [];

  const columns = [
    { field: 'title', headerName: 'Názov modulu', flex: 1 },
    // {
    //   field: 'subject',
    //   headerName: 'Predmet',
    //   flex: 1,
    //   valueGetter: (value, row) => row.subject?.name || '-',
    //   renderCell: (params) => params.row.subject?.name || '-'
    // },
    {
      field: 'date_start',
      headerName: 'Začiatok',
      flex: 1,
      renderCell: (params) => {
        // Add null check for params.row and params.row.date_start
        return params.row.date_start ? dayjs(params.row.date_start).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'date_end',
      headerName: 'Koniec',
      flex: 1,
      renderCell: (params) => {
        // Add null check for params.row and params.row.date_end
        return params.row.date_end ? dayjs(params.row.date_end).format('DD.MM.YYYY') : '-';
      }
    },
    {
      field: 'duration_days',
      headerName: 'Trvanie (dni)',
      flex: 1,
      renderCell: (params) => {
        // Add null check for params.row and params.row.duration_days
        return params.row.duration_days !== undefined ? params.row.duration_days : '-';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Akcie',
      getActions: (params) => {
        const isEnded = params.row.date_end && dayjs().isAfter(dayjs(params.row.date_end), 'day');
        return [
          <>
            <AddQuestionModal key={'addQuestion'} disabled={isEnded} />
            <Tooltip title="Zoznam otázok" key={'showQuestion'}>
              <IconButton color="secondary">
                <ListIcon />
              </IconButton>
            </Tooltip>
          </>
        ];
      }
    }
  ];

  return (
    <Box py={2}>
      <Grid py={1} px={1} container spacing={1}>
        <Grid xs={12} sm={9}>
          <Typography variant="h4">
            Moduly{currentSubject ? ` – ${currentSubject.name}` : ''}
          </Typography>
        </Grid>
      </Grid>
      <Paper sx={{ mt: 2 }}>
        <DataGrid
          loading={isLoading}
          rows={validData}
          columns={columns}
          getRowId={(row) => row._id || Math.random().toString()}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            density: 'compact',
            pagination: {
              paginationModel: {
                pageSize: 20
              }
            }
          }}
          isRowSelectable={() => false}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          ignoreDiacritics
        />
      </Paper>
    </Box>
  );
};

export default ModulsList;
