module.exports = {
    apps: [
      {
        name: "MVSD",
        script: "npm",
        args: "start",
        instances: 1, // Avoid multi-instance for connection pooling
        env_file: ".env", // Point to your .env file
        env: {
          NODE_ENV: "production", // Additional environment variables if needed
        },
      },
    ],
  };