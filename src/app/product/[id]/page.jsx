"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { ChevronLeft } from 'lucide-react';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  // Dummy product data. In a real app this would be fetched based on the "id" param.
  const products = [
    {
      id: '1',
      name: 'Premium Oyster Mushrooms',
      price: 250,
      image: '/images/oyster-mushroom.png',
      isAvailable: true,
      description: 'Hand-picked, premium quality grey oyster mushrooms grown in environmentally controlled conditions for perfect texture and flavor.',
      advantages: [
        'Rich in protein and fiber',
        'Contains antioxidants and essential vitamins',
        'Meaty texture, perfect for vegetarian dishes',
        'Grown sustainably with zero pesticides'
      ],
      healthDisclaimer: 'Individuals with severe mushroom allergies should consult a physician before consumption. Always cook mushrooms thoroughly.',
      recipes: [
        { title: 'Garlic Butter Sauté', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80' },
        { title: 'Oyster Mushroom Stir-Fry', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80' }
      ]
    },
    {
      id: '2',
      name: 'Pink Oyster Mushrooms',
      price: 280,
      image: '/images/pink-oyster-mushroom.png',
      isAvailable: true,
      description: 'Vibrant, tropical pink oyster mushrooms with a slightly woody aroma and a delicate seafood-like flavor profile.',
      advantages: [
        'High in B vitamins and minerals',
        'Adds vibrant color to culinary creations',
        'Delicate, unique flavor compared to standard varieties'
      ],
      healthDisclaimer: 'Cook thoroughly; pink oysters can be slightly tough if undercooked. If you have extreme sensitivities, consult a physician.',
      recipes: [
        { title: 'Pink Mushroom Risotto', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=500&q=80' }
      ]
    },
    {
      id: '3',
      name: 'King Oyster Mushrooms',
      price: 350,
      image: '/images/king-oyster-mushroom.png',
      isAvailable: false,
      description: 'The largest of the oyster mushroom genus, known for its thick, meaty stem and incredible umami flavor.',
      advantages: [
        'Incredible substitute for meat or scallops',
        'Excellent shelf life',
        'High protein content and distinct crunch'
      ],
      healthDisclaimer: 'Safe for most populations, but as always, individuals with fungal sensitivities should exercise caution.',
      recipes: [
        { title: 'Vegan Scallops', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80' }
      ]
    },
    {
      id: '4',
      name: 'Shiitake Mushrooms (Coming Soon)',
      price: 400,
      image: '/images/shiitake-mushroom.png',
      isAvailable: false,
      description: 'Rich, earthy shiitake mushrooms loved around the world for their robust flavor and health benefits.',
      advantages: [
        'Boosts immune system functionality',
        'Incredible depth of umami flavor',
        'Great for broths and slow cooking'
      ],
      healthDisclaimer: 'Some individuals may experience "shiitake dermatitis" if the mushrooms are consumed raw or undercooked. Always cook completely.',
      recipes: [
        { title: 'Rich Shiitake Broth', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80' }
      ]
    }
  ];

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="product-details-container not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => router.push('/shop')} className="btn btn-primary mt-4">Return to Shop</button>
      </div>
    );
  }

  const quantity = getItemQuantity(product.id);

  return (
    <div className="product-details-container container">
      <button className="back-btn" onClick={() => router.push('/shop')}>
        <ChevronLeft size={20} /> Back to Shop
      </button>

      <div className="product-details-layout">
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
          {!product.isAvailable && <div className="badge out-of-stock-large">Sold Out</div>}
        </div>

        <div className="product-details-info">
          <h1 className="title">{product.name}</h1>
          <p className="price">₹{product.price}</p>
          <div className="description">
            <p>{product.description}</p>
          </div>

          <div className="add-to-cart-container">
            {quantity > 0 ? (
              <div className="quantity-selector-large">
                <button onClick={() => updateQuantity(product.id, quantity - 1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
              </div>
            ) : (
              <button 
                className={`btn ${product.isAvailable ? 'btn-primary' : 'btn-secondary'} add-to-cart-large`}
                disabled={!product.isAvailable}
                onClick={() => addToCart(product, 1)}
              >
                {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}
            {quantity > 0 && (
              <Link href="/cart" className="view-cart-link">View Cart</Link>
            )}
          </div>
          
          <div className="advantages-section">
            <h3>Why you'll love it</h3>
            <ul>
              {product.advantages.map((adv, idx) => (
                <li key={idx}>{adv}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="recipes-section">
        <h2>Recipe Inspiration</h2>
        <div className="recipe-thumbnails">
          {product.recipes.map((recipe, idx) => (
            <Link href="/blog" key={idx} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <div className="recipe-overlay">
                <span>{recipe.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="health-disclaimer">
        <h3>Health & Safety Note</h3>
        <p>{product.healthDisclaimer}</p>
      </div>
    </div>
  );
}
