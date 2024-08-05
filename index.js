// #App Component

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import DestinationDetail from './components/DestinationDetail';
import AdminForm from './components/AdminForm';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <Router>
        <div className="app">
          <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/destination/:id" component={DestinationDetail} />
            <Route path="/admin" component={AdminForm} />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;




// #Home Component


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState([0, 1000]);

  useEffect(() => {
    axios.get('/path-to-your-db.json')
      .then(response => setDestinations(response.data));
  }, []);

  const filteredDestinations = destinations
    .filter(destination => destination.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(destination => !countryFilter || destination.country === countryFilter)
    .filter(destination => destination.budget >= budgetFilter[0] && destination.budget <= budgetFilter[1]);

  return (
    <div className="home">
      <input type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <select onChange={e => setCountryFilter(e.target.value)}>
        <option value="">All Countries</option>
        {Array.from(new Set(destinations.map(d => d.country))).map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      <div className="budget-filters">
        <label>Budget: </label>
        <input type="range" min="0" max="1000" value={budgetFilter[0]} onChange={e => setBudgetFilter([Number(e.target.value), budgetFilter[1]])} />
        <input type="range" min="0" max="1000" value={budgetFilter[1]} onChange={e => setBudgetFilter([budgetFilter[0], Number(e.target.value)])} />
      </div>
      
      <div className="cards">
        {filteredDestinations.map(destination => (
          <Link to={`/destination/${destination.id}`} key={destination.id}>
            <div className="card">
              <img src={destination.image} alt={destination.name} />
              <h3>{destination.name}</h3>
              <p>{destination.country}</p>
              <p>${destination.budget}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};




// #DestinationDetail Component :-

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './DestinationDetail.css';

const DestinationDetail = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    axios.get(`/path-to-your-db.json`)
      .then(response => {
        const foundDestination = response.data.find(dest => dest.id === id);
        setDestination(foundDestination);
      });
  }, [id]);

  if (!destination) return <div>Loading...</div>;

  return (
    <div className="destination-detail">
      <h2>{destination.name}</h2>
      <img src={destination.image} alt={destination.name} />
      <div className="additional-images">
        <img src={destination.additionalImage1} alt={`${destination.name} view 1`} />
        <img src={destination.additionalImage2} alt={`${destination.name} view 2`} />
      </div>
      <p>{destination.description}</p>
      <p>Country: {destination.country}</p>
      <p>Budget: ${destination.budget}</p>
    </div>
  );
};




// #AdminForm Component

import React, { useState } from 'react';
import database from '../firebaseConfig';
import './AdminForm.css';

const AdminForm = () => {
  const [destination, setDestination] = useState({
    name: '', image: '', additionalImage1: '', additionalImage2: '',
    description: '', country: '', budget: 0
  });

  const handleChange = e => setDestination({ ...destination, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    database.ref('destinations').push(destination);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <input type="text" name="name" value={destination.name} onChange={handleChange} placeholder="Name" required />
      <input type="text" name="image" value={destination.image} onChange={handleChange} placeholder="Image URL" required />
      <input type="text" name="additionalImage1" value={destination.additionalImage1} onChange={handleChange} placeholder="Additional Image 1 URL" />
      <input type="text" name="additionalImage2" value={destination.additionalImage2} onChange={handleChange} placeholder="Additional Image 2 URL" />
      <textarea name="description" value={destination.description} onChange={handleChange} placeholder="Description" required></textarea>
      <input type="text" name="country" value={destination.country} onChange={handleChange} placeholder="Country" required />
      <input type="number" name="budget" value={destination.budget} onChange={handleChange} placeholder="Budget" required />
      <button type="submit">Submit</button>
    </form>
  );
};
