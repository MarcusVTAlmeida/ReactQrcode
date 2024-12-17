import React, { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { firestore, auth, storage } from './firebase'; // Adicionar storage
import { collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Métodos para trabalhar com Storage
import Profile from './profile';  // Import ProfileScreen

export default function App() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isStaticMode, setIsStaticMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('text');
  const [documentId, setDocumentId] = useState(null);

  // Adicionar estados para personalização de cores
  const [fgColor, setFgColor] = useState('#000000'); // Cor do primeiro plano (preto por padrão)
  const [bgColor, setBgColor] = useState('#ffffff'); // Cor de fundo (branco por padrão)

  // Adicionar estado para armazenar a imagem
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);

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

    let uploadedImageURL = null;

    // Fazer upload da imagem se ela existir
    if (selectedImage) {
      try {
        const imageRef = ref(storage, `images/${user.uid}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        uploadedImageURL = await getDownloadURL(imageRef);
        setImageURL(uploadedImageURL);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
        return;
      }
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
          imageURL: uploadedImageURL, // Salvar o URL da imagem
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
          imageURL: uploadedImageURL, // Salvar o URL da imagem
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

        {/* Adicionar inputs para personalizar cores */}
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

        {/* Adicionar input para selecionar imagem */}
        <div style={styles.imageUploadContainer}>
          <label>
            Escolha uma imagem para o QR Code:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
              style={styles.imageInput}
            />
          </label>
        </div>

        {qrCodeData && (
          <div style={styles.qrCodeContainer}>
            <p style={styles.qrCodeText}>
              {isStaticMode
                ? `Conteúdo: ${qrCodeValue}`
                : 'Escaneie o QR Code para acessar o link:'}
            </p>
            <QRCodeSVG
              value={qrCodeData.qrCodeValue}
              size={150}
              fgColor={fgColor}
              bgColor={bgColor}
              imageSettings={{
                src: imageURL || '',
                x: undefined,
                y: undefined,
                height: 50,
                width: 50,
                excavate: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  colorPickerContainer: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  colorPicker: {
    marginLeft: '10px',
  },
  imageUploadContainer: {
    marginTop: '20px',
  },
  imageInput: {
    marginLeft: '10px',
  },
  colorPickerContainer: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  colorPicker: {
    marginLeft: '10px',
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
