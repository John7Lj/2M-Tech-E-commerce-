import express from 'express';
import {
    getDefaultCurrency
} from '../controllers/currency.controller';

const router = express.Router();

// Client currency routes
router.get('/default', getDefaultCurrency);

export default router;
