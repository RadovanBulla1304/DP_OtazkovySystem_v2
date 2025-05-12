export const getUserFromStorage = () => {
  const user = localStorage.getItem('user');

  if (!user) {
    return null;
  }

  return JSON.parse(user);
};

export const saveUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
};

export const geTokenFromStorage = () => {
  const user = localStorage.getItem('token');

  if (!user) {
    return null;
  }

  return JSON.parse(user);
};

export const saveTokenToStorage = (user) => {
  localStorage.setItem('token', JSON.stringify(user));
};

export const removeTokenFromStorage = () => {
  localStorage.removeItem('token');
};
