import {useEffect, useState} from 'react';

const USER_ID = 'USER_ID';

export function useUserId() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem(USER_ID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_ID, id);
    }

    setUserId(id);
  }, []);

  return userId;
}
