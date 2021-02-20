import Joi from "joi";

export const validatorInputMakeOrder = Joi.array().items({
  name: Joi.string().trim(),
  quantity: Joi.number().greater(0),
});
