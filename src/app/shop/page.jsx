"use client";
import ProductCard from '../../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const products = [
    {
      id: '1',
      name: 'Premium Oyster Mushrooms',
      price: 250,
      image: '/images/oyster-mushroom.png',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Pink Oyster Mushrooms',
      price: 280,
      image: '/images/pink-oyster-mushroom.png',
      isAvailable: true
    },
    {
      id: '3',
      name: 'King Oyster Mushrooms',
      price: 350,
      image: '/images/king-oyster-mushroom.png',
      isAvailable: false
    },
    {
      id: '4',
      name: 'Shiitake Mushrooms (Coming Soon)',
      price: 400,
      image: '/images/shiitake-mushroom.png',
      isAvailable: false
    }
  ];

  return (
    <div className="shop-page container">
      <div className="shop-header">
        <h1 className="shop-title">Our Harvest</h1>
        <p className="shop-description">Fresh, premium mushrooms delivered across Delhi NCR</p>
      </div>

      <div className="shop-grid">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
