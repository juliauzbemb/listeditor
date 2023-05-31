// eslint-disable-next-line
const webpack = require("webpack");
// eslint-disable-next-line
const WebpackDevServer = require("webpack-dev-server");
// eslint-disable-next-line
const config = require("../webpack.dev");

const server = new WebpackDevServer(webpack(config), {});
server.listen(9000, "localhost", (err) => {
  if (err) {
    return;
  }
  //   eslint-disable-next-line
  if (process.send) {
    // eslint-disable-next-line
    process.send("ok");
  }
});
