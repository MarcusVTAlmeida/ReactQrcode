import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { firestore, auth } from './firebase';
import { collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isStaticMode, setIsStaticMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('text');
  const [documentId, setDocumentId] = useState(null);

  const placeholders = {
    text: 'Insira o texto',
    link: 'Insira o link (https://)',
    telefone: 'Insira o número de telefone',
    whatsapp: 'Insira o número do WhatsApp',
    contato: 'Insira as informações de contato',
    wifi: 'Insira os dados do Wi-Fi',
    instagram: 'Insira o nome de usuário do Instagram',
    youtube: 'Insira o link do canal ou vídeo do YouTube',
    email: 'Insira o endereço de e-mail',
    facebook: 'Insira o link ou nome do perfil no Facebook',
    messenger: 'Insira o nome do usuário no Messenger',
  };

  const handleGenerateQRCode = async () => {
    if (!qrCodeValue.trim()) {
      alert('Por favor, insira um valor para o QR Code!');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado para gerar QR Codes!');
      return;
    }

    if (isStaticMode) {
      try {
        const docRef = doc(collection(firestore, 'links'));
        await setDoc(docRef, {
          value: qrCodeValue.trim(),
          contentType: selectedMode,
          createdAt: serverTimestamp(),
          userId: user.uid,
          type: 'estatico',
        });
        setDocumentId(docRef.id);
        alert('QR Code estático salvo com sucesso!');
        setQrCodeData({ qrCodeValue });
      } catch (error) {
        console.error('Erro ao salvar QR Code estático:', error);
        alert('Erro ao salvar QR Code. Tente novamente.');
      }
    } else {
      try {
        const docRef = doc(collection(firestore, 'links'));
        const dynamicLink = `https://qrcode-7bd9a.web.app/${docRef.id}`;

        await setDoc(docRef, {
          link: dynamicLink,
          destinationUrl: qrCodeValue.trim(),
          contentType: selectedMode,
          createdAt: serverTimestamp(),
          userId: user.uid,
          type: 'dinamico',
        });

        setQrCodeData({ qrCodeValue: dynamicLink });
        alert('QR Code dinâmico salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar QR Code dinâmico:', error);
        alert('Erro ao salvar o QR Code. Tente novamente.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.switchContainer}>
        <button
          onClick={() => {
            setIsStaticMode(!isStaticMode);
            setQrCodeValue('');
            setQrCodeData(null);
          }}
        >
          Alternar para QR Code {isStaticMode ? 'Dinâmico' : 'Estático'}
        </button>
        <p style={styles.modeText}>
          Modo atual: {isStaticMode ? 'Estático' : 'Dinâmico'}
        </p>
      </div>

      <div style={styles.inputContainer}>
        <textarea
          placeholder={placeholders[selectedMode]}
          value={qrCodeValue}
          onChange={(e) => setQrCodeValue(e.target.value)}
          style={styles.input}
        />

        <button style={styles.generateButton} onClick={handleGenerateQRCode}>
          Gerar QR Code
        </button>

        {qrCodeData && (
          <div style={styles.qrCodeContainer}>
            <p style={styles.qrCodeText}>
              {isStaticMode
                ? `Conteúdo: ${qrCodeValue}`
                : 'Escaneie o QR Code para acessar o link:'}
            </p>
            <QRCode value={qrCodeData.qrCodeValue} size={150} />
          </div>
        )}
      </div>

      <div style={styles.footer}>
        {Object.keys(placeholders).map((key) => (
          <button
            key={key}
            style={{
              ...styles.footerButton,
              ...(selectedMode === key ? styles.activeButton : {}),
            }}
            onClick={() => {
              setSelectedMode(key);
              setQrCodeValue('');
              setQrCodeData(null);
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    textAlign: 'center',
  },
  switchContainer: {
    marginBottom: '20px',
  },
  modeText: {
    fontSize: '16px',
    marginTop: '10px',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  qrCodeContainer: {
    marginTop: '20px',
  },
  qrCodeText: {
    marginBottom: '10px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  footerButton: {
    backgroundColor: '#E0E0E0',
    color: 'black',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  activeButton: {
    backgroundColor: '#007BFF',
    color: 'white',
  },
};
