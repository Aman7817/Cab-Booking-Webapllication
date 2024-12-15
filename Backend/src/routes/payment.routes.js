import {Router} from "express"

import { createPayment, getAllPayments , updatePayment, deletePayment, getUserPayments, getFailedPayments,getPaymentSummary, getPaymentDetails} from "../controllers/payment.controllers.js";


const router = Router();

// Route for creating a new payment
//router.post('/payments', createPayment);
router.route('/payments').post(createPayment)

// Route for fetching all payments
router.route('/getpayments').get( getAllPayments);

// Route for fetching a single payment by ID
router.get('/payments/:id', getPaymentDetails );

// Route for updating a payment by ID
router.put('/payments/:id', updatePayment);

// Route for deleting a payment by ID
router.delete('/payments/:id', deletePayment);


// Define the route to handle fetching payments by user ID
router.get('/payments/users/:userId', getUserPayments);

router.get('/users/:userId/payments', getFailedPayments );

router.get('/users/:userId/payments', getPaymentSummary);


export default router;
