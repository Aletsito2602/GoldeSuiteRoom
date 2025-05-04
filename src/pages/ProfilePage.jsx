import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SectionHeader from '../components/SectionHeader';
import { initializeUserDocument, testFirestoreConnection } from '../utils/initFirestore';
import ImageUploader from '../components/ImageUploader';

function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [initStatus, setInitStatus] = useState({ isRunning: false, result: null });
  const [profileImage, setProfileImage] = useState(currentUser?.photoURL || '');

  // Cargar datos del perfil actual cuando esté disponible
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        phoneNumber: userProfile.phoneNumber || ''
      });
    }
    
    // Actualizar la imagen de perfil cuando cambie el usuario
    if (currentUser) {
      setProfileImage(currentUser.photoURL || '');
    }
  }, [userProfile, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const success = await updateUserProfile({
        ...formData,
        photoURL: profileImage // Incluir la URL de la foto al actualizar el perfil
      });
      if (success) {
        setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        setIsEditing(false);
      } else {
        setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
      }
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar actualización de imagen
  const handleImageUploaded = (downloadURL) => {
    setProfileImage(downloadURL);
    setMessage({ text: 'Foto de perfil actualizada correctamente', type: 'success' });
    
    // También actualizamos el perfil en Firestore
    updateUserProfile({ photoURL: downloadURL })
      .then(() => {
        console.log('Perfil en Firestore actualizado con nueva foto');
      })
      .catch(error => {
        console.error('Error al actualizar foto en Firestore:', error);
      });
  };

  // Función para inicializar manualmente el documento de usuario
  const handleInitializeUser = async () => {
    setInitStatus({ isRunning: true, result: null });
    try {
      const success = await initializeUserDocument();
      setInitStatus({ 
        isRunning: false, 
        result: success ? 'success' : 'error' 
      });
    } catch (error) {
      console.error('Error al inicializar usuario:', error);
      setInitStatus({ 
        isRunning: false, 
        result: 'error'
      });
    }
  };

  // Función para probar la conexión a Firestore
  const handleTestConnection = async () => {
    setInitStatus({ isRunning: true, result: null });
    try {
      const success = await testFirestoreConnection();
      setInitStatus({ 
        isRunning: false, 
        result: success ? 'connection-success' : 'connection-error' 
      });
    } catch (error) {
      console.error('Error al probar conexión:', error);
      setInitStatus({ 
        isRunning: false, 
        result: 'connection-error'
      });
    }
  };

  if (!currentUser) {
    return <div>Debes iniciar sesión para ver tu perfil.</div>;
  }

  return (
    <div className="profile-page">
      <SectionHeader title="Perfil de Usuario" />
      
      {message.text && (
        <div 
          style={{ 
            padding: '10px', 
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white'
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#353535', 
        borderRadius: '20px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        {/* Header con foto de perfil e información principal */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            backgroundColor: '#555', 
            marginRight: '20px',
            backgroundImage: `url(${profileImage || 'https://via.placeholder.com/100'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Mostrar un indicador cuando la imagen está cargando */}
            {profileImage !== currentUser.photoURL && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                Actualizando...
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: '0 0 10px 0' }}>{userProfile?.displayName || currentUser.email}</h2>
            <p style={{ color: '#aaa', margin: 0 }}>{currentUser.email}</p>
            {userProfile?.bio && <p style={{ margin: '10px 0 0 0' }}>{userProfile.bio}</p>}
          </div>
        </div>

        {/* Añadir componente para subir imágenes */}
        <ImageUploader onImageUploaded={handleImageUploaded} />

        {!isEditing ? (
          // Vista de información (modo lectura)
          <div>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ color: '#D7B615', marginBottom: '10px' }}>Información de Contacto</h3>
              <p><strong>Email:</strong> {currentUser.email}</p>
              {userProfile?.phoneNumber && <p><strong>Teléfono:</strong> {userProfile.phoneNumber}</p>}
              {userProfile?.website && <p><strong>Sitio web:</strong> {userProfile.website}</p>}
              {userProfile?.location && <p><strong>Ubicación:</strong> {userProfile.location}</p>}
            </div>
            
            <button 
              onClick={() => setIsEditing(true)}
              style={{ 
                padding: '10px 15px',
                background: 'linear-gradient(90deg, #D7B615, #f0c040)',
                color: '#222',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          // Formulario de edición
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Nombre
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    color: 'white',
                    marginTop: '5px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Biografía
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    color: 'white',
                    marginTop: '5px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Ubicación
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    color: 'white',
                    marginTop: '5px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Sitio Web
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    color: 'white',
                    marginTop: '5px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Teléfono
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    color: 'white',
                    marginTop: '5px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  padding: '10px 15px',
                  background: 'linear-gradient(90deg, #D7B615, #f0c040)',
                  color: '#222',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                style={{ 
                  padding: '10px 15px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Sección de diagnóstico y herramientas */}
      <div style={{ 
        backgroundColor: '#353535', 
        borderRadius: '20px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#D7B615', marginBottom: '15px' }}>Herramientas de Diagnóstico</h3>
        
        <p style={{ marginBottom: '15px' }}>Si no puedes ver tu perfil o hay problemas con Firestore, usa estas herramientas:</p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={handleInitializeUser}
            disabled={initStatus.isRunning}
            style={{ 
              padding: '10px 15px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: initStatus.isRunning ? 'not-allowed' : 'pointer',
              opacity: initStatus.isRunning ? 0.7 : 1
            }}
          >
            {initStatus.isRunning ? 'Procesando...' : 'Inicializar Perfil en Firestore'}
          </button>
          
          <button 
            onClick={handleTestConnection}
            disabled={initStatus.isRunning}
            style={{ 
              padding: '10px 15px',
              backgroundColor: '#795548',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: initStatus.isRunning ? 'not-allowed' : 'pointer',
              opacity: initStatus.isRunning ? 0.7 : 1
            }}
          >
            {initStatus.isRunning ? 'Probando...' : 'Probar Conexión a Firestore'}
          </button>
        </div>
        
        {initStatus.result && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '8px',
            backgroundColor: 
              initStatus.result === 'success' || initStatus.result === 'connection-success' 
                ? '#4caf50' 
                : '#f44336',
            color: 'white'
          }}>
            {initStatus.result === 'success' && 'Perfil inicializado correctamente. Verifica en Firebase.'}
            {initStatus.result === 'error' && 'Error al inicializar perfil. Verifica la consola para más detalles.'}
            {initStatus.result === 'connection-success' && 'Conexión a Firestore establecida correctamente.'}
            {initStatus.result === 'connection-error' && 'Error de conexión a Firestore. Verifica permisos y configuración.'}
          </div>
        )}
        
        <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#aaa' }}>
          <p><strong>Nota:</strong> Es posible que necesites recargar la página después de inicializar tu perfil.</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 