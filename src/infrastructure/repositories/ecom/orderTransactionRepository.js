import orderTransactionModel from "../../models/ecom/orderTransactionModel.js";

class OrderTransactionRepository{
    async addTransaction(data){
        try {
            const savedTransaction = orderTransactionModel.create(data);

            if(!savedTransaction){
                return null
            }

            return savedTransaction;
        } catch (error) {
            console.error(error)
        }
    }
}

export default OrderTransactionRepository;