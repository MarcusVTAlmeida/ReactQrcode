import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { firestore, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [isStaticMode, setIsStaticMode] = useState(false);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [imageURL, setImageURL] = useState(null);
  const [imageSize, setImageSize] = useState(50); // Tamanho inicial da imagem

  const qrCodeRef = useRef();

  // Upload de imagem e conversão para Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setImageURL(event.target.result); // Imagem convertida para Base64
      };

      reader.readAsDataURL(file); // Converte o arquivo para Base64
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG.');
    }
  };

  // Salvar QR Code no banco de dados
  const handleSaveQRCode = async () => {
    if (!qrCodeValue.trim()) {
      alert('Por favor, insira um valor para o QR Code!');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado para salvar QR Codes!');
      return;
    }

    try {
      const docRef = doc(collection(firestore, 'links'));
      const qrCodeData = {
        value: qrCodeValue.trim(),
        contentType: isStaticMode ? 'estatico' : 'dinamico',
        createdAt: serverTimestamp(),
        userId: user.uid,
        fgColor,
        bgColor,
        imageURL,
      };

      await setDoc(docRef, qrCodeData);
      alert('QR Code salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar QR Code:', error);
      alert('Erro ao salvar QR Code. Tente novamente.');
    }
  };

  // Download do QR Code como PNG
  const handleDownloadQRCode = () => {
    const canvas = qrCodeRef.current.querySelector('canvas'); // Pega o canvas gerado
    if (!canvas) {
      alert('Erro ao gerar QR Code para download.');
      return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png'); // Converte para PNG
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <div style={styles.container}>
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
                      x: undefined,
                      y: undefined,
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
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  inputContainer: {
    margin: '20px auto',
  },
  colorPickerContainer: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  imageUploadContainer: {
    marginTop: '20px',
  },
  sliderContainer: {
    marginTop: '20px',
  },
  qrCodeContainer: {
    marginTop: '20px',
    display: 'inline-block',
  },
  saveButton: {
    marginTop: '20px',
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  downloadButton: {
    marginTop: '10px',
    backgroundColor: '#28A745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
