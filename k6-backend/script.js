import http from 'k6/http';
import { check, sleep } from 'k6';

// Recibir configuraciones de k6 a través de variables de entorno (__ENV en k6)
export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 1,
  duration: __ENV.DURATION ? `${__ENV.DURATION}s` : '5s',
};

export default function () {
  // Configuración de URL objetivo
  const url = __ENV.TARGET_URL || 'http://test.k6.io';
  
  // Realizar petición GET
  const res = http.get(url);

  // Validación básica del status 200
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Pausa para simular la cadencia humana
  sleep(1);
}
