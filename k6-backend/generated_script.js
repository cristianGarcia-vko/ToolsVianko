
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '12s',
};

const BASE_URL = 'http://localhost:3001';

export default function () {
    let res;
    let url;
    let payload;
    let params = { headers: { 'Content-Type': 'application/json' } };

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/health';
    res = http.get(url, params);
    check(res, { '/health responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/usuario/1';
    res = http.get(url, params);
    check(res, { '/usuario/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/usuario/1';
    res = http.del(url, null, params);
    check(res, { '/usuario/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/movimientos/excel';
    res = http.get(url, params);
    check(res, { '/movimientos/excel responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/locomotoras/excel';
    res = http.get(url, params);
    check(res, { '/locomotoras/excel responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresas/excel';
    res = http.get(url, params);
    check(res, { '/empresas/excel responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/bonos/excel';
    res = http.get(url, params);
    check(res, { '/bonos/excel responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/movimientos/pdf';
    res = http.get(url, params);
    check(res, { '/movimientos/pdf responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/admin/pdf';
    res = http.get(url, params);
    check(res, { '/admin/pdf responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/locomotoras/pdf';
    res = http.get(url, params);
    check(res, { '/locomotoras/pdf responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresas/pdf';
    res = http.get(url, params);
    check(res, { '/empresas/pdf responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/bonos/pdf';
    res = http.get(url, params);
    check(res, { '/bonos/pdf responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/ultima';
    res = http.get(url, params);
    check(res, { '/ultima responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/meta';
    res = http.get(url, params);
    check(res, { '/meta responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/assets/banner-asset.svg';
    res = http.get(url, params);
    check(res, { '/assets/banner-asset.svg responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/assets/1';
    res = http.get(url, params);
    check(res, { '/assets/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/lite';
    res = http.get(url, params);
    check(res, { '/lite responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/imagen';
    res = http.get(url, params);
    check(res, { '/imagen responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/imagen/1(*)';
    res = http.get(url, params);
    check(res, { '/imagen/1(*) responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/1/verificacion';
    res = http.get(url, params);
    check(res, { '/1/verificacion responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/1';
    res = http.get(url, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/1/cerrar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/1/cerrar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/1/continuar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/1/continuar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/cerrar-vencidos';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/cerrar-vencidos responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/1/resuelto';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/1/resuelto responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/lite';
    res = http.get(url, params);
    check(res, { '/lite responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/buscar';
    res = http.get(url, params);
    check(res, { '/buscar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/1';
    res = http.get(url, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/servicios/pendientes';
    res = http.get(url, params);
    check(res, { '/servicios/pendientes responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/servicios/1/estado';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/servicios/1/estado responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/buscar';
    res = http.get(url, params);
    check(res, { '/buscar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/all';
    res = http.get(url, params);
    check(res, { '/all responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/pendientes';
    res = http.get(url, params);
    check(res, { '/pendientes responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresa/1/pendientes';
    res = http.get(url, params);
    check(res, { '/empresa/1/pendientes responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/servicios/espera';
    res = http.get(url, params);
    check(res, { '/servicios/espera responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/servicios/1/solicitar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/servicios/1/solicitar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresa/1';
    res = http.get(url, params);
    check(res, { '/empresa/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresa/1/localidad/1';
    res = http.get(url, params);
    check(res, { '/empresa/1/localidad/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/empresa/1/localidad/1/pendientes';
    res = http.get(url, params);
    check(res, { '/empresa/1/localidad/1/pendientes responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/pendientes';
    res = http.get(url, params);
    check(res, { '/localidad/1/pendientes responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/all';
    res = http.get(url, params);
    check(res, { '/localidad/1/all responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/empresa/1';
    res = http.get(url, params);
    check(res, { '/localidad/1/empresa/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/ronda/1/info';
    res = http.get(url, params);
    check(res, { '/ronda/1/info responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/cancelar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/cancelar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/prioridad';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/prioridad responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/1/edicion';
    res = http.get(url, params);
    check(res, { '/1/edicion responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/iniciar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/iniciar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/pausar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/pausar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/reanudar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/reanudar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/edicion';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/edicion responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/finalizar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/finalizar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/movimiento/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/movimiento/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1';
    res = http.get(url, params);
    check(res, { '/localidad/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/estado/1';
    res = http.get(url, params);
    check(res, { '/localidad/1/estado/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/siguiente';
    res = http.get(url, params);
    check(res, { '/localidad/1/siguiente responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/siguiente-inteligente';
    res = http.get(url, params);
    check(res, { '/localidad/1/siguiente-inteligente responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/intercambiar-movimientos';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/intercambiar-movimientos responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/intercambiar-movimiento';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/intercambiar-movimiento responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/1/info';
    res = http.get(url, params);
    check(res, { '/1/info responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PATCH
    url = BASE_URL + '/1/concluir';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.patch(url, payload, params);
    check(res, { '/1/concluir responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/login';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/login responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/secciones';
    res = http.get(url, params);
    check(res, { '/secciones responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/secciones/via/1';
    res = http.get(url, params);
    check(res, { '/secciones/via/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/secciones/via/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/secciones/via/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/secciones/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/secciones/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/secciones/1';
    res = http.del(url, null, params);
    check(res, { '/secciones/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/secciones/via/1/asignar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/secciones/via/1/asignar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/secciones/via/1/liberar';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/secciones/via/1/liberar responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/secciones/via/1/liberar-todas';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/secciones/via/1/liberar-todas responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/lite';
    res = http.get(url, params);
    check(res, { '/lite responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: POST
    url = BASE_URL + '/';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.post(url, payload, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1';
    res = http.get(url, params);
    check(res, { '/localidad/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/localidad/1/lite';
    res = http.get(url, params);
    check(res, { '/localidad/1/lite responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: PUT
    url = BASE_URL + '/1';
    payload = JSON.stringify({"ejemplo":"reemplazar_con_datos_reales"});
    res = http.put(url, payload, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: DELETE
    url = BASE_URL + '/1';
    res = http.del(url, null, params);
    check(res, { '/1 responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    // Method: GET
    url = BASE_URL + '/';
    res = http.get(url, params);
    check(res, { '/ responds with ok target': (r) => r.status >= 200 && r.status < 500 });

    sleep(1);
}
