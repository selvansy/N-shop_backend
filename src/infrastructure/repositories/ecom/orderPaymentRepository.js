import mongoose from "mongoose";
import orderPaymentModel from "../../models/ecom/orderPaymentModel.js";

class OrderPaymentRepository {
  async findPaymentData(id_scheme_account) {
    try {
      return await orderPaymentModel
        .findOne({
          id_scheme_account,
          active: true,
          payment_status: 1,
        })
        .sort({ _id: -1 })
        .limit(1)
        .populate({
          path: "id_scheme_account",
          select: "start_date",
        })
        .populate("payment_mode")
        .lean()
        .exec();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async lastPayment(schemeId) {
    try {
      return await orderPaymentModel
        .findOne({ id_scheme: schemeId })
        .sort({ payment_receipt: -1 })
        .select("payment_receipt")
        .lean();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async addPayment(data) {
    try {
      return await orderPaymentModel.create(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async countDocuments(schemeAccountId) {
    try {
      return await orderPaymentModel.countDocuments({
        active: true,
        payment_status: 1,
        id_scheme_account: schemeAccountId,
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findById(id) {
    try {
      return await orderPaymentModel
        .findById(id)
        .populate([
          { path: "id_scheme" },
          { path: "id_customer" },
          { path: "id_scheme_account" },
        ])
        .lean();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async paymentTable(query, skip, limit) {
    try {
      const documents = await orderPaymentModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate([
          {
            path: "id_scheme",
            select:
              "scheme_name amount min_amount max_amount min_weight max_weight scheme_type id_metal id_purity min_fund max_fund",
          },
          {
            path: "id_customer",
            select: "customer_name email mobile",
          },
          {
            path: "id_branch",
            select: "branch_name",
          },
          {
            path: "id_scheme_account",
            populate: {
              path: "id_classification",
              select: "classification_name",
            },
          },
          {
            path: "payment_mode",
            select: "mode_name",
          },
        ])
        .select("-__v")
        .lean()
        .exec();

      const totalCount = await orderPaymentModel.countDocuments(query);

      if (!documents?.length) return null;

      return { documents, totalCount };
    } catch (error) {
      console.error("Error in fetching payment table:", error);
      return null;
    }
  }

  async aggregate(filter) {
    try {
      return await orderPaymentModel.aggregate(filter);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async findOne(query) {
    try {
      return await orderPaymentModel
        .findOne(query)
        .sort({ date_payment: -1 })
        .lean()
        .exec();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async find(id) {
    try {
      return await orderPaymentModel
        .find({ id_scheme_account: id, active: true, payment_status: 1 })
        .sort("payment_receipt")
        .lean()
        .exec();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async findNew(query) {
    try {
      return await orderPaymentModel.find(query).lean().exec();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getPaymentsBySchemeId(query, skip, limit, isMobile) {
    try {
      let documents;
      if (isMobile) {
        documents = await orderPaymentModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .populate({
            path: "id_scheme_account",
            populate: {
              path: "id_scheme",
              select: ["scheme_name"],
            },
          })
          .select("-__v")
          .sort({ _id: -1 })
          .lean()
          .exec();
      } else {
        documents = await orderPaymentModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .populate("id_customer")
          .populate("id_scheme")
          .populate("id_scheme_account")
          .select("-__v")
          .sort({ _id: -1 })
          .lean()
          .exec();
      }

      if (!documents?.length) return null;

      const totalCount = await orderPaymentModel.countDocuments(query);

      return { documents, totalCount };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async totalInstallments(id) {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const result = await orderPaymentModel.aggregate([
        {
          $match: {
            id_scheme_account: objectId,
            active: true,
            payment_status: 1,
          },
        },
        {
          $group: {
            _id: null,
            totalPaidInstallments: { $sum: "$paid_installments" },
          },
        },
      ]);

      return result.length ? result[0].totalPaidInstallments : 0;
    } catch (error) {
      console.error("Error calculating paid installments:", error);
      return 0;
    }
  }

  async getMonthlyPayments(data) {
    try {
      const objectId = new mongoose.Types.ObjectId(data.id_scheme_account);
      const inputDate = new Date(data.date);

      const startOfMonth = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        inputDate.getFullYear(),
        inputDate.getMonth() + 1,
        1
      );

      const result = await orderPaymentModel.aggregate([
        {
          $match: {
            active: true,
            payment_status: 1,
            id_scheme_account: objectId,
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalPaidInstallments: { $sum: "$paid_installments" },
          },
        },
      ]);

      return result.length ? result[0].totalPaidInstallments : 0;
    } catch (error) {
      console.error("Error calculating monthly installments:", error);
      return 0;
    }
  }

  async bulkWrite(bulkOps) {
    try {
      return await orderPaymentModel.bulkWrite(bulkOps);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default OrderPaymentRepository;