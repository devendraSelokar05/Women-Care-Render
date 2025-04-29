const express =  require('express')
const {getPaymentHistory,viewPaymentByDeliveryBoy, getPaymentStatus} =  require('../../controllers/branchAdmin-Controllers/branchPaymentHistoryController')

const router = express.Router()

router.get('/payment-history', getPaymentHistory)
router.get('/payment-history/:deliveryBoyId', viewPaymentByDeliveryBoy)
router.get('/payment-status', getPaymentStatus);

module.exports = router