const { bootstrap } = require('@etherisc/microservice');
const FddChainlink = require('./FddChainlink');


bootstrap(FddChainlink, {
  httpDevPort: 3010,
  websocket: true,
});
