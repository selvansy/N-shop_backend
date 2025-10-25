import OrderTransactionDetails from '../../models/ecom/orderTransactionDetailsModel.js'

class OrderTransactionDetailsRepository{
    async addTransactionDetails(data){
        try {
            const savedData = OrderTransactionDetails.create(data)

            if(!savedData){
                return null
            }

            return savedData;
        } catch (error) {
            console.error(error)
        }
    }

}

export default OrderTransactionDetailsRepository;