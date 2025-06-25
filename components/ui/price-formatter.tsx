interface PriceFormatterProps {
  price: number | string;
}

export function PriceFormatter({ price }: PriceFormatterProps) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    return <span>Invalid price</span>;
  }
  if (numericPrice > 1) {
    return <span>{numericPrice.toFixed(2)}</span>;
  }

  const formattedPrice = numericPrice.toFixed(5).replace(/\.?0+$/, '');

  return <span>{formattedPrice}</span>;
};

export function formatPrice(price: number): string {
  if (isNaN(price)) {
    return 'Invalid price';
  }
  
  if (price > 1) {
    return price.toFixed(2);
  }
  
  return price.toFixed(5).replace(/\.?0+$/, '');
}
