
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 20, duration: '1m',
  thresholds: {
    //Perfomance SLO
    'http_req_duration{name: cart}': ['p(95)<4',],
    //Reliability SLO
    'http_req_failed{name:pay}': ['rate<0.08'],
    //Availability SLO
    'checks': ['rate>0.95'],
  }
}

export default function () {
  const base = 'http://localhost:3000';
  const c = http.post(`${base}/cart/add`, null, { tags: { name: 'cart' } });
  const r = http.get(`${base}/report`, { tags: { name: 'report' } });
  const p = http.post(`${base}/pay`, null, { tags: { name: 'pay' } });
  check(c, { 'cart 200': (x) => x.status === 200 });
  check(r, { 'report 200': (x) => x.status === 200 });
  check(p, { 'pay 200': (x) => x.status === 200 });
  sleep(1);
}
