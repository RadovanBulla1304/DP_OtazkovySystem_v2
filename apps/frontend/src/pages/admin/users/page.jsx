import { Box, Divider } from '@mui/material';
import TeacherList from './components/TeacherList';
import UsersList from './components/UsersList';

const UsersAndTeachersPage = () => {
  return (
    <Box sx={{ pt: { xs: 3, sm: 4 }, pb: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 2, md: 0 } }}>
      <Box sx={{ mb: { xs: 4, sm: 6 } }}>
        <UsersList />
      </Box>
      <Divider sx={{ my: { xs: 3, sm: 4 } }} />
      <Box>
        <TeacherList />
      </Box>
    </Box>
  );
};

export default UsersAndTeachersPage;
