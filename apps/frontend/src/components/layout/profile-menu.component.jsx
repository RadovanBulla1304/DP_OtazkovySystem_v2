import LogoutIcon from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';

const ProfileMenu = ({ onLogout, ...props }) => {
  return (
    <Menu {...props}>
      <MenuItem onClick={onLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText>Odhlásenie</ListItemText>
      </MenuItem>
    </Menu>
  );
};

ProfileMenu.propTypes = {
  onLogout: PropTypes.func // Specify that `value` is a required string
};

export default ProfileMenu;
