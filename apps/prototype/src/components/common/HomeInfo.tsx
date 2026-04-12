import React from 'react';
import { motion } from 'framer-motion';

const cards = [
  {
    title: 'About All-Hands',
    description: 'Learn more about the mission, vision, and team behind All-Hands.',
    imgAlt: 'About All-Hands',
  },
  {
    title: 'Our Community',
    description: 'Connect with other users, join discussions, and share your experience.',
    imgAlt: 'Our Community',
  },
  {
    title: 'Contribute',
    description: 'Find out how you can contribute to the project and make an impact.',
    imgAlt: 'Contribute',
  },
  {
    title: 'Get Support',
    description: 'Need help? Access our support resources and get in touch.',
    imgAlt: 'Get Support',
  },
];

const HomeInfo: React.FC = () => {
  return (
    <div className="flex gap-6 p-6 bg-stone-900 border border-stone-700 rounded-2xl shadow-xl max-w-3xl mx-auto">
      {cards.map((card) => (
        <motion.button
          key={card.title}
          whileHover={{ scale: 1.045, boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18)' }}
          whileTap={{ scale: 0.97 }}
          className="flex flex-col items-start w-64 bg-transparent border-none outline-none cursor-pointer focus:ring-2 focus:ring-yellow-500 rounded-xl p-4 hover:bg-stone-800 transition-colors duration-200"
          tabIndex={0}
          aria-label={card.title}
        >
          <div className="w-full h-28 bg-stone-700 rounded-xl mb-4 flex items-center justify-center">
            {/* Image placeholder, no text */}
          </div>
          <h3 className="w-full text-base font-normal text-stone-200 mb-1 text-left">{card.title}</h3>
          <p className="w-full text-xs font-normal text-stone-400 text-left">{card.description}</p>
        </motion.button>
      ))}
    </div>
  );
};

export default HomeInfo; 