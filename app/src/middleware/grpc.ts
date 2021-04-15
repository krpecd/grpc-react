import { Action, AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { grpc } from 'grpc-web-client';
import { TransportFactory } from 'grpc-web-client/dist/typings/transports/Transport';
import { Metadata } from 'grpc-web-client/dist/typings/metadata';
import { Code } from 'grpc-web-client/dist/typings/Code';
import { ProtobufMessage } from 'grpc-web-client/dist/typings/message';

const GRPC_WEB_REQUEST = 'GRPC_WEB_REQUEST';

// Descriptor of a grpc-web payload
// life-cycle methods mirror grpc-web but allow for an action to be dispatched when triggered
export type GrpcActionPayload<RequestType extends ProtobufMessage, ResponseType extends ProtobufMessage> = {
  // The method descriptor to use for a gRPC request, equivalent to grpc.invoke(methodDescriptor, ...)
  methodDescriptor: grpc.MethodDefinition<RequestType, ResponseType>,
  // The transport to use for grpc-web, automatically selected if empty
  transport?: TransportFactory,
  // toggle debug messages
  debug?: boolean,
  // the URL of a host this request should go to
  host: string,
  // An instance of of the request message
  request: RequestType,
  // Additional metadata to attach to the request, the same as grpc-web
  metadata?: Metadata.ConstructorArg,
  // Called immediately before the request is started, useful for toggling a loading status
  onStart?: () => Action | void,
  // Called when response headers are received
  onHeaders?: (headers: Metadata) => Action | void,
  // Called on each incoming message
  onMessage?: (res: ResponseType) => Action | void,
  // Called at the end of a request, make sure to check the exit code
  onEnd: (code: Code, message: string, trailers: Metadata) => Action | void,
};

// Basic type for a gRPC Action
export type GrpcAction<RequestType extends ProtobufMessage, ResponseType extends ProtobufMessage> = {
  type: typeof GRPC_WEB_REQUEST,
  payload: GrpcActionPayload<RequestType, ResponseType>,
};

// Action creator, Use it to create a new grpc action
export function grpcRequest<RequestType extends ProtobufMessage, ResponseType extends ProtobufMessage>(
  payload: GrpcActionPayload<RequestType, ResponseType>
): GrpcAction<RequestType, ResponseType> {
  return {
    type: GRPC_WEB_REQUEST,
    payload,
  };
}

/* tslint:disable:no-any*/
export function newGrpcMiddleware(): Middleware {
  return ({getState, dispatch}: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: any) => {
    // skip non-grpc actions
    if (!isGrpcWebUnaryAction(action)) {
      return next(action);
    }

    const payload = action.payload;

    if (payload.onStart) {
      payload.onStart();
    }

    grpc.invoke(payload.methodDescriptor, {
      debug: payload.debug,
      host: payload.host,
      request: payload.request,
      metadata: payload.metadata,
      transport: payload.transport,
      onHeaders: headers => {
        if (!payload.onHeaders) { return; }
        const actionToDispatch = payload.onHeaders(headers);
        return actionToDispatch && dispatch(actionToDispatch);
      },
      onMessage: res => {
        if (!payload.onMessage) { return; }
        const actionToDispatch = payload.onMessage(res);
        return actionToDispatch && dispatch(actionToDispatch);
      },
      onEnd: (code, msg, trailers) => {
        const actionToDispatch = payload.onEnd(code, msg, trailers);
        return actionToDispatch && dispatch(actionToDispatch);
      },
    });

    return next(action);
  };
}

function isGrpcWebUnaryAction(action: any): action is GrpcAction<ProtobufMessage, ProtobufMessage> {
  return action && action.type && action.type === GRPC_WEB_REQUEST && isGrpcWebPayload(action);
}

function isGrpcWebPayload(action: any): boolean {
  return action &&
    action.payload &&
    action.payload.methodDescriptor &&
    action.payload.request &&
    action.payload.onEnd &&
    action.payload.host;
}

/* tslint:enable:no-any*/
