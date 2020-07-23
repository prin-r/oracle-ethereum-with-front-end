const GIF = require('@etherisc/gifcli');

const web3 = require('web3');

/**
 * EStore insurance API
 */
class FddChainlink {
  /**
   * Constructor
   * @param {GenericInsurance} genericInsurance
   * @param {Object} websocket
   * @param {Logger} log
   */
  constructor({websocket, log}) {
    this.websocket = websocket;
    this.log = log;
  }

  /**
   * On application started livecycle hook
   * @return {Promise<void>}
   */
  async bootstrap() {
    this.websocket.setHandler(this.onWsMessage.bind(this));
    this.gif = await GIF.connect();

  }

  /**
   * Handle message form websocket
   * @param {string} client
   * @param {string} payload
   */
  onWsMessage(client, payload) {
    const message = JSON.parse(payload);
    const {id, type, data} = message;
    console.log(message);
    const handler = this[type].bind(this);

    if (!id) {
      this.log.error('Id should be provided', type, message);
    }

    if (!type) {
      this.log.error('Invalid message type', type, message);
      return;
    }

    handler(client, {id, data});
  }

  /**
   * Handle event from contract
   * @param {Event} event
   */
  onContractEvent(event) {
    const {name} = event;

    const handler = this[`on${name}`].bind(this);

    if (!handler) {
      this.log.error('Handler for this event does not exists', event);
      return;
    }

    handler(event);
  }

  /**
   * Handle LogPolicySetState event
   * @param {Event} event
   */
  onLogPolicySetState(event) {
    this.log.info('onLogPolicySetState', event);
  }


  /**
   * Handle LogClaimSetState event
   * @param {Event} event
   */
  onLogClaimSetState(event) {
    this.log.info('onLogClaimSetState', event);
  }

  bytes32(str) {
    return web3.utils.utf8ToHex(str).slice(0, 66).padEnd(66, '0');
  }

  sanitize(bpKey, message) {
    /*
       function applyForPolicy(
            // domain specific
            bytes32 _carrierFlightNumber,
            bytes32 _departureYearMonthDay,
            uint256 _departureTime,
            uint256 _arrivalTime,
            // premium
            uint256 _premium,
            bytes32 _currency,
            uint256[] calldata _payoutOptions,
            // BP
            bytes32 _bpExternalKey
        ) external onlySandbox
     */

    return ([
      this.bytes32(message.data.policy.carrierFlightNumber),     // bytes32 _carrierFlightNumber,
      this.bytes32(message.data.policy.departureYearMonthDay),   // bytes32 _departureYearMonthDay,
      message.data.policy.departureTime,           // uint256 _departureTime,
      message.data.policy.arrivalTime,             // uint256 _arrivalTime,
      1500, // message.data.policy.premium,                 // uint256 _premium,
      this.bytes32(message.data.policy.currency),                // bytes32 _currency,
      message.data.policy.payoutOptions,           // uint256[] calldata _payoutOptions,
      this.bytes32(bpKey)
    ]);

  }

  /**
   * Send newPolicy transaction
   * @param {string} client
   * @param {{}} message
   */
  async newPolicy(client, message) {
    this.log.info('newPolicy', message);

    const customer = await this.gif.customer.create({
      firstname: message.data.customer.firstname,
      lastname: message.data.customer.lastname,
      email: message.data.customer.email
    });

    let bpKey = await this.gif.bp.create({customerId: customer.customerId, data: message.data});
    bpKey = bpKey.bpExternalKey;

    try {

      console.log(this.sanitize(bpKey, message));

      const tx = await this.gif.contract.send(
        'FlightDelayChainlink',
        'applyForPolicy',
        this.sanitize(bpKey, message));

      if (tx.error) {
        this.log.error("GIF ERROR: ", tx.error);
        this.websocket.send(client, {id: message.id, data: {error: tx.error}});
      } else {

        this.websocket.send(client, {id: message.id, data: tx});

      }

    } catch (e) {
      this.log.error(e);
      this.websocket.send(client, {id: message.id, data: {error: e.message}});
    }
  }

  async getPolicies(client, message) {
    this.websocket.send(client, {id: message.id, policies: []});
  }

  async getClaims(client, message) {
    this.websocket.send(client, {id: message.id, claims: []});
  }

  async keepAlive(client, message) {
    this.websocket.send(client, {id: message.id, alive: 'ok'});
  }

}

module.exports = FddChainlink;
