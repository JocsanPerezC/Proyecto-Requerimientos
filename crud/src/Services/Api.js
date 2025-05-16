const API_URL = 'http://localhost:3001/api';

/**
 * Servicio centralizado para manejar todas las llamadas a la API
 */
const apiService = {
  /**
   * Inicia sesión de usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise} - Respuesta del servidor
   */
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar 
   * @returns {Promise} - Respuesta del servidor
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },

  /**
   * Crea un nuevo proyecto
   * @param {Object} projectData - Datos del proyecto a crear 
   * @returns {Promise} - Respuesta del servidor
   */
  createProject: async (projectData) => {
    try {
      const response = await fetch(`${API_URL}/projects/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },

  /**
   * Obtiene todos los proyectos
   * @returns {Promise} - Lista de proyectos
   */
  getProjects: async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },

 /**
   * Obtiene todos los proyectos
   * @returns {Promise} - Lista de proyectos
   */
  getProjects: async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },

  /**
   * Obtiene un proyecto específico por ID
   * @param {number} id - ID del proyecto
   * @returns {Promise} - Datos del proyecto
   */
  getProjectById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`);
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  },
  
  /**
   * Obtiene los proyectos de un usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Lista de proyectos del usuario
   */
  getUserProjects: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/projects/user/${userId}`);
      const data = await response.json();
      return { 
        success: response.ok, 
        data, 
        status: response.status 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        status: 500 
      };
    }
  }
};

export default apiService;