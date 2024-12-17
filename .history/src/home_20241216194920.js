import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { firestore, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [imageURL, setImageURL] = useState(null);
  const [imageSize, setImageSize] = useState(50);
  const [selectedImage, setSelectedImage] = useState(null);
  const qrCanvasRef = useRef(null); // Referência ao QR Code Canvas

  // Upload de Imagem para Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
      setSelectedImage(file);

      try {
        const user = auth.currentUser;
        if (!user) {
          alert('Você precisa estar logado para enviar imagens!');
          return;
        }

        const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const uploadedURL = await getDownloadURL(imageRef);

        setImageURL(uploadedURL);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    } else {
      alert('Por favor, selecione uma imagem no formato PNG ou SVG com fundo transparente.');
    }
  };

  // Salvar QR Code no Firebase
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

  // Baixar QR Code Gerado
  const handleDownloadQRCode = () => {
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) {
      alert('Erro ao acessar o QR Code. Tente novamente.');
      return;
    }
    

    // Converta o Canvas para Imagem PNG
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <div style={styles.container}>
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

      {/* Renderizar o QR Code no Canvas */}
      <div ref={qrCanvasRef}>
        <QRCodeCanvas
          value={qrCodeValue}
          size={300}
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
              : null
          }
        />
      </div>

      <button style={styles.saveButton} onClick={handleSaveQRCode}>
        Salvar QR Code no Banco
      </button>

      <button style={styles.downloadButton} onClick={handleDownloadQRCode}>
        Baixar QR Code
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  input: {
    marginBottom: '20px',
    width: '100%',
    padding: '10px',
  },
  colorPickerContainer: {
    marginBottom: '20px',
  },
  imageUploadContainer: {
    marginBottom: '20px',
  },
  sliderContainer: {
    marginBottom: '20px',
  },
  saveButton: {
    marginRight: '10px',
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  downloadButton: {
    backgroundColor: '#28A745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
