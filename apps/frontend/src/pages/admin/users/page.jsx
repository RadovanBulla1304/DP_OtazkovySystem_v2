import { Box, Divider } from '@mui/material';
import TeacherList from './components/TeacherList';
import UsersList from './components/UsersList';

const UsersAndTeachersPage = () => {
  return (
    <Box sx={{ pt: 3, pb: 3 }}>
      <Box sx={{ mb: 6 }}>
        <UsersList />
      </Box>
      <Divider sx={{ my: 4 }} />
      <Box>
        <TeacherList />
      </Box>
    </Box>
  );
};

export default UsersAndTeachersPage;
