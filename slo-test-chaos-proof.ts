import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Availability: хүсэлт серверт хүрч, хариу ирсэн үү
const availability = new Rate('availability');
// Reliability: хариу ирсэн бол зөв хариу байсан уу (зөвхөн /pay)
const reliabilityPay = new Rate('reliability_pay');

// status 0 = connection refused/timeout, 502/503/504 = proxy-ийн "сервер байхгүй"
// @ts-ignore
const responded = (res) =>
  res.status !== 0 && ![502, 503, 504].includes(res.status);

export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    // Performance SLO
    'http_req_duration{name:cart}': ['p(95)<4'],
    'http_req_duration{name:report}': ['p(95)<400'],
    // Reliability SLO (error rate < 8% буюу амжилт > 92%)
    reliability_pay: ['rate>0.92'],
    // Availability SLO
    availability: ['rate>0.90'],
  },
};

export default function () {
  const base = 'http://localhost:3000';

  const c = http.post(`${base}/cart/add`, null, { tags: { name: 'cart' } });
  const r = http.get(`${base}/report`, { tags: { name: 'report' } });
  const p = http.post(`${base}/pay`, null, { tags: { name: 'pay' } });

  // Availability: 3 endpoint бүрээр
  availability.add(responded(c));
  availability.add(responded(r));
  availability.add(responded(p));

  // Reliability: зөвхөн хариу ирсэн /pay хүсэлтийг тооцно
  if (responded(p)) {
    reliabilityPay.add(p.status < 500);
  }

  // Дэлгэцэнд харагдах check (threshold-д ашиглахгүй)
  check(c, { 'cart 200': (x) => x.status === 200 });
  check(r, { 'report 200': (x) => x.status === 200 });
  check(p, { 'pay 200': (x) => x.status === 200 });

  sleep(1);
}
