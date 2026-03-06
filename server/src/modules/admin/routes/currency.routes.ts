import express from 'express';
import {
    createCurrency,
    deleteCurrency,
    getAllCurrencies,
    setDefaultCurrency
} from '../controllers/currency.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin currency routes are protected
router.use(authenticateUser, adminOnly);

router.get('/', getAllCurrencies);
router.post('/new', createCurrency);
router.patch('/default/:currencyId', setDefaultCurrency);
router.delete('/:currencyId', deleteCurrency);

export default router;
