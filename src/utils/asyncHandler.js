const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res)).catch((err) => next(err));
  };
};

export default asyncHandler;
