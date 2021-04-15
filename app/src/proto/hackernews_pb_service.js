// package: grpc_web_hacker_news
// file: proto/hackernews.proto

var proto_hackernews_pb = require("../proto/hackernews_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var HackerNewsService = (function () {
  function HackerNewsService() {}
  HackerNewsService.serviceName = "grpc_web_hacker_news.HackerNewsService";
  return HackerNewsService;
}());

HackerNewsService.ListStories = {
  methodName: "ListStories",
  service: HackerNewsService,
  requestStream: false,
  responseStream: true,
  requestType: proto_hackernews_pb.ListStoriesRequest,
  responseType: proto_hackernews_pb.ListStoriesResponse
};

exports.HackerNewsService = HackerNewsService;

function HackerNewsServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

HackerNewsServiceClient.prototype.listStories = function listStories(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(HackerNewsService.ListStories, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

exports.HackerNewsServiceClient = HackerNewsServiceClient;

