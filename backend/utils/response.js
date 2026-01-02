/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.status - HTTP status code (default: 200)
 * @param {string} options.message - Success message
 * @param {*} options.data - Response data
 * @param {Object} options.meta - Additional metadata (pagination, etc.)
 * @param {Object} options.links - Related links
 * @returns {Object} Express response
 */

const sendResponse = (res, options = {}) => {
  const {
    status = 200,
    message = "Success",
    data = null,
    meta = null,
    links = null,
  } = options;

  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta }),
    ...(links && { links }),
  };

  return res.status(status).json(response);
};

/**
 * Send a successful response with data
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {Object} Express response
 */

const sendData = (
  res,
  data,
  message = "Data retrieved successfully",
  status = 200
) => {
  return sendResponse(res, { status, message, data });
};

/**
 * Send a successful response for created resource
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Express response
 */

const sendCreated = (res, data, message = "Resource created successfully") => {
  return sendResponse(res, { status: 201, message, data });
};

/**
 * Send a successful response for updated resource
 * @param {Object} res - Express response object
 * @param {*} data - Updated resource data
 * @param {string} message - Success message
 * @returns {Object} Express response
 */

const sendUpdated = (res, data, message = "Resource updated successfully") => {
  return sendResponse(res, { status: 200, message, data });
};

/**
 * Send a successful response for deleted resource
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @returns {Object} Express response
 */

const sendDeleted = (res, message = "Resource deleted successfully") => {
  return sendResponse(res, { status: 200, message });
};

/**
 * Send a successful response with pagination
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data
 * @param {Object} pagination - Pagination info
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.total - Total items
 * @param {number} pagination.pages - Total pages
 * @param {string} message - Success message
 * @returns {Object} Express response
 */

const sendPaginated = (
  res,
  data,
  pagination,
  message = "Data retrieved successfully"
) => {
  const { page, limit, total, pages } = pagination;

  const meta = {
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };

  return sendResponse(res, { status: 200, message, data, meta });
};

/**
 * Send a successful response with no content
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @returns {Object} Express response
 */

const sendNoContent = (res, message = "Operation completed successfully") => {
  return res.status(204).json();
};

/**
 * Response status codes for reference
 */

const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  sendResponse,
  sendData,
  sendCreated,
  sendUpdated,
  sendDeleted,
  sendPaginated,
  sendNoContent,
  StatusCodes,
};
