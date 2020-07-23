import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { darken } from 'polished';
import numeral from 'numeral';


import products from 'products.json';


const Article = styled.article`
  margin: 0 auto;
  width: 900px;
  padding: 100px 20px 20px 20px;
  color: #fff;
`;

const List = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
`;

const Jumbo = styled.div`
  border: 1px solid #e3e7ea;  
  height: 250px;
  background-color: #fff;
`;

const Product = styled.div`
  width: 30%;
  background: #fff; 
  border: 1px solid #e3e7ea;
  text-align: center;
  padding: 20px 0 20px 0;
  color: #000;
  
  img {
    margin: 15px 0;
  }
`;

const BuyBtn = styled.div`
  margin: 10px 0;
  
  a {
    background: #29a06b;
    display: block;
    padding: 10px;
    text-decoration: none;
    font-weight: bold;
    color: #fff;
    margin: 20px 20px 0;
    
    :hover {
      background: ${darken('0.03', '#29a06b')}
    }
  }
`;

/**
 * Catalog page
 * @return {*}
 * @constructor
 */
const Catalog = () => {

  const etherisc_logo = "/assets/800px-Chainlink_logo.jpg";
  const chainlink_logo = "/assets/2019_Etherisc_Logo_black.png";

  const items = products.map(item => (
    <Product key={item.vendorCode}>
      <h3>{item.product}</h3>
      <div style={{"height": "150px"}}>
        <span style={{"height": "100%", "verticalAlign": "middle", "display": "inline-block"}}></span>
        <img src={item.image} style={{"verticalAlign": "middle"}} width="200" alt={item.product} />
      </div>
      <div>Date: {item.date}</div>
      <div>Departure: {item.departure}</div>
      <div>Arrival: {item.arrival}</div>
      <div>Price: <b>{numeral(item.price).format('0,0.00')}</b> {item.currency}</div>

      <BuyBtn>
        <Link to={`/checkout/${item.vendorCode}`}>Buy</Link>
      </BuyBtn>
    </Product>
  ));

  return (
    <Article>
      <Helmet>
        <title>Catalog</title>
      </Helmet>

      <Jumbo>
        <span style={{"height": "100%", "verticalAlign": "middle", "display": "inline-block"}}></span>
        <img src={etherisc_logo} style={{"verticalAlign": "middle"}} width="400"  />
        <img src={chainlink_logo} style={{"verticalAlign": "middle"}} width="400" />
      </Jumbo>

      <h1>Flight Delay Demo</h1>

      This is a demo of the FlightDelay Integration of Chainlink with the Etherisc Generic Insurance Framework (GIF).



      <h2>Select flight:</h2>
      <List>
        {items}
      </List>

      <h4>We will enable Flight Search soon!</h4>
    </Article>
  );
};

export default Catalog;
