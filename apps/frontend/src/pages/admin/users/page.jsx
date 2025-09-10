import { Box, Divider } from '@mui/material';
import TeacherList from './TeacherList';
import UsersList from './UsersList';

const UsersAndTeachersPage = () => {
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
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
