"use client";
import { useState } from 'react';
import menuItems from '../data/menu.json';
import { MenuItem } from '../../types';

interface MenuProps {
  addItemToTable: (item: MenuItem) => void;
}

export default function Menu({ addItemToTable }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Menu</h2>
      <div className="mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`mr-2 mb-2 px-4 py-2 rounded-lg ${
              selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            } hover:bg-blue-400 hover:text-white transition`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg text-gray-800 font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.price.toFixed(2)}</p>
            <button
              onClick={() => addItemToTable({id:item.id, name:item.name, category:item.category, price:item.price, quantity:1})}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Add to Table
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}