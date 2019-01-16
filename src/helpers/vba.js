import VbaRequest from '../models/vba';

// resolve countries in request
function resolveVbaRequests(req) {
  const { walletId } = req.params;
  const { sessionId } = req.body;
  const postVba = req.body.vba;
  const countries = postVba.countries && Array.isArray(postVba.countries) ? Array.from(new Set(postVba.countries)) : ['US'];
  const requests = [];
  // create request for each country
  countries.forEach((country) => {
    const vbaRequest = new VbaRequest({
      sessionId, walletId, country, ...postVba,
    });
    requests.push(vbaRequest);
  });
  return requests;
}

function validateRequests(requests) {
  let errors = [];

  requests.forEach((req) => {
    // validate before save
    const error = req.validateSync();
    if (error && error.errors) {
      // get error messages
      const reqErrors = Object.keys(error.errors).map((k) => {
        const e = error.errors[k];
        // friendly cast error
        // currently mongoose doesn't provide any methods to custom CastError message
        if (e.name === 'CastError') return `${e.path} must be ${e.kind}`;
        return e.message;
      });
      errors = errors.concat(reqErrors);
    }
  });

  return Array.from(new Set(errors));
}

export default {
  resolveVbaRequests: req => resolveVbaRequests(req),
  validateRequests: requests => validateRequests(requests),
};
