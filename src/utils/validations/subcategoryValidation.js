import Joi from 'joi';

class SubCategoryValidator {
  subCategoryValidations = Joi.object({
    categoryId: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Category ID is required",
        "string.empty": "Category ID cannot be empty",
        "string.base": "Category ID must be a string",
      }),

    name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "SubCategory Name is required",
        "string.empty": "SubCategory Name cannot be empty",
        "string.base": "SubCategory Name must be a string",
      }),

    description: Joi.string()
      .trim()
      .allow("")
      .optional()
      .messages({
        "string.base": "Description must be a string",
      }),

    bannerImage: Joi.string()
      .trim()
      .allow("")
      .optional()
      .messages({
        "string.base": "Banner image path must be a string",
      }),

    icon: Joi.string()
      .trim()
      .allow("")
      .optional()
      .messages({
        "string.base": "Icon path must be a string",
      }),

    active: Joi.boolean()
      .optional()
      .messages({
        "boolean.base": "Active must be true or false",
      }),
  });
}

export default SubCategoryValidator;
