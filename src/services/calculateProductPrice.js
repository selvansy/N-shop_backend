export function calculateProductRate(
  totalPrice,
  makingCharge = 0,
  wastageCharge = 0,
  mcdiscountPercentage = 0,
  wsdiscountPercentage = 0
) {
  if (
    (makingCharge === undefined || makingCharge === 0) &&
    (wastageCharge === undefined || wastageCharge === 0) &&
    (mcdiscountPercentage === undefined || mcdiscountPercentage === 0) &&
    (wsdiscountPercentage === undefined || wsdiscountPercentage === 0)
  ) {
    return {
      oldProductPrice: totalPrice,
      newProductPrice: totalPrice,
      totalDiscountValue: 0,
      mcDiscountValue: 0,
      wsDiscountValue: 0,
    };
  }

  const oldProductPrice = totalPrice + makingCharge + wastageCharge;

  const mcDiscountValue = makingCharge * (mcdiscountPercentage / 100);
  const wsDiscountValue = wastageCharge * (wsdiscountPercentage / 100);

  const totalDiscountValue = mcDiscountValue + wsDiscountValue;

  const newCharges =
    (makingCharge - mcDiscountValue) + (wastageCharge - wsDiscountValue);

  const newProductPrice = totalPrice + newCharges;

  return {
    oldProductPrice,
    newProductPrice,
    totalDiscountValue,
    mcDiscountValue,
    wsDiscountValue,
  };
}
