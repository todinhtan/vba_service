import { get, put, post } from '../controllers/vba';

module.exports = (api) => {
  api.route('/vba/:walletId').get(get);
  api.route('/vba/:walletId').put(put);
  api.route('/vba/:walletId').post(post);
};
