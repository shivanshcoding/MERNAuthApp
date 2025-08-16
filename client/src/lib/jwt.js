export const getUserFromToken = async () => {
  try {
    const res = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  } catch (err) {
    return null;
  }
};
