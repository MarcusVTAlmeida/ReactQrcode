import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../../firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import QRCode from 'qrcode.react'; // Usando qrcode.react para gerar QR codes na versão Web
import { Link } from 'react-router-dom'; // Para navegação, se necessário

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newQrCodeValue, setNewQrCodeValue] = useState('');
  const user = auth.currentUser;

  // URL base do Firebase Hosting
  const hostingBaseUrl = 'https://qrcode-7bd9a.web.app';

  // Carregar dados do usuário e QR Codes
  useEffect(() => {
    const loadQrCodes = async () => {
      if (user) {
        try {
          // Carregar QR Codes da coleção 'links'
          const qrCodeSnapshot = await getDocs(collection(firestore, 'links'));
          const qrCodeList = qrCodeSnapshot.docs.map((doc) => ({
            id: doc.id,
            link: `${hostingBaseUrl}/${doc.id}`,
            ...doc.data(),
          }));

          setQrCodes(qrCodeList);
        } catch (error) {
          console.error('Erro ao carregar QR Codes:', error);
        }
      }
    };

    loadQrCodes();
  }, [user]);

  // Salvar nome do usuário
  const handleSaveName = async () => {
    if (user) {
      try {
        await setDoc(doc(firestore, 'users', user.uid), { name });
        alert('Nome salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar o nome:', error);
      }
    }
  };

  // Abrir modal e carregar QR Code selecionado
  const openQrCodeModal = (qrCode) => {
    setSelectedQrCode(qrCode);
    setNewQrCodeValue(qrCode.qrCodeValue); // Preencher com o valor atual
    setModalVisible(true);
  };

  // Atualizar QR Code no Firestore
  const handleUpdateQrCode = async () => {
    if (selectedQrCode && newQrCodeValue.trim()) {
      try {
        const mainLinkRef = doc(firestore, 'links', selectedQrCode.id);

        // Atualizar o documento na coleção 'links'
        await updateDoc(mainLinkRef, {
          destinationUrl: newQrCodeValue,
          updatedAt: serverTimestamp(),
        });

        // Atualizar localmente
        const updatedQrCodes = qrCodes.map((qrCode) =>
          qrCode.id === selectedQrCode.id
            ? { ...qrCode, qrCodeValue: newQrCodeValue, link: `${hostingBaseUrl}/${selectedQrCode.id}` }
            : qrCode
        );
        setQrCodes(updatedQrCodes);

        alert('QR Code atualizado com sucesso!');
        setModalVisible(false);
      } catch (error) {
        console.error('Erro ao atualizar QR Code:', error);
        alert('Erro ao atualizar o QR Code. Tente novamente.');
      }
    } else {
      alert('Por favor, insira um novo valor para o QR Code.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Perfil</h2>
      <label style={styles.label}>Nome do Usuário:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Digite seu nome"
        style={styles.input}
      />
      <button onClick={handleSaveName}>Salvar Nome</button>

      <h3 style={styles.subHeader}>QR Codes Gerados:</h3>
      <ul>
        {qrCodes.map((item) => (
          <li key={item.id} style={styles.qrCodeItem}>
            <div style={styles.qrCodeText}>{`Valor: ${item.destinationUrl}`}</div>
            <a href={item.link} style={styles.qrCodeLink} target="_blank" rel="noopener noreferrer">
              {`Link: ${item.link}`}
            </a>
            <button onClick={() => openQrCodeModal(item)}>Editar QR Code</button>
          </li>
        ))}
      </ul>

      {/* Modal para visualizar e editar o QR Code */}
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4 style={styles.modalHeader}>Editar QR Code</h4>
            {selectedQrCode && (
              <>
                <QRCode value={selectedQrCode.destinationUrl} size={200} />
                <a href={selectedQrCode.link} style={styles.modalLink} target="_blank" rel="noopener noreferrer">
                  {selectedQrCode.link}
                </a>
              </>
            )}
            <input
              type="text"
              value={newQrCodeValue}
              onChange={(e) => setNewQrCodeValue(e.target.value)}
              placeholder={selectedQrCode?.contentType === 'link' ? 'Digite um novo link' : 'Digite um novo texto'}
              style={styles.input}
            />
            <button onClick={handleUpdateQrCode}>Atualizar QR Code</button>
            <button onClick={() => setModalVisible(false)}>Fechar</button>
            <p style={styles.label}>
              {selectedQrCode?.contentType === 'link' ? 'Tipo: Link' : 'Tipo: Texto'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    fontSize: '20px',
    marginBottom: '10px',
  },
  label: {
    color: 'black',
  },
  subHeader: {
    fontSize: '18px',
    marginTop: '20px',
  },
  qrCodeItem: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  qrCodeText: {
    color: 'black',
  },
  qrCodeLink: {
    color: 'blue',
    textDecoration: 'underline',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '300px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    textAlign: 'center',
  },
  modalHeader: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  modalLink: {
    color: 'blue',
    textDecoration: 'underline',
    margin: '10px 0',
  },
  input: {
    border: '1px solid #ccc',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '5px',
    width: '100%',
  },
};
