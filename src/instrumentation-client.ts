import { initBotId } from 'botid/client/core';

// Configurar protección de BotId para las rutas de autenticación
// Las Server Actions en Next.js usan rutas especiales que comienzan con /
initBotId({
  protect: [
    {
      // Proteger todas las Server Actions en las páginas de login y register
      path: '/login',
      method: 'POST',
    },
    {
      path: '/register',
      method: 'POST',
    },
  ],
  developmentOptions: {
    // En desarrollo, siempre permitir (para testing)
    bypass: true,
  },
});
