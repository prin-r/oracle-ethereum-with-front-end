import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { StripeProvider, Elements } from 'react-stripe-elements';
import products from 'products.json';
import numeral from 'numeral';
import CardForm from './form';


const Article = styled.article`
  padding: 100px 20px 20px;
  width: 900px;
  margin: 0 auto;
  color: #fff;

`;

const Product = styled.div`
  display: flex;
  color: #000;
`;

const Details = styled.div`
  flex-glow: 1;
  padding-left: 20px;
  color: #fff;
`;

const CheckoutForm = styled.div`
  padding: 20px;
  border: 2px solid #39a065;
  background: #fff;
  margin-top: 30px;
  border-radius: 4px;
  color: #000;
`;

const Option = styled.div`
  margin-bottom: 8px;
  
  span {
    margin-left: 10px;
  }
`;

const Purchase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  color: #fff;
`;

/**
 * Checkout page
 */
class Checkout extends Component {
  state = {
    insurance: 1,
    insuranceOptions: [
      { label: 'No', price: 0 },
      { label: '1 year', price: 10 },
      { label: '2 year', price: 15 },
      { label: '3 year', price: 20 },
    ],
    product: products.find((p) => {
      const { match: { params: { vendorCode } } } = this.props;
      return p.vendorCode === vendorCode;
    }),

    loading: false,

    purchase: null,
  };

  static propTypes = {
    request: PropTypes.func.isRequired,
    match: PropTypes.shape().isRequired,
  };

  /**
   * Calculate total sum
   * @param {number} value
   * @return {number}
   */
  getTotal(value) {
    const price = Number(value);
    const { insuranceOptions, insurance } = this.state;

    return price * (1 + insuranceOptions[insurance].price / 100);
  }


  /**
   * Submit checkout form
   * @param {{}} data
   */
  handleSubmit = (data) => {
    const { insurance, product, insuranceOptions } = this.state;
    const { request } = this.props;

    this.setState({ loading: true });

    if (insurance) {
      const input = {
        customer: {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
        },
        policy: {
          carrierFlightNumber: product.carrierFlightNumber,
          departureYearMonthDay: product.departureYearMonthDay,
          departureTime: product.departureTime,
          arrivalTime: product.arrivalTime,
          payoutOptions: product.payoutOptions,
          premium: product.price,
          currency: product.currency,
        },
      };

      request('newPolicy', input)
        .then((result) => {
          console.log(result);
          this.setState({
            loading: false,
            purchase: {
              product: {
                vendorCode: product.vendorCode,
                product: product.product,
              },
              policy: {
                // id: result.events.LogPolicySetState.returnValues._policyId,
                transactionHash: result.data.transactionHash,
              },
            },
          });
        });
    } else {
      this.setState({
        loading: false,
        purchase: {
          product: {
            vendorCode: product.vendorCode,
            product: product.product,
          },
        },
      });
    }
  };

  /**
   * Render component
   * @return {*}
   */
  render() {

    const {
      insurance, insuranceOptions, product, loading, purchase,
    } = this.state;

    const NETWORK = 'rinkeby';
    const etherscanUrl = NETWORK === 'mainnet' ? 'https://etherscan.io' : `https://${NETWORK}.etherscan.io`;

    return (
      <Article>
        <Helmet>
          <title>Checkout</title>
        </Helmet>

        <Product>
          <div style={{"height": "150px"}}>
            <span style={{"height": "100%", "verticalAlign": "middle", "display": "inline-block"}}></span>
            <img src={product.image} style={{"maxHeight": "150px", "verticalAlign": "middle"}} width="200" alt={product.product} />
          </div>

          <Details>
            <h2>{product.product}</h2>
            <p>{product.details}</p>
            <p>Date: {product.date}</p>
            <p>Departure: {product.departure}</p>
            <p>Arrival: {product.arrival}</p>

            <p>
              <b>
                Price: {numeral(product.price).format('0,0.00')} {product.currency}
              </b>
            </p>
          </Details>
        </Product>

        {!loading && !purchase && (
          <CheckoutForm>
            <h3>Checkout</h3>

            <h4>Total: {numeral(this.getTotal(product.price)).format('0,0.00')} {product.currency}</h4>

            <StripeProvider apiKey="pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ">
              <Elements>
                <CardForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
              </Elements>
            </StripeProvider>
            <p><small>For the demo, use card no. 4000 0566 5566 5556 Valid 12/20 CVC 311</small></p>
          </CheckoutForm>
        )}

        {loading && !purchase && (
          <Purchase>
            <img src="/assets/preloader.gif" alt="Preloader" />
          </Purchase>
        )}

        {!loading && purchase && (
        <div style={{ textAlign: 'center' }}>
          <h3>Congratulations!</h3>
          <p><b>Your purchase:</b></p>
          <p>Product: {product.product}</p>

          {purchase.policy && (
          <div>
            {/*
            <p><b>Policy ID:</b></p>
            <p>{purchase.policy.id}</p>
            */}
            <p>
              <a href={`${etherscanUrl}/tx/${purchase.policy.transactionHash}`} target="_blank" rel="noopener noreferrer">
                Transaction
              </a>
            </p>
          </div>
          )}
        </div>
        )}

      </Article>
    );
  }
}

export default Checkout;
