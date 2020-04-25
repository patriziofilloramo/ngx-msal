const isIE =
  // tslint:disable-next-line: quotemark
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1;


export const environment = {
  production: true,
  isIE
};
