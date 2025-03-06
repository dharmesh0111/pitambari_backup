import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  // apiUrl : `http://192.168.0.107:2503`
  // apiUrl : `http://10.3.10.14:2502`
   apiUrl : `http://192.168.0.253:2502`
  // apiUrl : `http://192.168.0.147:2502` //with validate : machine 2
};
