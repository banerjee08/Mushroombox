import './Footer.css';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Leaf size={24} /> Mushroombox
          </div>
          <p>Fresh, organic Oyster mushrooms delivered from our farm right to your doorstep in Delhi NCR.</p>
          <div className="connect-socially-wrapper" style={{ marginTop: '24px' }}>
            <h4 style={{ color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.9rem' }}>Connect Socially</h4>
            <div className="social-icons" style={{ display: 'flex', gap: '15px' }}>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="#" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.85 6.4 9.1-.1-.78-.18-1.98.04-2.83.2-.77 1.34-5.6 1.34-5.6s-.34-.68-.34-1.68c0-1.57.9-2.75 2.04-2.75 1 0 1.48.74 1.48 1.63 0 1-.64 2.5-.96 3.9-.27 1.15.58 2.08 1.7 2.08 2.04 0 3.6-2.16 3.6-5.28 0-2.76-2-4.7-4.83-4.7-3.3 0-5.25 2.48-5.25 5.05 0 .96.37 1.98.83 2.54.09.1.1.2.07.32l-.27 1.1c-.04.14-.14.17-.28.1-1.04-.5-1.7-2.06-1.7-3.32 0-2.7 1.95-5.18 5.65-5.18 2.97 0 5.28 2.12 5.28 4.96 0 2.95-1.86 5.33-4.44 5.33-1.15 0-2.22-.6-2.58-1.3l-.7 2.68c-.26 1-.94 2.25-1.4 3.02C10.53 23.82 11.25 24 12 24c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path></svg>
              </a>
              <a href="#" aria-label="Snapchat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-2-2-4-2-4-2-4.5-4c-.38-1.52.5-3 1.5-3s2-.5 2-1 0-2-1.5-3c-1.5-1-1.5-3 0-5s4.5-2 4.5-2 3 0 4.5 2 1.5 4 0 5c-1.5 1-1.5 1.5 0 2s2 1.5 2 3c0.5 1 1.5 2.5 1.5 4-0.5 2-2.5 2-4.5 4-2 0-4 2-4 2z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><a href="/shop">Oyster Mushrooms</a></li>
            <li><a href="#">Grow Kits</a></li>
            <li><a href="#">Subscription</a></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="#">Recipes</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Mushroombox. All rights reserved.</p>
      </div>
    </footer>
  );
}
