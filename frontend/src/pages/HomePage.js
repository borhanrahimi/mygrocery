import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/category/${category.toLowerCase()}`);
  };

  const categories = [
    {
      name: "Fruit",
      image: "https://www.usatoday.com/gcdn/media/2021/05/08/USATODAY/usatsports/imageForEntry35-1sQ.jpg?width=660&height=372&fit=crop&format=pjpg&auto=webp"
    },
    {
      name: "Meat",
      image: "https://static.independent.co.uk/2022/04/18/10/iStock-1212824120.jpg?quality=75&width=1000&crop=3%3A2%2Csmart&auto=webp"
    },
    {
      name: "Bread",
      image: "https://hartfordbaking.com/wp-content/uploads/2017/04/wholesalebreadsuppliers.jpg"
    }
  ];

  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <div key={cat.name} className="category-tile" onClick={() => handleCategoryClick(cat.name)}>
          <img src={cat.image} alt={cat.name} className="category-img" />
          <p className="category-label">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
