import React, { useState, useRef } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { firestore, auth } from './firebase';
import { collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import Profile from './profile';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isStaticMode, setIsStaticMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('text');
  const [documentId, setDocumentId] = useState(null);

  const [fgColor, setFgColor] = useState('#000000'); // Cor do primeiro plano
  const [bgColor, setBgColor] = useState('#ffffff'); // Cor de fundo
  const [imageURL, setImageURL] = useState(null); // Imagem central no QR
  const [imageSize, setImageSize] = useState(50);

  const qrCodeRef = useRef();

  const placeholders = {
    text: 'Insira o texto',
    link: 'Insira o link (https://)',
    telefone: 'Insira o número de telefone',
    whatsapp: 'Insira o número do WhatsApp',
    wifi: 'Insira os dados do Wi-Fi',
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      const reader = new FileReader();
      reader.onload = (event) => setImageURL(event.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG.');
    }
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

    try {
      const docRef = doc(collection(firestore, 'links'));
      const dynamicLink = `https://qrcode-7bd9a.web.app/${docRef.id}`;

      const qrData = {
        value: isStaticMode ? qrCodeValue.trim() : dynamicLink,
        destinationUrl: qrCodeValue.trim(),
        contentType: selectedMode,
        createdAt: serverTimestamp(),
        userId: user.uid,
        type: isStaticMode ? 'estatico' : 'dinamico',
        fgColor,
        bgColor,
        imageURL,
      };

      await setDoc(docRef, qrData);

      setQrCodeData({
        qrCodeValue: isStaticMode ? qrCodeValue.trim() : dynamicLink,
      });

      alert(`QR Code ${isStaticMode ? 'estático' : 'dinâmico'} salvo com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar QR Code:', error);
      alert('Erro ao salvar QR Code. Tente novamente.');
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

        <label>
          Adicionar imagem:
          <input type="file" accept=".png,.svg" onChange={handleImageUpload} />
        </label>
        <label>
          Tamanho da imagem: {imageSize}px
          <input
            type="range"
            min="20"
            max="100"
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
          />
        </label>

        <button style={styles.generateButton} onClick={handleGenerateQRCode}>
          Gerar QR Code
        </button>

        {qrCodeData && (
          <div ref={qrCodeRef}>
            <p>Conteúdo do QR Code:</p>
            <QRCodeCanvas
              value={qrCodeData.qrCodeValue}
              size={200}
              fgColor={fgColor}
              bgColor={bgColor}
              imageSettings={
                imageURL
                  ? { src: imageURL, width: imageSize, height: imageSize, excavate: true }
                  : null
              }
            />
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
      <Link to="/profile">
        <button style={styles.profileButton}>Ir para o Perfil</button>
      </Link>
    </div>
  );
}

const styles = {
  container: { textAlign: 'center', padding: '20px' },
  switchContainer: { marginBottom: '10px' },
  inputContainer: { marginTop: '20px' },
  colorPickerContainer: { display: 'flex', justifyContent: 'center', gap: '10px' },
  colorPicker: { marginLeft: '5px' },
  generateButton: { marginTop: '10px', padding: '10px', cursor: 'pointer' },
  footer: { marginTop: '20px' },
  footerButton: { margin: '5px', padding: '5px 10px', cursor: 'pointer' },
  activeButton: { backgroundColor: '#007BFF', color: 'white' },
  profileButton: { marginTop: '20px', backgroundColor: '#007BFF', color: 'white' },
};
