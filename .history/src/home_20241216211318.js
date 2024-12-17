import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { firestore, auth } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [isStaticMode, setIsStaticMode] = useState(true); // Modo estático como padrão
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [imageURL, setImageURL] = useState(null);
  const [imageSize, setImageSize] = useState(50);
  const [documentId, setDocumentId] = useState(null);

  const qrCodeRef = useRef();

  // Alternar entre QR Code dinâmico e estático
  const toggleMode = (mode) => {
    setIsStaticMode(mode === 'static');
  };

  // Upload de imagem e conversão para Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageURL(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG.');
    }
  };

  // Salvar QR Code no Firestore
  const handleSaveQRCode = async () => {
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
          fgColor, // Salvar a cor do primeiro plano
          bgColor, // Salvar a cor de fundo
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
          fgColor, // Salvar a cor do primeiro plano
          bgColor, // Salvar a cor de fundo
        });

        setQrCodeData({ qrCodeValue: dynamicLink });
        alert('QR Code dinâmico salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar QR Code dinâmico:', error);
        alert('Erro ao salvar o QR Code. Tente novamente.');
      }
    }
  };

  // Download do QR Code como PNG
  const handleDownloadQRCode = () => {
    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) {
      alert('Erro ao gerar QR Code para download.');
      return;
    }
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <div style={styles.container}>
      <h1>Gerador de QR Code</h1>

      <div style={styles.buttonGroup}>
        <button
          onClick={() => toggleMode('static')}
          style={{
            ...styles.toggleButton,
            backgroundColor: isStaticMode ? '#007BFF' : '#ccc',
          }}
        >
          QR Code Estático
        </button>
        <button
          onClick={() => toggleMode('dynamic')}
          style={{
            ...styles.toggleButton,
            backgroundColor: !isStaticMode ? '#28A745' : '#ccc',
          }}
        >
          QR Code Dinâmico
        </button>
      </div>

      <div style={styles.inputContainer}>
        <textarea
          placeholder="Insira o valor do QR Code"
          value={qrCodeValue}
          onChange={(e) => setQrCodeValue(e.target.value)}
          style={styles.input}
        />

        <div style={styles.colorPickerContainer}>
          <label>
            Cor do QR Code:
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              style={styles.colorPicker}
            />
          </label>
          <label>
            Cor de Fundo:
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={styles.colorPicker}
            />
          </label>
        </div>

        <div style={styles.imageUploadContainer}>
          <label>
            Escolha uma imagem para o QR Code:
            <input
              type="file"
              accept=".png,.svg"
              onChange={handleImageUpload}
              style={styles.imageInput}
            />
          </label>
        </div>

        <div style={styles.sliderContainer}>
          <label>
            Tamanho da imagem no QR Code: {imageSize}px
            <input
              type="range"
              min="20"
              max="100"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              style={styles.slider}
            />
          </label>
        </div>

        <button style={styles.saveButton} onClick={handleSaveQRCode}>
          Salvar QR Code no Banco
        </button>

        <button style={styles.downloadButton} onClick={handleDownloadQRCode}>
          Baixar QR Code
        </button>

        {qrCodeValue && (
          <div style={styles.qrCodeContainer} ref={qrCodeRef}>
            <QRCodeCanvas
              value={qrCodeValue}
              size={150}
              fgColor={fgColor}
              bgColor={bgColor}
              imageSettings={
                imageURL
                  ? {
                      src: imageURL,
                      height: imageSize,
                      width: imageSize,
                      excavate: false,
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      <div style={styles.profileButtonContainer}>
        <Link to="/profile">
          <button style={styles.profileButton}>
            Ir para o Perfil
          </button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', textAlign: 'center' },
  inputContainer: { margin: '20px auto' },
  colorPickerContainer: { marginTop: '20px', display: 'flex', gap: '10px' },
  imageUploadContainer: { marginTop: '20px' },
  sliderContainer: { marginTop: '20px' },
  qrCodeContainer: { marginTop: '20px' },
  buttonGroup: { display: 'flex', justifyContent: 'center', gap: '10px' },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
  },
  saveButton: {
    marginTop: '20px',
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
  },
  downloadButton: {
    marginTop: '10px',
    backgroundColor: '#28A745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
  },
  profileButtonContainer: {
    marginTop: '20px',
  },
  profileButton: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
