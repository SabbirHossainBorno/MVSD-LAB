module.exports = {
  apps: [
    {
      name: 'next-app',  // You can choose any name for your app
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/mvsd-lab',  // Ensure this path is correct
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
