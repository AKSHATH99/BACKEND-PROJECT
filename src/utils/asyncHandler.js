const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res)).catch((err) => next(err));
  };
};

export { asyncHandler };
