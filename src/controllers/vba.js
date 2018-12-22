/* eslint-disable no-underscore-dangle */
import vbaHelper from '../helpers/vba';
import VbaRequest from '../models/vba';
import logger from '../utils/logger';
import graylog from '../utils/logger/graylog';

// retrieve request
export async function get(req, res) {
  try {
    const { walletId } = req.params;
    const docs = await VbaRequest.find({ walletId }).exec().catch((err) => { logger.error(err); });
    if (docs && docs.length) return res.json({ vba: docs }).end();
    return res.status(404).json({ message: 'Not found' }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'GET',
      walletId: req.params.walletId,
    });
    return res.status(500).send(error.stack).end();
  }
}

// update request
export async function put(req, res) {
  try {
    const vbaRequests = vbaHelper.resolveVbaRequests(req);
    const errors = vbaHelper.validateRequests(vbaRequests);

    if (errors.length) {
      // log if failed
      graylog.error('Invalid VBA request', JSON.stringify(errors), {
        reqType: 'UPDATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
      return res.status(400).json({ message: 'Invalid request', errors }).end();
    }
    let totalAffected = 0;
    const failedCountries = [];

    await Promise.all(vbaRequests.map(async (_vr) => {
      let vr = {};
      vr = Object.assign(vr, _vr._doc);
      // eslint-disable-next-line no-underscore-dangle
      delete vr._id;
      // change status to pending
      vr.status = 'PENDING';
      const { walletId, country } = vr;
      // update request with status not equals to APPROVED
      const affectedDoc = await VbaRequest.findOneAndUpdate({ walletId, country, status: { $ne: 'APPROVED' } }, { $set: vr }, { new: true });
      if (affectedDoc) totalAffected += 1;
      else failedCountries.push(vr.country);
    }));

    // 406 for no content updated
    const httpStatus = totalAffected > 0 ? 200 : 406;
    let message = totalAffected > 0 ? `update ${totalAffected} VBA's request${totalAffected > 1 ? 's' : ''} successfully` : 'No VBA\'s request updated';
    message += failedCountries.length ? `. ${failedCountries.length > 1 ? 'Countries' : 'Country'} ${failedCountries.join(', ')} not found or APPROVED.` : '';

    // log if failed
    if (failedCountries.length) {
      graylog.error(message, {
        reqType: 'UPDATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
    }

    return res.status(httpStatus).json({ message }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'UPDATE',
      walletId: req.params.walletId,
      vbaRequested: JSON.stringify(req.body.vba),
    });
    return res.status(500).send(error.stack).end();
  }
}

// create request
export async function post(req, res) {
  try {
    const vbaRequests = vbaHelper.resolveVbaRequests(req);
    const errors = vbaHelper.validateRequests(vbaRequests);

    if (errors.length) {
      // log if failed
      graylog.error('Invalid VBA request', JSON.stringify(errors), {
        reqType: 'CREATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
      return res.status(400).json({ message: 'Invalid request', errors }).end();
    }

    const dupCountries = [];
    let totalAffected = 0;
    // insert if no error
    await Promise.all(vbaRequests.map(async (vr) => {
      const affectedDoc = await vr.save().catch((err) => {
        // push duplicate country to report
        // 11000: mongo duplicate code
        if (err.code === 11000) dupCountries.push(vr.country);
        logger.error(err);
      });
      if (affectedDoc) totalAffected += 1;
    }));

    // 406 for no content updated
    const httpStatus = totalAffected > 0 ? 200 : 406;
    let message = totalAffected > 0 ? `create ${totalAffected} VBA's request${totalAffected > 1 ? 's' : ''} successfully` : 'No VBA\'s request created';
    message += dupCountries.length ? `. ${dupCountries.length > 1 ? 'Countries' : 'Country'} ${dupCountries.join(', ')} duplicated.` : '';

    // log if failed
    if (dupCountries.length) {
      graylog.error(message, {
        reqType: 'CREATE',
        walletId: req.params.walletId,
        vbaRequested: JSON.stringify(req.body.vba),
      });
    }

    return res.status(httpStatus).json({ message }).end();
  } catch (error) {
    graylog.critical(error.message, error.stack, {
      reqType: 'CREATE',
      walletId: req.params.walletId,
      vbaRequested: JSON.stringify(req.body.vba),
    });
    return res.status(500).send(error.stack).end();
  }
}
