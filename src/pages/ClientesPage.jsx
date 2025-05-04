import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin } from '../utils/authUtils';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [csvClientes, setCsvClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(true);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'registered', 'unregistered'
  const [error, setError] = useState(null);
  const { currentUser, isAdmin } = useAuth();
  const [adminStatus, setAdminStatus] = useState(false);
  
  // Estado para el modal de agregar usuario
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    country: '',
    password: '',
    isAdmin: false
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        try {
          const admin = await isUserAdmin(currentUser.uid);
          console.log("Verificación de admin desde ClientesPage:", admin);
          setAdminStatus(admin);
        } catch (err) {
          console.error("Error al verificar admin en ClientesPage:", err);
          setError("Error al verificar permisos de administrador");
        }
      }
    };
    
    checkAdmin();
  }, [currentUser]);

  // Cargar datos del CSV
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        console.log("Intentando cargar el archivo CSV...");
        setCsvLoading(true);
        
        // Intentar una ruta absoluta desde la base del sitio
        let url = window.location.origin + '/clientes.csv';
        console.log("URL del CSV:", url);
        
        let response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/csv',
            'Cache-Control': 'no-cache'
          },
        });
        
        // Si falla, intentar con el archivo de prueba
        if (!response.ok) {
          console.warn('Error al cargar el archivo CSV principal, intentando con archivo de prueba');
          url = window.location.origin + '/test-clientes.csv';
          console.log("URL del CSV de prueba:", url);
          
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'text/csv',
              'Cache-Control': 'no-cache'
            },
          });
          
          if (!response.ok) {
            console.error('Error al cargar el archivo CSV de prueba:', response.statusText);
            setError(`Error al cargar archivos CSV: ${response.status} ${response.statusText}`);
            return;
          }
        }
        
        console.log("Archivo CSV recuperado, procesando datos...");
        const csvData = await response.text();
        
        // Añadir log para ver las primeras líneas del CSV
        console.log("Primeras líneas del CSV:", csvData.split('\n').slice(0, 3));
        
        const parsed = parseCSV(csvData);
        console.log("CSV parseado, cantidad de registros:", parsed.length);
        setCsvClientes(parsed);
      } catch (error) {
        console.error('Error al cargar datos del CSV:', error);
        setError(`Error al cargar datos del CSV: ${error.message}`);
      } finally {
        setCsvLoading(false);
        // Solo completamos la carga si ambas operaciones han terminado
        if (!firestoreLoading) setLoading(false);
      }
    };

    loadCsvData();
  }, []);

  // Función para parsear CSV - simplificada y enfocada en los datos necesarios
  const parseCSV = (csvString) => {
    if (!csvString || typeof csvString !== 'string') {
      console.error('El CSV no es válido:', csvString);
      return [];
    }
    
    const lines = csvString.split('\n');
    if (lines.length === 0) {
      console.error('El CSV está vacío');
      return [];
    }
    
    // Saltar la primera línea (encabezados) y procesar cada línea
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const cols = line.split(',');
        
        // Extraer los datos relevantes usando los índices correctos
        return {
          Name: cols[3] || '', // Nombre
          Email: cols[2] || '', // Email
          Card_Address_Country: cols[12] || '', // País
          'Created (UTC)': cols[4] || '', // Fecha
          TotalSpend: cols[28] || '' // Monto
        };
      });
  };

  // Cargar usuarios registrados desde Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      // Verificamos tanto el estado global como el local
      if (!isAdmin && !adminStatus) {
        console.log("Usuario no es admin, no cargando datos de Firestore");
        setFirestoreLoading(false);
        return;
      }
      
      try {
        console.log("Intentando cargar usuarios desde Firestore...");
        setFirestoreLoading(true);
        
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(usersQuery);
        
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        console.log("Usuarios cargados de Firestore:", usersData.length);
        setClientes(usersData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError(`Error al cargar usuarios: ${error.message}`);
      } finally {
        setFirestoreLoading(false);
        // Solo completamos la carga si ambas operaciones han terminado
        if (!csvLoading) setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, adminStatus]);

  // Combinar datos de usuarios registrados y del CSV
  const getClientesList = () => {
    // Verificamos que tengamos datos
    if (csvClientes.length === 0 && clientes.length === 0) {
      console.log("No hay datos para mostrar");
      return [];
    }
    
    // Crear un mapa de emails registrados
    const registeredEmails = new Map();
    clientes.forEach(cliente => {
      if (cliente.email) {
        registeredEmails.set(cliente.email.toLowerCase(), cliente);
      }
    });

    console.log("Emails registrados:", registeredEmails.size);
    
    // Log para depuración - examinar primeras 3 entradas del CSV
    console.log("Primeras entradas CSV:", csvClientes.slice(0, 3));

    // Combinar con datos del CSV
    const combinedList = csvClientes.map(csvCliente => {
      const email = csvCliente.Email ? csvCliente.Email.toLowerCase() : '';
      const isRegistered = email ? registeredEmails.has(email) : false;
      const userData = isRegistered ? registeredEmails.get(email) : null;
      
      // Si el usuario está registrado, eliminarlo del mapa para no duplicarlo
      if (isRegistered) {
        registeredEmails.delete(email);
      }
      
      return {
        ...csvCliente,
        registrado: isRegistered,
        userData,
      };
    });

    // Log para depuración
    console.log("Primera entrada combinada:", combinedList[0]);
    
    // Añadir usuarios que están en Firestore pero no en el CSV
    const manualUsers = [];
    registeredEmails.forEach((userData, email) => {
      manualUsers.push({
        Name: userData.displayName || '',
        Email: email,
        Card_Address_Country: userData.country || '',
        'Created (UTC)': userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : '',
        TotalSpend: 'Usuario Manual',
        registrado: true,
        userData,
        manuallyAdded: true
      });
    });
    
    console.log("Usuarios manuales agregados:", manualUsers.length);
    
    // Unir las listas
    const fullList = [...combinedList, ...manualUsers];
    
    // Aplicar filtros
    let filteredList = fullList;
    
    if (filter === 'registered') {
      filteredList = fullList.filter(cliente => cliente.registrado);
    } else if (filter === 'unregistered') {
      filteredList = fullList.filter(cliente => !cliente.registrado);
    }

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredList = filteredList.filter(cliente => 
        (cliente.Email && cliente.Email.toLowerCase().includes(term)) ||
        (cliente.Name && cliente.Name.toLowerCase().includes(term))
      );
    }

    return filteredList;
  };

  const clientesList = getClientesList();

  // Renderizar "Estado" con colores
  const renderStatus = (isRegistered) => {
    if (isRegistered) {
      return <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Registrado</span>;
    }
    return <span style={{ color: '#FFC107' }}>No registrado</span>;
  };

  // Función para recargar los datos
  const reloadData = () => {
    setLoading(true);
    setCsvLoading(true);
    setFirestoreLoading(true);
    setError(null);
    
    console.log("Iniciando recarga de datos...");
    
    // Cargar datos del CSV
    const loadCsvData = async () => {
      try {
        // Intentar con el archivo principal
        let url = window.location.origin + '/clientes.csv';
        console.log("Recargando CSV desde:", url);
        
        let response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/csv',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
        });
        
        // Si falla, intentar con el archivo de prueba
        if (!response.ok) {
          console.warn('Error al recargar el archivo CSV principal, intentando con archivo de prueba');
          url = window.location.origin + '/test-clientes.csv';
          console.log("URL del CSV de prueba:", url);
          
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'text/csv',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
          });
          
          if (!response.ok) {
            throw new Error(`No se pudo cargar ningún archivo CSV. Último error: ${response.status} ${response.statusText}`);
          }
        }
        
        const csvData = await response.text();
        const parsed = parseCSV(csvData);
        console.log("CSV recargado con éxito, registros:", parsed.length);
        setCsvClientes(parsed);
      } catch (error) {
        console.error('Error al recargar CSV:', error);
        setError(`Error al recargar CSV: ${error.message}`);
      } finally {
        setCsvLoading(false);
        if (!firestoreLoading) setLoading(false);
      }
    };
    
    // Cargar usuarios de Firestore
    const fetchUsers = async () => {
      if (!isAdmin && !adminStatus) {
        console.log("Usuario no es admin, no recargando datos de Firestore");
        setFirestoreLoading(false);
        if (!csvLoading) setLoading(false);
        return;
      }
      
      try {
        console.log("Recargando usuarios desde Firestore...");
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(usersQuery);
        
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        console.log("Usuarios recargados de Firestore:", usersData.length);
        
        // Imprimir los primeros usuarios para depuración
        if (usersData.length > 0) {
          console.log("Muestra de usuarios:", usersData.slice(0, 3));
        }
        
        setClientes(usersData);
      } catch (error) {
        console.error('Error al recargar usuarios:', error);
        setError(`Error al recargar usuarios: ${error.message}`);
      } finally {
        setFirestoreLoading(false);
        if (!csvLoading) setLoading(false);
      }
    };
    
    // Ejecutar ambas operaciones de carga
    loadCsvData();
    fetchUsers();
  };

  // Función para agregar un nuevo usuario
  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError(null);
    
    try {
      console.log("Intentando crear usuario:", newUser);
      
      // Validaciones básicas
      if (!newUser.email || !newUser.name || !newUser.password) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }
      
      if (newUser.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Verificar si el email ya existe en Firestore
      console.log("Verificando si el email ya existe:", newUser.email);
      const userQuery = query(collection(db, 'users'), where('email', '==', newUser.email.toLowerCase()));
      const snapshot = await getDocs(userQuery);
      
      if (!snapshot.empty) {
        throw new Error('Este correo electrónico ya está registrado');
      }
      
      // Crear un ID único para el usuario
      const userId = `manual_${Date.now()}`;
      console.log("ID generado para el usuario:", userId);
      
      // Preparar datos del usuario
      const userData = {
        email: newUser.email.toLowerCase(),
        displayName: newUser.name,
        country: newUser.country || '',
        admin: newUser.isAdmin,
        manuallyCreated: true,
        createdAt: serverTimestamp(),
        password: newUser.password // Nota: en un entorno real, NO guardar contraseñas en texto plano
      };
      
      console.log("Datos del usuario a guardar:", userData);
      
      // Guardar el usuario en Firestore
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, userData);
        console.log("Usuario guardado exitosamente con ID:", userId);
      } catch (firestoreError) {
        console.error("Error específico de Firestore:", firestoreError);
        throw new Error(`Error al guardar en la base de datos: ${firestoreError.message}`);
      }
      
      // Verificar que se haya guardado correctamente
      try {
        const docSnap = await getDocs(query(collection(db, 'users'), where('email', '==', newUser.email.toLowerCase())));
        console.log("Verificación post-guardado:", !docSnap.empty ? "Usuario encontrado" : "Usuario NO encontrado");
      } catch (verifyError) {
        console.warn("Error al verificar el guardado:", verifyError);
      }
      
      // Cerrar el modal y actualizar la lista
      setShowModal(false);
      
      // Limpiar el formulario
      setNewUser({
        email: '',
        name: '',
        country: '',
        password: '',
        isAdmin: false
      });
      
      // Recargar datos
      console.log("Recargando datos después de agregar usuario...");
      reloadData();
      
      alert('Usuario creado correctamente');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setSaveError(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#D7B615' }}>Gestión de Clientes</h1>
        <div style={{ color: '#e74c3c', padding: '20px', backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px' }}>
          <p><strong>Error:</strong> {error}</p>
          <p>Por favor, intenta recargar la página o contacta al administrador del sistema.</p>
          <button 
            onClick={reloadData}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar Carga de Datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#D7B615', margin: 0 }}>Gestión de Clientes</h1>
        <div>
          {(adminStatus || isAdmin) && (
            <button 
              onClick={() => setShowModal(true)}
              style={{
                marginRight: '10px',
                padding: '8px 15px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>+</span> Agregar Usuario
            </button>
          )}
          <button 
            onClick={() => {
              // Mostrar información para depuración
              console.log("CSV Clientes:", csvClientes.slice(0, 5));
              console.log("Clientes combinados:", clientesList.slice(0, 5));
              alert("Información de depuración mostrada en consola");
            }}
            style={{
              marginRight: '10px',
              padding: '8px 15px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Depurar
          </button>
          <button 
            onClick={reloadData}
            style={{
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            disabled={loading}
          >
            <span style={{ fontWeight: 'bold' }}>↻</span> Recargar Datos
          </button>
        </div>
      </div>
      
      {!adminStatus && !isAdmin && (
        <div style={{ color: '#e74c3c', padding: '20px', backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>Aviso:</strong> No tienes permisos de administrador para ver esta página.</p>
        </div>
      )}
      
      {/* Modal para agregar usuario */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: '#1f1f1f',
            borderRadius: '8px',
            padding: '20px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#D7B615' }}>Agregar Nuevo Usuario</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#aaa'
                }}
              >
                &times;
              </button>
            </div>
            
            {saveError && (
              <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                backgroundColor: 'rgba(231, 76, 60, 0.1)', 
                color: '#e74c3c',
                borderRadius: '4px' 
              }}>
                <p style={{ margin: 0 }}><strong>Error:</strong> {saveError}</p>
              </div>
            )}
            
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
                  País (código de 2 letras)
                </label>
                <input
                  type="text"
                  value={newUser.country}
                  onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                  maxLength="2"
                  placeholder="Ej: ES, MX, CO, PE"
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                  required
                  minLength="6"
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: '#ccc', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                    style={{ marginRight: '10px' }}
                  />
                  Otorgar permisos de administrador
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  disabled={saveLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#333',
              color: '#fff'
            }}
          />
        </div>
        
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#333',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todos los clientes</option>
            <option value="registered">Solo registrados</option>
            <option value="unregistered">No registrados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando datos de clientes...</p>
          <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
            {csvLoading ? 'Cargando archivo CSV... ' : 'Archivo CSV cargado. '}
            {firestoreLoading ? 'Cargando usuarios... ' : 'Usuarios cargados.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <p>Mostrando {clientesList.length} de {csvClientes.length} clientes</p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: '#1f1f1f',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#333', color: '#D7B615', borderBottom: '2px solid #D7B615' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#333', color: '#D7B615', borderBottom: '2px solid #D7B615' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#333', color: '#D7B615', borderBottom: '2px solid #D7B615' }}>País</th>
                  <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#333', color: '#D7B615', borderBottom: '2px solid #D7B615' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#333', color: '#D7B615', borderBottom: '2px solid #D7B615' }}>Fecha de Compra</th>
                </tr>
              </thead>
              <tbody>
                {clientesList.length > 0 ? (
                  clientesList.map((cliente, index) => {
                    // Log para inspeccionar cada cliente
                    if (index < 2) console.log(`Cliente ${index}:`, cliente);
                    
                    // Estilo especial para usuarios agregados manualmente
                    const rowStyle = {
                      backgroundColor: cliente.manuallyAdded 
                        ? 'rgba(33, 150, 243, 0.1)' // Azul claro para usuarios manuales
                        : (index % 2 === 0 ? '#2a2a2a' : '#282828')
                    };
                    
                    return (
                    <tr key={index} style={{ ...rowStyle, borderLeft: cliente.manuallyAdded ? '3px solid #2196F3' : 'none' }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>
                        {cliente.Name || '-'}
                        {cliente.manuallyAdded && (
                          <span style={{ 
                            marginLeft: '5px', 
                            fontSize: '0.7em', 
                            backgroundColor: '#2196F3', 
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '3px'
                          }}>
                            Manual
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>
                        {cliente.Email || '-'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>
                        {cliente.Card_Address_Country || '-'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>
                        {renderStatus(cliente.registrado)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>
                        {cliente.TotalSpend || '-'}
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>
                      {csvClientes.length === 0 
                        ? 'No se pudo cargar el archivo CSV de clientes' 
                        : 'No se encontraron clientes con los filtros seleccionados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientesPage; 