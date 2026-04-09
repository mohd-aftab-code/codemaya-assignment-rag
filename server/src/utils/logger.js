const truncate = (value = "", maxLength = 50) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
};

export const logInfo = (event, metadata = {}) => {
  console.info(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...metadata
    })
  );
};

export const logError = (event, error, metadata = {}) => {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      message: error.message,
      ...metadata
    })
  );
};

export const logAskRequest = ({ userId, question, latency, confidence }) => {
  logInfo("ask_request", {
    userId: userId || "anonymous",
    question: truncate(question),
    latency,
    confidence
  });
};
