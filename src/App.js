import React, { useState, useEffect } from 'react';
import './component/App.css';

function App() {
  const [donations, setDonations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    donationType: 'money',
    otherType: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // load/save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('donations');
    if (saved) setDonations(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (donations.length > 0) {
        localStorage.setItem('donations', JSON.stringify(donations));
    }
  }, [donations]);

  // handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.firstName.trim()) {
      alert('Please enter first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      alert('Please enter last name');
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter valid amount');
      return false;
    }
    if (formData.donationType === 'other' && !formData.otherType.trim()) {
      alert('Please specify what type of donation');
      return false;
    }
    return true;
  };

  // submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setDonations(donations.map(d => 
        d.id === editingId ? { 
          ...formData, 
          id: editingId,
          donorName: `${formData.firstName} ${formData.lastName}`,
          donationType: formData.donationType === 'other' ? formData.otherType : formData.donationType
        } : d
      ));
      setEditingId(null);
    } else {
      setDonations([...donations, { 
        ...formData, 
        id: Date.now(),
        donorName: `${formData.firstName} ${formData.lastName}`,
        donationType: formData.donationType === 'other' ? formData.otherType : formData.donationType
      }]);
    }

    // reset form
    setFormData({
      firstName: '',
      lastName: '',
      donationType: 'money',
      otherType: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // edit donation
  const handleEdit = (donation) => {
    const nameParts = donation.donorName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const standardTypes = ['money', 'food', 'clothing', 'toys', 'supplies'];
    const isCustomType = !standardTypes.includes(donation.donationType);
    
    setFormData({
      ...donation,
      firstName,
      lastName,
      donationType: isCustomType ? 'other' : donation.donationType,
      otherType: isCustomType ? donation.donationType : ''
    });
    setEditingId(donation.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this donation?')) {
      setDonations(donations.filter(d => d.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      donationType: 'money',
      otherType: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // filter donations
  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.donationType === filter);

  // calculate stats
  const totalDonations = filteredDonations.length;
  const totalMoney = filteredDonations
    .filter(d => d.donationType === 'money')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const totalItems = filteredDonations
    .filter(d => d.donationType !== 'money')
    .reduce((sum, d) => sum + parseInt(d.amount), 0);

  return (
    <div className="App">
      <header>
        <h1>Paws and Hearts Donation Tracker</h1>
      </header>

      {/* Donation Form */}
      <section>
        <h2>{editingId ? 'Edit Donation' : 'Add New Donation'}</h2>
        <form onSubmit={handleSubmit} className="donation-form">
          <div>
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
            />
          </div>

          <div>
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
            />
          </div>

          <div>
            <label>Donation Type:</label>
            <select name="donationType" value={formData.donationType} onChange={handleChange}>
              <option value="money">Money</option>
              <option value="food">Food</option>
              <option value="clothing">Clothing</option>
              <option value="toys">Toys</option>
              <option value="supplies">Medical Supplies</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.donationType === 'other' && (
            <div>
              <label>Specify Type:</label>
              <input
                type="text"
                name="otherType"
                value={formData.otherType}
                onChange={handleChange}
                placeholder="e.g., blankets, medicine"
                required
              />
            </div>
          )}

          <div>
            <label>{formData.donationType === 'money' ? 'Amount ($):' : 'Quantity:'}</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step={formData.donationType === 'money' ? '0.01' : '1'}
              required
            />
          </div>

          <div>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button type="submit">
              {editingId ? 'Update' : 'Add'} Donation
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      {/* Filter */}
      <section>
        <h3>Filter Donations</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Donations</option>
          <option value="money">Money</option>
          <option value="food">Food</option>
          <option value="clothing">Clothing</option>
          <option value="toys">Toys</option>
          <option value="supplies">Medical Supplies</option>
          <option value="other">Other</option>
        </select>
      </section>

      {/* Statistics */}
      <section>
        <h3>Statistics</h3>
        <div className="stats">
          <div className="stat">
            <h4>Total Donations</h4>
            <p>{totalDonations}</p>
          </div>
          <div className="stat">
            <h4>Money Donated</h4>
            <p>${totalMoney.toFixed(2)}</p>
          </div>
          <div className="stat">
            <h4>Items Donated</h4>
            <p>{totalItems}</p>
          </div>
        </div>
      </section>

      {/* Donations List */}
      <section>
        <h3>Donations ({filteredDonations.length})</h3>
        {filteredDonations.length === 0 ? (
          <p>No donations found.</p>
        ) : (
          filteredDonations.map(donation => (
            <div key={donation.id} className="donation-item">
              <div>
                <h4>{donation.donorName}</h4>
                <p>Type: {donation.donationType}</p>
                <p>
                  {donation.donationType === 'money' ? 'Amount: $' : 'Quantity: '}
                  {donation.amount}
                </p>
                <p>Date: {donation.date}</p>
              </div>
              <div>
                <button onClick={() => handleEdit(donation)}>Edit</button>
                <button onClick={() => handleDelete(donation.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;