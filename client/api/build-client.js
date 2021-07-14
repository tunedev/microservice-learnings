import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // baseURL = http://SERVICENAME.NAMESPACE.svc.cluster.local
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // baseURL = ''
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
