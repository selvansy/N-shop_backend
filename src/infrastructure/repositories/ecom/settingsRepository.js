import menuSettingModel from "../../models/chit/menuSettingModel.js";
import subMenuSettingModel from "../../models/chit/subMenuSettingModel.js";

class EcomSettingsRepository {
  async activeEcom(isEnable) {
    try {
      // Step 1️⃣ — Find all Ecom menu IDs
      const menuIds = await menuSettingModel
        .find({ isEcom: true }, { _id: 1 })
        .lean();

      const menuIdList = menuIds.map((m) => m._id);

      // Step 2️⃣ — Define submenu filter:
      // Either belongs to an Ecom menu OR is itself marked as Ecom
      const subMenuFilter = {
        $or: [
          { id_menu: { $in: menuIdList } },
          { isEcom: true },
        ],
      };

      // Step 3️⃣ — Run both updates in parallel
      const [menuResult, subMenuResult] = await Promise.all([
        menuSettingModel.updateMany(
          { _id: { $in: menuIdList } },
          { $set: { is_deleted: !isEnable } }
        ),
        subMenuSettingModel.updateMany(
          subMenuFilter,
          { $set: { is_deleted: !isEnable } }
        ),
      ]);

      // Step 4️⃣ — Return results
      return {
        updatedMenus: menuResult.modifiedCount,
        updatedSubMenus: subMenuResult.modifiedCount,
      };
    } catch (error) {
      throw new Error(`Ecom activation failed: ${error.message}`);
    }
  }
}

export default EcomSettingsRepository;
