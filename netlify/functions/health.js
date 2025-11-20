exports.handler = async (event, context) => {
  console.log("Health check function called");
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      status: "success",
      message: "Health check function is working!",
      timestamp: new Date().toISOString(),
      function: "health"
    })
  };
};