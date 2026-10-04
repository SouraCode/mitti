export function activeOffer(offers, now = new Date()) {
  return offers.find(
    (o) => o.enabled && (!o.startsAt || o.startsAt <= now) && (!o.endsAt || o.endsAt > now)
  );
}
export function effectivePrice(product, offers = []) {
  const offer = activeOffer(offers);
  if (!offer) return { price: product.regularPrice, offer: null };
  const raw =
    offer.type === 'percentage'
      ? product.regularPrice * (1 - offer.value / 100)
      : product.regularPrice - offer.value;
  return {
    price: Math.max(0, Number(raw.toFixed(2))),
    offer: { type: offer.type, value: offer.value, endsAt: offer.endsAt },
  };
}
