import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import './LoginPage.css'; // Corregir ruta a relativa

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Ya no necesitamos setUser aquí, AuthContext lo maneja
  // const authContext = useAuth();
  // const setUser = authContext.setUser;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Ya no es necesario llamar a setUser manualmente aquí
      navigate('/'); // Redirigir a home después del login (AuthContext se encargará del estado)
    } catch (err) {
      setError(err.message);
      console.error("Failed to log in", err);
      // More specific error handling
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo electrónico o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
    }
    if (!firstName || !lastName) {
        setError('Nombre y Apellido son requeridos.');
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Ya no es necesario llamar a setUser manualmente aquí
      // AuthContext se actualizará automáticamente via onAuthStateChanged

      setIsLoginMode(true); // Cambiar a modo login después del registro exitoso
      alert('¡Registro exitoso! Por favor, inicia sesión.');
      // Limpiar campos después del registro
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      setError(err.message);
      console.error("Failed to sign up", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso.');
      } else {
        setError('Error al registrarse. Por favor, inténtalo de nuevo.');
      }
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
             <div className="logo-placeholder">GSR</div> {/* Placeholder para Logo */}
             <h2>Comienza con Nosotros</h2>
             <p>Completa estos sencillos pasos para unirte a nuestra comunidad.</p>
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
            >
              Iniciar Sesión
            </button>
            <button
              className={`toggle-form-button ${!isLoginMode ? 'active' : ''}`}
              onClick={() => { setIsLoginMode(false); setError(''); /* Limpiar campos opcional */ }}
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
              />
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
              />
               {!isLoginMode && <small className="password-hint">Debe tener al menos 8 caracteres.</small>}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-button">
              {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
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