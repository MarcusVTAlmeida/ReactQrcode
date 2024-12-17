import React, { useState, useEffect } from 'react';
import { firestore, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }
        } catch (error) {
          console.error('Erro ao carregar informações do usuário:', error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  if (!userInfo) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Informações do Perfil</h2>
      <p><strong>Nome:</strong> {userInfo.name}</p>
      {/* Exiba outras informações conforme necessário */}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    textAlign: 'center',
  },
};
