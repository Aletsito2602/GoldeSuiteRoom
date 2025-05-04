import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { validateClientEmail } from '../utils/clientValidation';
import './LoginPage.css'; // Corregir ruta a relativa

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, syncUserWithFirestore } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // Redirigir a home después del login (AuthContext se encargará del estado)
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        setLoading(false);
        return;
    }
    if (!firstName || !lastName) {
        setError('Nombre y Apellido son requeridos.');
        setLoading(false);
        return;
    }
    
    try {
      // Primero validamos si el email está en la lista de clientes autorizados
      const { isValid, clientInfo } = await validateClientEmail(email);
      
      if (!isValid) {
        setError('No encontramos tu correo en nuestra lista de clientes. Si has adquirido Mi Legado, por favor contacta a soporte.');
        setLoading(false);
        return;
      }
      
      // Si el cliente está autorizado, procedemos con el registro
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar el perfil del usuario con nombre y apellido
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Guardar datos adicionales del cliente en Firestore
      await syncUserWithFirestore(user, clientInfo);

      setIsLoginMode(true);
      alert('¡Registro exitoso! Por favor, inicia sesión.');
      
      // Limpiar campos después del registro
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      console.error("Failed to sign up", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso.');
      } else {
        setError('Error al registrarse. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    // Clear fields when switching modes
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-page-container">
      {/* Columna Izquierda - Placeholder con Gradiente */}
      <div className="login-left-column">
         {/* Podrías añadir aquí el logo o texto como en la imagen */}
         <div className="left-content">
             <div className="logo-placeholder">MI LEGADO</div> {/* Logo */}
             {/* Eliminado h2 y p */}
             {/* <h2>Comienza con Nosotros</h2> */}
             {/* <p>Completa estos sencillos pasos para unirte a nuestra comunidad.</p> */}
             {/* Placeholder para los steps, podrías hacerlos interactivos */}
             <div className="steps-placeholder">
                 <div className={`step ${!isLoginMode ? 'active' : ''}`}><span>1</span> Crea tu cuenta</div>
                 <div className="step"><span>2</span> Explora las Clases</div>
                 <div className="step"><span>3</span> Únete a la Comunidad</div>
             </div>
         </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="login-right-column">
        <div className="login-form-container">
          <h2>{isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p>{isLoginMode ? 'Ingresa tus credenciales para acceder.' : 'Ingresa tus datos para crear tu cuenta.'}</p>

          {/* Botones para cambiar entre Login y Registro */}
          <div className="form-toggle-buttons">
            <button
              className={`toggle-form-button ${isLoginMode ? 'active' : ''}`}
              onClick={() => { setIsLoginMode(true); setError(''); /* Limpiar campos opcional */ }}
              disabled={loading}
            >
              Iniciar Sesión
            </button>
            <button
              className={`toggle-form-button ${!isLoginMode ? 'active' : ''}`}
              onClick={() => { setIsLoginMode(false); setError(''); /* Limpiar campos opcional */ }}
              disabled={loading}
            >
              Regístrate
            </button>
          </div>

          <div className="divider">
            <span>O usa tu correo</span>
          </div>

          {/* Formulario (condicionalmente renderiza campos de registro) */}
          <form onSubmit={isLoginMode ? handleLogin : handleSignUp}>
            {!isLoginMode && (
              <div className="name-inputs">
                <div className="input-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Juan"
                    required={!isLoginMode}
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    required={!isLoginMode}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. juan.perez@correo.com"
                required
                disabled={loading}
              />
              {!isLoginMode && (
                <small className="email-hint">
                  Debe ser el mismo correo con el que adquirió Mi Legado.
                </small>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLoginMode ? 'Ingresa tu contraseña' : 'Crea una contraseña'}
                required
                disabled={loading}
              />
               {!isLoginMode && <small className="password-hint">Debe tener al menos 8 caracteres.</small>}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Procesando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>

            {!isLoginMode && (
              <p className="registration-note">
                Solo usuarios que hayan adquirido Mi Legado pueden registrarse. 
                Si tienes problemas, contacta a soporte.
              </p>
            )}
          </form>

          {/* Ya no necesitamos el toggle-mode de texto si usamos los botones superiores */}
          {/* <p className="toggle-mode">
            {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button onClick={toggleMode} className="toggle-button">
              {isLoginMode ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 