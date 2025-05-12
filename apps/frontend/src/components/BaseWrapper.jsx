import { Card } from '@mui/material';

const BaseWrapper = ({ children }) => {
  return <Card p={4}>{children}</Card>;
};

export default BaseWrapper;
